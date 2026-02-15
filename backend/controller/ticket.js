import Ticket from "../model/ticket.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

/**
 * Get all tickets (Admin only)
 */
export const getAllTickets = catchAsyncErrors(async (req, res, next) => {
  const { status, urgency, sortBy = "createdAt", order = "desc" } = req.query;

  let filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (urgency) {
    filter.urgency = urgency;
  }

  const sortOptions = {};
  sortOptions[sortBy] = order === "asc" ? 1 : -1;

  const tickets = await Ticket.find(filter)
    .populate("userId", "name email")
    .populate("assignedTo", "name email")
    .populate("resolvedBy", "name email")
    .sort(sortOptions)
    .lean();

  res.status(200).json({
    success: true,
    count: tickets.length,
    tickets,
  });
});

/**
 * Get single ticket by ID
 */
export const getTicketById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id)
    .populate("userId", "name email")
    .populate("assignedTo", "name email")
    .populate("resolvedBy", "name email")
    .populate("notes.addedBy", "name email");

  if (!ticket) {
    return next(new ErrorHandler("Ticket not found", 404));
  }

  res.status(200).json({
    success: true,
    ticket,
  });
});

/**
 * Update ticket status
 */
export const updateTicketStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, resolution } = req.body;

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    return next(new ErrorHandler("Ticket not found", 404));
  }

  ticket.status = status;

  if (status === "resolved" || status === "closed") {
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user._id;
    if (resolution) {
      ticket.resolution = resolution;
    }
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    message: "Ticket status updated successfully",
    ticket,
  });
});

/**
 * Assign ticket to admin
 */
export const assignTicket = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { adminId } = req.body;

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    return next(new ErrorHandler("Ticket not found", 404));
  }

  ticket.assignedTo = adminId || req.user._id;
  
  if (ticket.status === "open") {
    ticket.status = "in-progress";
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    message: "Ticket assigned successfully",
    ticket,
  });
});

/**
 * Add note to ticket
 */
export const addTicketNote = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return next(new ErrorHandler("Note text is required", 400));
  }

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    return next(new ErrorHandler("Ticket not found", 404));
  }

  ticket.notes.push({
    text: text.trim(),
    addedBy: req.user._id,
    addedAt: new Date(),
  });

  await ticket.save();

  const updatedTicket = await Ticket.findById(id).populate(
    "notes.addedBy",
    "name email"
  );

  res.status(200).json({
    success: true,
    message: "Note added successfully",
    ticket: updatedTicket,
  });
});

/**
 * Get ticket statistics
 */
export const getTicketStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Ticket.aggregate([
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        byUrgency: [
          {
            $group: {
              _id: "$urgency",
              count: { $sum: 1 },
            },
          },
        ],
        total: [
          {
            $count: "count",
          },
        ],
        recentTickets: [
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 5,
          },
        ],
      },
    },
  ]);

  const statusStats = stats[0].byStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const urgencyStats = stats[0].byUrgency.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    stats: {
      total: stats[0].total[0]?.count || 0,
      byStatus: statusStats,
      byUrgency: urgencyStats,
      recentTickets: stats[0].recentTickets,
    },
  });
});
