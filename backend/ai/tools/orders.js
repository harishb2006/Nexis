/**
 * Order Tools
 * Tools for order management operations
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Order from "../../model/order.js";
import User from "../../model/user.js";
import { ensureConnection, isValidObjectId } from "../utils/database.js";
import { ORDER_STATUS_TRANSITIONS } from "../config/constants.js";

/**
 * Check Order Status
 * Retrieves order details and current status
 */
export const checkOrder = tool(
  async ({ orderId, userId = null }) => {
    await ensureConnection();

    if (!isValidObjectId(orderId)) {
      return JSON.stringify({
        success: false,
        message: "Invalid order ID format. Please provide a valid order ID.",
      });
    }

    try {
      const order = await Order.findById(orderId)
        .populate("user", "name email")
        .lean();

      if (!order) {
        return JSON.stringify({
          success: false,
          message: `Order #${orderId.slice(-6)} not found. Please verify the order ID.`,
        });
      }

      // Check ownership if userId provided
      if (userId && order.user._id.toString() !== userId) {
        return JSON.stringify({
          success: false,
          message: "Access denied. You can only view your own orders.",
        });
      }

      return JSON.stringify({
        success: true,
        orderId: order._id,
        status: order.orderStatus,
        totalAmount: `$${order.totalAmount}`,
        itemCount: order.orderItems.length,
        customerEmail: order.user?.email || "N/A",
        shippingCity: order.shippingAddress.city,
        shippingCountry: order.shippingAddress.country,
        createdAt: new Date(order.createdAt).toLocaleDateString(),
        deliveredAt: order.deliveredAt
          ? new Date(order.deliveredAt).toLocaleDateString()
          : "Not delivered yet",
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: "Error fetching order details",
      });
    }
  },
  {
    name: "check_order",
    description:
      "Check order status and details. Use when customer asks about their order.",
    schema: z.object({
      orderId: z.string().describe("The order ID"),
      userId: z
        .string()
        .optional()
        .describe("The authenticated user ID for ownership verification"),
    }),
  }
);

/**
 * Get My Orders
 * Retrieves authenticated user's order history
 */
export const getMyOrders = tool(
  async ({ userId, email, status, limit = 10 }) => {
    await ensureConnection();

    try {
      let actualUserId = userId;

      // If email is provided instead of userId, look up the user
      if (!actualUserId && email) {
        const user = await User.findOne({ email }).lean();
        if (!user) {
          return JSON.stringify({
            success: false,
            message: "User not found. Please make sure you are logged in.",
          });
        }
        actualUserId = user._id.toString();
      }

      if (!actualUserId) {
        return JSON.stringify({
          success: false,
          message:
            "User authentication required to view your orders. Please log in.",
        });
      }

      if (!isValidObjectId(actualUserId)) {
        return JSON.stringify({
          success: false,
          message: "Invalid user ID format",
        });
      }

      const filter = { user: actualUserId };
      if (status) {
        filter.orderStatus = status;
      }

      const orders = await Order.find(filter)
        .select("_id orderStatus totalAmount orderItems createdAt deliveredAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      if (orders.length === 0) {
        return JSON.stringify({
          success: true,
          count: 0,
          message:
            "You have no orders yet. Start shopping to see your order history!",
          orders: [],
        });
      }

      return JSON.stringify({
        success: true,
        count: orders.length,
        orders: orders.map((o) => ({
          orderId: o._id,
          status: o.orderStatus,
          amount: `$${o.totalAmount}`,
          items: o.orderItems.length,
          orderDate: new Date(o.createdAt).toLocaleDateString(),
          delivered: o.deliveredAt
            ? new Date(o.deliveredAt).toLocaleDateString()
            : "Not yet delivered",
        })),
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: "Error fetching your orders",
      });
    }
  },
  {
    name: "get_my_orders",
    description:
      "Get the authenticated user's orders. Use when customer asks 'show my orders', 'my order history', or 'what did I order'.",
    schema: z.object({
      userId: z
        .string()
        .optional()
        .describe("The authenticated user's ID (MongoDB ObjectId)"),
      email: z
        .string()
        .optional()
        .describe("The authenticated user's email address"),
      status: z
        .enum(["Processing", "Shipped", "Delivered", "Cancelled"])
        .optional()
        .describe("Filter by order status"),
      limit: z.number().optional().default(10).describe("Max orders to return"),
    }),
  }
);

/**
 * Get All Orders (Admin)
 * Retrieves all orders with optional status filter
 */
export const getAllOrders = tool(
  async ({ status, limit = 10 }) => {
    await ensureConnection();

    try {
      const filter = {};
      if (status) {
        filter.orderStatus = status;
      }

      const orders = await Order.find(filter)
        .populate("user", "name email")
        .select("_id orderStatus totalAmount createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return JSON.stringify({
        success: true,
        count: orders.length,
        orders: orders.map((o) => ({
          orderId: o._id,
          status: o.orderStatus,
          amount: `$${o.totalAmount}`,
          customer: o.user?.name || "N/A",
          date: new Date(o.createdAt).toLocaleDateString(),
        })),
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: "Error fetching orders",
      });
    }
  },
  {
    name: "get_all_orders",
    description:
      "Get list of all orders, optionally filtered by status. ADMIN ONLY.",
    schema: z.object({
      status: z
        .enum(["Processing", "Shipped", "Delivered", "Cancelled"])
        .optional()
        .describe("Filter by order status"),
      limit: z.number().optional().default(10).describe("Max orders to return"),
    }),
  }
);

/**
 * Update Order Status
 * Changes order status with validation
 */
export const updateOrderStatus = tool(
  async ({ orderId, newStatus }) => {
    await ensureConnection();

    if (!isValidObjectId(orderId)) {
      return JSON.stringify({
        success: false,
        message: "Invalid order ID format",
      });
    }

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return JSON.stringify({
          success: false,
          message: "Order not found",
        });
      }

      // Validate status transition
      const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.orderStatus];
      if (!allowedTransitions.includes(newStatus)) {
        return JSON.stringify({
          success: false,
          message: `Cannot change order from ${order.orderStatus} to ${newStatus}`,
        });
      }

      order.orderStatus = newStatus;
      if (newStatus === "Delivered") {
        order.deliveredAt = new Date();
      }
      await order.save();

      return JSON.stringify({
        success: true,
        message: `Order status updated to ${newStatus}`,
        orderId: order._id,
        newStatus: order.orderStatus,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: "Failed to update order status",
      });
    }
  },
  {
    name: "update_order_status",
    description:
      "Update an order's status. Use when customer or admin wants to change order status.",
    schema: z.object({
      orderId: z.string().describe("The order ID to update"),
      newStatus: z
        .enum(["Processing", "Shipped", "Delivered", "Cancelled"])
        .describe("New status for the order"),
    }),
  }
);

export const orderTools = [checkOrder, getMyOrders, getAllOrders, updateOrderStatus];

export default orderTools;
