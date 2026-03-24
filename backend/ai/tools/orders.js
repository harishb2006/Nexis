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

/**
 * Cancel Order
 * Cancels an order if it is still Processing
 */
export const cancelOrder = tool(
  async ({ orderId, userId = null }) => {
    await ensureConnection();
    if (!isValidObjectId(orderId)) return JSON.stringify({ success: false, message: "Invalid order ID" });
    try {
      const order = await Order.findById(orderId);
      if (!order) return JSON.stringify({ success: false, message: "Order not found" });
      if (userId && order.user.toString() !== userId) return JSON.stringify({ success: false, message: "Access denied." });

      if (order.orderStatus !== "Processing") {
        return JSON.stringify({ success: false, message: `Cannot cancel an order that is ${order.orderStatus}. Only Processing orders can be cancelled.` });
      }

      order.orderStatus = "Cancelled";
      await order.save();
      return JSON.stringify({ success: true, message: "Order has been successfully cancelled." });
    } catch (e) { return JSON.stringify({ success: false, message: "Error cancelling order" }); }
  },
  {
    name: "cancel_order",
    description: "Cancel an order if it has not shipped yet (still Processing).",
    schema: z.object({
      orderId: z.string().describe("The order ID to cancel"),
      userId: z.string().optional().describe("Authenticated user ID"),
    })
  }
);

/**
 * Return Order
 * Initiates a return and sets refundStatus to Processing
 */
export const returnOrder = tool(
  async ({ orderId, reason, userId = null }) => {
    await ensureConnection();
    if (!isValidObjectId(orderId)) return JSON.stringify({ success: false, message: "Invalid order ID" });
    try {
      const order = await Order.findById(orderId);
      if (!order) return JSON.stringify({ success: false, message: "Order not found" });
      if (userId && order.user.toString() !== userId) return JSON.stringify({ success: false, message: "Access denied." });

      if (order.orderStatus !== "Delivered") {
        return JSON.stringify({ success: false, message: "Only Delivered orders can be returned." });
      }
      if (order.refundStatus === "Processing" || order.refundStatus === "Refunded") {
        return JSON.stringify({ success: false, message: "A return/refund is already in progress or completed." });
      }

      order.refundStatus = "Processing";
      await order.save();
      return JSON.stringify({ success: true, message: "Return request initiated. Refund is now Processing." });
    } catch (e) { return JSON.stringify({ success: false, message: "Error initiating return" }); }
  },
  {
    name: "return_order",
    description: "Initiates a return and refund request for a delivered order.",
    schema: z.object({
      orderId: z.string().describe("The order ID to return"),
      reason: z.string().optional().describe("Reason for return"),
      userId: z.string().optional().describe("Authenticated user ID"),
    })
  }
);

/**
 * Check Refund Status
 */
export const checkRefundStatus = tool(
  async ({ orderId, userId = null }) => {
    await ensureConnection();
    if (!isValidObjectId(orderId)) return JSON.stringify({ success: false, message: "Invalid order ID format." });
    try {
      const order = await Order.findById(orderId).lean();
      if (!order) return JSON.stringify({ success: false, message: "Order not found." });
      if (userId && order.user.toString() !== userId) return JSON.stringify({ success: false, message: "Access denied." });

      return JSON.stringify({
        success: true,
        orderId: order._id,
        refundStatus: order.refundStatus || "Not Requested",
      });
    } catch (e) { return JSON.stringify({ success: false, message: "Error fetching refund status." }); }
  },
  {
    name: "check_refund_status",
    description: "Check the status of a pending refund for an order.",
    schema: z.object({
      orderId: z.string().describe("The order ID to check"),
      userId: z.string().optional().describe("Authenticated user ID"),
    })
  }
);

/**
 * Update Shipping Address
 */
export const updateAddress = tool(
  async ({ orderId, country, city, address1, address2, zipCode, userId = null }) => {
    await ensureConnection();
    if (!isValidObjectId(orderId)) return JSON.stringify({ success: false, message: "Invalid order ID" });
    try {
      const order = await Order.findById(orderId);
      if (!order) return JSON.stringify({ success: false, message: "Order not found" });
      if (userId && order.user.toString() !== userId) return JSON.stringify({ success: false, message: "Access denied." });

      if (order.orderStatus !== "Processing") {
        return JSON.stringify({ success: false, message: "Address can only be updated while the order is Processing." });
      }

      if (country) order.shippingAddress.country = country;
      if (city) order.shippingAddress.city = city;
      if (address1) order.shippingAddress.address1 = address1;
      if (address2 !== undefined) order.shippingAddress.address2 = address2;
      if (zipCode) order.shippingAddress.zipCode = zipCode;

      await order.save();
      return JSON.stringify({ success: true, message: "Shipping address successfully updated." });
    } catch (e) { return JSON.stringify({ success: false, message: "Error updating address." }); }
  },
  {
    name: "update_address",
    description: "Update the shipping address of an active order.",
    schema: z.object({
      orderId: z.string().describe("The order ID to update"),
      country: z.string().optional().describe("New Country"),
      city: z.string().optional().describe("New City"),
      address1: z.string().optional().describe("New Address Line 1"),
      address2: z.string().optional().describe("New Address Line 2"),
      zipCode: z.number().optional().describe("New Zip Code"),
      userId: z.string().optional().describe("Authenticated user ID"),
    })
  }
);

/**
 * Track Order
 */
export const trackOrder = tool(
  async ({ orderId, userId = null }) => {
    await ensureConnection();
    if (!isValidObjectId(orderId)) return JSON.stringify({ success: false, message: "Invalid order ID format." });
    try {
      const order = await Order.findById(orderId).lean();
      if (!order) return JSON.stringify({ success: false, message: `Order #${orderId.slice(-6)} not found.` });
      if (userId && order.user.toString() !== userId) return JSON.stringify({ success: false, message: "Access denied." });

      return JSON.stringify({
        success: true,
        orderId: order._id,
        status: order.orderStatus,
        trackingNumber: order.trackingNumber || "Not yet assigned",
        estimatedDelivery: order.orderStatus === "Delivered" ? "Already Delivered" : "3-5 business days from shipment",
        shippingCity: order.shippingAddress.city,
      });
    } catch (error) { return JSON.stringify({ success: false, message: "Error tracking order." }); }
  },
  {
    name: "track_order",
    description: "Get precise tracking information and status for an order.",
    schema: z.object({
      orderId: z.string().describe("The order ID to track"),
      userId: z.string().optional().describe("Authenticated user ID"),
    })
  }
);

export const orderTools = [
  checkOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  checkRefundStatus,
  updateAddress,
  trackOrder
];

export default orderTools;
