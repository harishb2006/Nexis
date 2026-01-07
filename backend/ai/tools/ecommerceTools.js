import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Order from "../../model/order.js";
import Product from "../../model/product.js";
import User from "../../model/user.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to DB if not already connected
async function ensureDBConnection() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_URL);
  }
}

/**
 * Tool 1: Check Order Status
 * Takes an orderId and returns order details
 */
export const checkOrderTool = tool(
  async ({ orderId }) => {
    await ensureDBConnection();

    try {
      const order = await Order.findById(orderId)
        .populate('orderItems.product', 'name category')
        .populate('user', 'name email')
        .lean();

      if (!order) {
        return JSON.stringify({
          success: false,
          message: `Order #${orderId} not found. Please check the order ID.`
        });
      }

      return JSON.stringify({
        success: true,
        orderId: order._id,
        status: order.orderStatus,
        totalAmount: order.totalAmount,
        items: order.orderItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt || 'Not delivered yet'
      });
    } catch (error) {
      console.error('Order lookup error:', error);
      if (error.name === 'CastError') {
        return JSON.stringify({
          success: false,
          message: 'Invalid order ID format. Please provide a valid order ID.'
        });
      }
      return JSON.stringify({
        success: false,
        message: `Error checking order status: ${error.message}`
      });
    }
  },
  {
    name: "check_order",
    description: "Check the status and details of a customer order. Use this when the customer asks about their order status, delivery status, or order details. Requires the order ID.",
    schema: z.object({
      orderId: z.string().describe("The order ID to check. Must be a valid MongoDB ObjectId string.")
    })
  }
);

/**
 * Tool 2: Product Lookup by Category
 * Returns top products in a category
 */
export const productLookupTool = tool(
  async ({ category, limit = 5 }) => {
    await ensureDBConnection();

    try {
      // Find products in the category, sorted by stock (popular items)
      const products = await Product.find({ 
        category: { $regex: new RegExp(category, 'i') } 
      })
        .select('name description price category stock')
        .sort({ stock: -1 }) // Items with more stock are popular
        .limit(limit)
        .lean();

      if (products.length === 0) {
        return JSON.stringify({
          success: false,
          message: `No products found in the "${category}" category. Available categories can be checked.`
        });
      }

      return JSON.stringify({
        success: true,
        category,
        count: products.length,
        products: products.map(p => ({
          id: p._id,
          name: p.name,
          description: p.description.substring(0, 100) + '...',
          price: `$${p.price}`,
          stock: p.stock > 0 ? 'In Stock' : 'Out of Stock',
          category: p.category
        }))
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error looking up products. Please try again.'
      });
    }
  },
  {
    name: "product_lookup",
    description: "Search for products by category and get top-selling or popular items. Use this when customers ask about products, what's available, recommendations, or best sellers in a category.",
    schema: z.object({
      category: z.string().describe("The product category to search (e.g., 'electronics', 'clothing', 'books')"),
      limit: z.number().optional().default(5).describe("Maximum number of products to return (default: 5)")
    })
  }
);

/**
 * Tool 3: Get Available Categories
 * Returns all unique product categories
 */
export const getCategoriesTool = tool(
  async () => {
    await ensureDBConnection();

    try {
      const categories = await Product.distinct('category');
      
      return JSON.stringify({
        success: true,
        count: categories.length,
        categories: categories.sort()
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error fetching categories.'
      });
    }
  },
  {
    name: "get_categories",
    description: "Get all available product categories in the store. Use this when customers ask what categories are available or what types of products you sell.",
    schema: z.object({})
  }
);

// Export all tools as an array
export const ecommerceTools = [
  checkOrderTool,
  productLookupTool,
  getCategoriesTool
];
