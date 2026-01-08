import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Order from "../../model/order.js";
import Product from "../../model/product.js";
import User from "../../model/user.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { retrieveRelevantChunks } from "../../rag/retriever.js";
import { MemoryService } from "../services/memoryService.js";

dotenv.config();

// Connect to DB if not already connected
async function ensureDBConnection() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_URL);
  }
}

/**
 * Tool 1: Check Order Status
 */
export const checkOrderTool = tool(
  async ({ orderId, userId = null }) => {
    await ensureDBConnection();

    try {
      // Validate MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return JSON.stringify({
          success: false,
          message: 'Invalid order ID format. Please provide a valid order ID.'
        });
      }

      const order = await Order.findById(orderId)
        .populate('user', 'name email')
        .lean();

      if (!order) {
        return JSON.stringify({
          success: false,
          message: `Order #${orderId.slice(-6)} not found. Please verify the order ID.`
        });
      }

      // Check ownership if userId provided
      if (userId && order.user._id.toString() !== userId) {
        return JSON.stringify({
          success: false,
          message: 'Access denied. You can only view your own orders.'
        });
      }

      return JSON.stringify({
        success: true,
        orderId: order._id,
        status: order.orderStatus,
        totalAmount: `$${order.totalAmount}`,
        itemCount: order.orderItems.length,
        customerEmail: order.user?.email || 'N/A',
        shippingCity: order.shippingAddress.city,
        shippingCountry: order.shippingAddress.country,
        createdAt: new Date(order.createdAt).toLocaleDateString(),
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Not delivered yet'
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Invalid order ID format'
      });
    }
  },
  {
    name: "check_order",
    description: "Check order status and details. Use when customer asks about their order.",
    schema: z.object({
      orderId: z.string().describe("The order ID"),
      userId: z.string().optional().describe("The authenticated user ID for ownership verification")
    })
  }
);

/**
 * Tool 2: Update Order Status
 */
export const updateOrderStatusTool = tool(
  async ({ orderId, newStatus, userId = null }) => {
    await ensureDBConnection();

    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return JSON.stringify({
          success: false,
          message: 'Invalid order ID format'
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return JSON.stringify({
          success: false,
          message: `Order not found`
        });
      }

      // Check if status transition is valid
      const validTransitions = {
        'Processing': ['Shipped', 'Cancelled'],
        'Shipped': ['Delivered', 'Cancelled'],
        'Delivered': [],
        'Cancelled': []
      };
      
      if (!validTransitions[order.orderStatus].includes(newStatus)) {
        return JSON.stringify({
          success: false,
          message: `Cannot change order from ${order.orderStatus} to ${newStatus}`
        });
      }

      order.orderStatus = newStatus;
      if (newStatus === 'Delivered') {
        order.deliveredAt = new Date();
      }
      await order.save();

      return JSON.stringify({
        success: true,
        message: `Order status updated to ${newStatus}`,
        orderId: order._id,
        newStatus: order.orderStatus
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Failed to update order status'
      });
    }
  },
  {
    name: "update_order_status",
    description: "Update an order's status. Use when customer or admin wants to change order status (Processing, Shipped, Delivered, Cancelled).",
    schema: z.object({
      orderId: z.string().describe("The order ID to update"),
      newStatus: z.enum(['Processing', 'Shipped', 'Delivered', 'Cancelled']).describe("New status for the order")
    })
  }
);

/**
 * Tool 3: Search Products
 */
export const searchProductsTool = tool(
  async ({ query, category, limit = 5 }) => {
    await ensureDBConnection();

    try {
      let filter = {};
      
      // Build query filter
      if (query && category) {
        // Search in both name and description with category filter
        filter = {
          $and: [
            {
              $or: [
                { name: { $regex: new RegExp(query, 'i') } },
                { description: { $regex: new RegExp(query, 'i') } },
                { category: { $regex: new RegExp(query, 'i') } }
              ]
            },
            { category: { $regex: new RegExp(category, 'i') } }
          ]
        };
      } else if (query) {
        // Search in name, description, or category
        filter = {
          $or: [
            { name: { $regex: new RegExp(query, 'i') } },
            { description: { $regex: new RegExp(query, 'i') } },
            { category: { $regex: new RegExp(query, 'i') } }
          ]
        };
      } else if (category) {
        // Filter by category only
        filter.category = { $regex: new RegExp(category, 'i') };
      }

      const products = await Product.find(filter)
        .select('name category price stock description')
        .limit(limit)
        .lean();

      if (products.length === 0) {
        return JSON.stringify({
          success: false,
          message: `No products found matching your search`
        });
      }

      return JSON.stringify({
        success: true,
        count: products.length,
        products: products.map(p => ({
          id: p._id,
          name: p.name,
          category: p.category,
          description: p.description,
          price: `$${p.price}`,
          inStock: p.stock > 0,
          stockCount: p.stock
        }))
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error searching products'
      });
    }
  },
  {
    name: "search_products",
    description: "Search for products by name, description, or category. Use when customer asks about products, wants to browse, or looking for something specific. Searches across product names, descriptions, and categories.",
    schema: z.object({
      query: z.string().optional().describe("Search term to look for in product name, description, or category (e.g., 'shoes', 'iPhone', 'running')"),
      category: z.string().optional().describe("Category to filter by (Electronics, Fashion, etc)"),
      limit: z.number().optional().default(5).describe("Max products to return")
    })
  }
);

/**
 * Tool 4: Update Product Stock
 */
export const updateProductStockTool = tool(
  async ({ productId, newStock }) => {
    await ensureDBConnection();

    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return JSON.stringify({
          success: false,
          message: 'Invalid product ID format'
        });
      }

      // Validate stock is non-negative
      if (newStock < 0) {
        return JSON.stringify({
          success: false,
          message: 'Stock quantity cannot be negative'
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return JSON.stringify({
          success: false,
          message: 'Product not found'
        });
      }

      product.stock = newStock;
      await product.save();

      return JSON.stringify({
        success: true,
        message: `Stock updated for ${product.name}`,
        productName: product.name,
        newStock: product.stock
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Failed to update stock'
      });
    }
  },
  {
    name: "update_product_stock",
    description: "Update product inventory/stock. Use when admin wants to adjust stock levels or mark items as out of stock.",
    schema: z.object({
      productId: z.string().describe("The product ID to update"),
      newStock: z.number().describe("New stock quantity")
    })
  }
);

/**
 * Tool 5: Get All Orders
 */
export const getAllOrdersTool = tool(
  async ({ status, limit = 10 }) => {
    await ensureDBConnection();

    try {
      let filter = {};
      if (status) {
        filter.orderStatus = status;
      }

      const orders = await Order.find(filter)
        .populate('user', 'name email')
        .select('_id orderStatus totalAmount createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return JSON.stringify({
        success: true,
        count: orders.length,
        orders: orders.map(o => ({
          orderId: o._id,
          status: o.orderStatus,
          amount: `$${o.totalAmount}`,
          customer: o.user?.name || 'N/A',
          date: new Date(o.createdAt).toLocaleDateString()
        }))
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error fetching orders'
      });
    }
  },
  {
    name: "get_all_orders",
    description: "Get list of all orders, optionally filtered by status. Use when admin wants to see orders or check pending/shipped orders. ADMIN ONLY.",
    schema: z.object({
      status: z.enum(['Processing', 'Shipped', 'Delivered', 'Cancelled']).optional().describe("Filter by order status"),
      limit: z.number().optional().default(10).describe("Max orders to return")
    })
  }
);

/**
 * Tool 5b: Get My Orders (User-Specific)
 */
export const getMyOrdersTool = tool(
  async ({ userId, status, limit = 10 }) => {
    await ensureDBConnection();

    try {
      if (!userId) {
        return JSON.stringify({
          success: false,
          message: 'User authentication required to view your orders'
        });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return JSON.stringify({
          success: false,
          message: 'Invalid user ID format'
        });
      }

      let filter = { user: userId };
      if (status) {
        filter.orderStatus = status;
      }

      const orders = await Order.find(filter)
        .select('_id orderStatus totalAmount orderItems createdAt deliveredAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      if (orders.length === 0) {
        return JSON.stringify({
          success: true,
          count: 0,
          message: 'No orders found',
          orders: []
        });
      }

      return JSON.stringify({
        success: true,
        count: orders.length,
        orders: orders.map(o => ({
          orderId: o._id,
          status: o.orderStatus,
          amount: `$${o.totalAmount}`,
          items: o.orderItems.length,
          orderDate: new Date(o.createdAt).toLocaleDateString(),
          delivered: o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : 'Not yet delivered'
        }))
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error fetching your orders',
        error: error.message
      });
    }
  },
  {
    name: "get_my_orders",
    description: "Get the authenticated user's orders, optionally filtered by status. Use when customer asks 'show my orders', 'where are my orders', or 'my order history'.",
    schema: z.object({
      userId: z.string().describe("The authenticated user's ID"),
      status: z.enum(['Processing', 'Shipped', 'Delivered', 'Cancelled']).optional().describe("Filter by order status"),
      limit: z.number().optional().default(10).describe("Max orders to return")
    })
  }
);

/**
 * Tool 6: Check Refund Eligibility (Multi-Step Tool)
 * This demonstrates complex agentic reasoning:
 * 1. Fetch order from database
 * 2. Query return policy from RAG
 * 3. Perform date calculations
 * 4. Apply business logic
 */
export const checkRefundEligibilityTool = tool(
  async ({ orderId, userId = null }) => {
    await ensureDBConnection();

    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return JSON.stringify({
          success: false,
          message: 'Invalid order ID format. Please provide a valid order ID.'
        });
      }

      // Step 1: Get order from database
      const order = await Order.findById(orderId).populate('user').lean();

      if (!order) {
        return JSON.stringify({
          success: false,
          message: 'Order not found. Please verify the order ID.'
        });
      }

      // Check ownership
      if (userId && order.user._id.toString() !== userId) {
        return JSON.stringify({
          success: false,
          message: 'Access denied. You can only check refund eligibility for your own orders.'
        });
      }

      // Step 2: Query return policy from RAG
      const policyChunks = await retrieveRelevantChunks("return eligibility requirements", 2);
      
      // Extract return window from policy (looking for "30 days" pattern)
      const policyText = policyChunks.map(c => c.content).join(' ');
      const returnWindowMatch = policyText.match(/(\d+)\s*days?/i);
      const returnWindowDays = returnWindowMatch ? parseInt(returnWindowMatch[1]) : 30;

      // Step 3: Date calculations
      const orderDate = new Date(order.createdAt);
      const currentDate = new Date();
      const daysSinceOrder = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = returnWindowDays - daysSinceOrder;

      // Step 4: Apply business logic
      const isEligible = daysSinceOrder <= returnWindowDays && order.orderStatus !== 'Cancelled';
      
      // Check for non-returnable conditions
      const nonReturnableReasons = [];
      if (order.orderStatus === 'Cancelled') {
        nonReturnableReasons.push('Order has been cancelled');
      }
      if (daysSinceOrder > returnWindowDays) {
        nonReturnableReasons.push(`Return window expired (${daysSinceOrder} days since order)`);
      }

      return JSON.stringify({
        success: true,
        orderId: order._id,
        eligible: isEligible,
        orderDate: orderDate.toLocaleDateString(),
        daysSinceOrder,
        returnWindowDays,
        daysRemaining: isEligible ? daysRemaining : 0,
        orderStatus: order.orderStatus,
        orderAmount: `$${order.totalAmount}`,
        reasons: nonReturnableReasons.length > 0 ? nonReturnableReasons : ['All eligibility criteria met'],
        policyReference: `Items must be returned within ${returnWindowDays} days in original packaging`,
        nextSteps: isEligible 
          ? 'Contact support to initiate return. Keep original packaging and receipt ready.'
          : 'Unfortunately, this order is not eligible for return based on our policy.'
      });
    } catch (error) {
      console.error('Error checking refund eligibility:', error);
      return JSON.stringify({
        success: false,
        message: 'Failed to check refund eligibility',
        error: error.message
      });
    }
  },
  {
    name: "check_refund_eligibility",
    description: "Check if an order is eligible for refund/return. Performs multi-step analysis: fetches order details, checks return policy, calculates time windows, and applies business rules. Use when customer asks about returns, refunds, or if they can send something back.",
    schema: z.object({
      orderId: z.string().describe("The order ID to check refund eligibility for")
    })
  }
);

/**
 * Tool 7: Escalate to Human Support
 * Triggers when customer is frustrated or issue requires human intervention
 */
export const escalateToHumanTool = tool(
  async ({ reason, threadId = null, urgency = 'medium' }) => {
    try {
      let briefing = null;

      // If we have a threadId, generate a briefing note
      if (threadId) {
        try {
          briefing = await MemoryService.generateBriefing(threadId);
          await MemoryService.escalateThread(threadId, reason);
        } catch (error) {
          console.error('Error generating briefing:', error);
        }
      }

      // In production, this would:
      // 1. Create a support ticket
      // 2. Send notification to support team
      // 3. Email customer with ticket number
      // 4. Add to support queue with priority

      return JSON.stringify({
        success: true,
        ticketId: `TICKET-${Date.now()}`, // Mock ticket ID
        message: 'Your issue has been escalated to our support team',
        reason,
        urgency,
        estimatedResponseTime: urgency === 'high' ? '15 minutes' : '1 hour',
        nextSteps: 'A support specialist will contact you shortly via email or chat',
        briefing: briefing ? {
          conversationDuration: briefing.duration,
          messageCount: briefing.messageCount,
          summary: briefing.summary,
          sentiment: briefing.sentiment
        } : null
      });
    } catch (error) {
      console.error('Error escalating to human:', error);
      return JSON.stringify({
        success: false,
        message: 'Failed to escalate issue',
        error: error.message
      });
    }
  },
  {
    name: "escalate_to_human",
    description: "Escalate the conversation to a human support agent. Use when: customer expresses frustration/anger, requests to speak to manager, issue is too complex for AI, or customer explicitly asks for human help. Always explain why escalation is needed.",
    schema: z.object({
      reason: z.string().describe("Why the conversation needs human intervention (e.g., 'customer frustrated', 'complex issue requiring manager', 'technical problem beyond AI capability')"),
      threadId: z.string().optional().describe("The conversation thread ID for generating briefing"),
      urgency: z.enum(['low', 'medium', 'high']).optional().default('medium').describe("Priority level for support team")
    })
  }
);

// Export all tools as an array
export const ecommerceTools = [
  checkOrderTool,
  getMyOrdersTool,
  updateOrderStatusTool,
  searchProductsTool,
  updateProductStockTool,
  getAllOrdersTool,
  checkRefundEligibilityTool,
  escalateToHumanTool
];
