/**
 * Support Tools
 * Tools for customer support operations
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Order from "../../model/order.js";
import Ticket from "../../model/ticket.js";
import { ensureConnection, isValidObjectId } from "../utils/database.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";

/**
 * Check Refund Eligibility
 * Multi-step tool that checks order + policy + date calculations
 */
export const checkRefundEligibility = tool(
  async ({ orderId, userId = null }) => {
    await ensureConnection();

    if (!isValidObjectId(orderId)) {
      return JSON.stringify({
        success: false,
        message: "Invalid order ID format. Please provide a valid order ID.",
      });
    }

    try {
      // Step 1: Get order from database
      const order = await Order.findById(orderId).populate("user").lean();

      if (!order) {
        return JSON.stringify({
          success: false,
          message: "Order not found. Please verify the order ID.",
        });
      }

      // Check ownership
      if (userId && order.user._id.toString() !== userId) {
        return JSON.stringify({
          success: false,
          message:
            "Access denied. You can only check refund eligibility for your own orders.",
        });
      }

      // Step 2: Query return policy from RAG
      const policyChunks = await retrieveRelevantChunks(
        "return eligibility requirements",
        2
      );

      // Extract return window from policy
      const policyText = policyChunks.map((c) => c.content).join(" ");
      const returnWindowMatch = policyText.match(/(\d+)\s*days?/i);
      const returnWindowDays = returnWindowMatch
        ? parseInt(returnWindowMatch[1])
        : 30;

      // Step 3: Date calculations
      const orderDate = new Date(order.createdAt);
      const currentDate = new Date();
      const daysSinceOrder = Math.floor(
        (currentDate - orderDate) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = returnWindowDays - daysSinceOrder;

      // Step 4: Apply business logic
      const isEligible =
        daysSinceOrder <= returnWindowDays &&
        order.orderStatus !== "Cancelled";

      const nonReturnableReasons = [];
      if (order.orderStatus === "Cancelled") {
        nonReturnableReasons.push("Order has been cancelled");
      }
      if (daysSinceOrder > returnWindowDays) {
        nonReturnableReasons.push(
          `Return window expired (${daysSinceOrder} days since order)`
        );
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
        reasons:
          nonReturnableReasons.length > 0
            ? nonReturnableReasons
            : ["All eligibility criteria met"],
        policyReference: `Items must be returned within ${returnWindowDays} days in original packaging`,
        nextSteps: isEligible
          ? "Contact support to initiate return. Keep original packaging and receipt ready."
          : "Unfortunately, this order is not eligible for return based on our policy.",
      });
    } catch (error) {
      console.error("Error checking refund eligibility:", error);
      return JSON.stringify({
        success: false,
        message: "Failed to check refund eligibility",
      });
    }
  },
  {
    name: "check_refund_eligibility",
    description:
      "Check if an order is eligible for refund/return. Performs multi-step analysis: fetches order, checks policy, calculates time windows. Use when customer asks about returns or refunds.",
    schema: z.object({
      orderId: z
        .string()
        .describe("The order ID to check refund eligibility for"),
    }),
  }
);

/**
 * Escalate to Human Support
 * Triggers when customer needs human intervention
 */
export const escalateToHuman = tool(
  async ({ reason, threadId = null, urgency = "medium", userId = null, email = null }) => {
    await ensureConnection();
    
    try {
      let briefing = null;

      // If we have a threadId, generate a briefing note
      if (threadId) {
        try {
          const { MemoryService } = await import("../memory/service.js");
          briefing = await MemoryService.generateBriefing(threadId);
          await MemoryService.escalateThread(threadId, reason);
        } catch (error) {
          console.error("Error generating briefing:", error);
        }
      }

      // Generate unique ticket ID
      const ticketId = `TICKET-${Date.now()}`;

      // Create ticket in database
      const ticket = await Ticket.create({
        ticketId,
        userId,
        email,
        threadId,
        reason,
        urgency,
        status: "open",
        briefing: briefing ? {
          conversationDuration: briefing.duration,
          messageCount: briefing.messageCount,
          summary: briefing.summary,
          sentiment: briefing.sentiment,
        } : null,
      });

      console.log("✅ Support ticket created:", ticketId);

      return JSON.stringify({
        success: true,
        ticketId: ticket.ticketId,
        message: "Your issue has been escalated to our support team",
        reason,
        urgency,
        estimatedResponseTime: urgency === "high" ? "15 minutes" : "1 hour",
        nextSteps:
          "A support specialist will contact you shortly via email or chat",
        briefing: briefing
          ? {
              conversationDuration: briefing.duration,
              messageCount: briefing.messageCount,
              summary: briefing.summary,
              sentiment: briefing.sentiment,
            }
          : null,
      });
    } catch (error) {
      console.error("Error escalating to human:", error);
      return JSON.stringify({
        success: false,
        message: "Failed to escalate issue",
      });
    }
  },
  {
    name: "escalate_to_human",
    description:
      "Escalate the conversation to a human support agent. Use when: customer expresses frustration, requests manager, issue is too complex, or customer explicitly asks for human help.",
    schema: z.object({
      reason: z
        .string()
        .describe(
          "Why the conversation needs human intervention (e.g., 'customer frustrated', 'complex issue')"
        ),
      threadId: z
        .string()
        .optional()
        .describe("The conversation thread ID for generating briefing"),
      urgency: z
        .enum(["low", "medium", "high"])
        .optional()
        .default("medium")
        .describe("Priority level for support team"),
    }),
  }
);

export const supportTools = [checkRefundEligibility, escalateToHuman];

export default supportTools;
