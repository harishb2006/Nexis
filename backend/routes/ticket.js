import express from "express";
import {
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addTicketNote,
  getTicketStats,
} from "../controller/ticket.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all tickets (Admin only)
router.get("/admin/tickets", isAuthenticated, isAdmin, getAllTickets);

// Get ticket statistics (Admin only)
router.get("/admin/tickets/stats", isAuthenticated, isAdmin, getTicketStats);

// Get single ticket (Admin only)
router.get("/admin/tickets/:id", isAuthenticated, isAdmin, getTicketById);

// Update ticket status (Admin only)
router.put("/admin/tickets/:id/status", isAuthenticated, isAdmin, updateTicketStatus);

// Assign ticket (Admin only)
router.put("/admin/tickets/:id/assign", isAuthenticated, isAdmin, assignTicket);

// Add note to ticket (Admin only)
router.post("/admin/tickets/:id/notes", isAuthenticated, isAdmin, addTicketNote);

export default router;
