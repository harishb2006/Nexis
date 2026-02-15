import React, { useState, useEffect } from 'react';
import { Ticket, AlertCircle, CheckCircle, Clock, User, X, MessageSquare, Save, TrendingUp } from 'lucide-react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [newNote, setNewNote] = useState('');
  const [resolution, setResolution] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (!user.email) {
      alert('Please login to access admin dashboard');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const queryParams = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await axios.get(`/api/v2/tickets/admin/tickets${queryParams}`);
      setTickets(data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/v2/tickets/admin/tickets/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await axios.put(`/api/v2/tickets/admin/tickets/${ticketId}/status`, {
        status: newStatus,
        resolution: newStatus === 'resolved' ? resolution : undefined,
      });
      fetchTickets();
      fetchStats();
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket status');
    }
  };

  const handleAssignToMe = async (ticketId) => {
    try {
      await axios.put(`/api/v2/tickets/admin/tickets/${ticketId}/assign`, {});
      fetchTickets();
      alert('Ticket assigned to you');
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    }
  };

  const handleAddNote = async (ticketId) => {
    if (!newNote.trim()) return;
    
    try {
      await axios.post(`/api/v2/tickets/admin/tickets/${ticketId}/notes`, {
        text: newNote,
      });
      setNewNote('');
      fetchTickets();
      // Refresh selected ticket
      const { data } = await axios.get(`/api/v2/tickets/admin/tickets/${ticketId}`);
      setSelectedTicket(data.ticket);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Ticket className="text-slate-700" size={36} />
                Admin Support Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage customer support tickets and escalations</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <TrendingUp className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus.open || 0}</p>
                </div>
                <AlertCircle className="text-red-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus['in-progress'] || 0}</p>
                </div>
                <Clock className="text-purple-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Resolved</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus.resolved || 0}</p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all capitalize ${
                  filter === status
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Tickets' : status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
              <p className="mt-4 text-gray-600">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Ticket ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Reason</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Urgency</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-blue-600">{ticket.ticketId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm">
                            {ticket.email || ticket.userId?.email || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs truncate">{ticket.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(ticket.urgency)}`}>
                          {ticket.urgency.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                          >
                            View
                          </button>
                          {ticket.status === 'open' && (
                            <button
                              onClick={() => handleAssignToMe(ticket._id)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                            >
                              Assign to Me
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedTicket.ticketId}</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Customer Email</p>
                    <p className="text-base font-medium">{selectedTicket.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Created At</p>
                    <p className="text-base font-medium">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Urgency</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(selectedTicket.urgency)}`}>
                      {selectedTicket.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Escalation Reason</p>
                  <p className="text-base bg-gray-50 p-4 rounded-lg">{selectedTicket.reason}</p>
                </div>

                {/* Briefing */}
                {selectedTicket.briefing && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">AI Briefing</p>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-200">
                      <p className="text-sm"><strong>Duration:</strong> {selectedTicket.briefing.conversationDuration}</p>
                      <p className="text-sm"><strong>Messages:</strong> {selectedTicket.briefing.messageCount}</p>
                      {selectedTicket.briefing.summary && (
                        <p className="text-sm"><strong>Summary:</strong> {selectedTicket.briefing.summary}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedTicket.notes && selectedTicket.notes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Notes</p>
                    <div className="space-y-2">
                      {selectedTicket.notes.map((note, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">{note.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {note.addedBy?.name || 'Admin'} • {new Date(note.addedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Note */}
                <div>
                  <label className="text-sm text-gray-600 font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Add Internal Note
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    <button
                      onClick={() => handleAddNote(selectedTicket._id)}
                      className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold flex items-center gap-2"
                    >
                      <Save size={18} />
                      Save
                    </button>
                  </div>
                </div>

                {/* Resolution */}
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div>
                    <label className="text-sm text-gray-600 font-semibold mb-2 block">
                      Resolution Notes (Required for resolving)
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe how you resolved this ticket..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      rows="3"
                    />
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedTicket._id, 'in-progress')}
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Start Working
                    </button>
                  )}
                  {(selectedTicket.status === 'open' || selectedTicket.status === 'in-progress') && (
                    <button
                      onClick={() => {
                        if (!resolution.trim()) {
                          alert('Please add resolution notes before resolving the ticket');
                          return;
                        }
                        handleStatusUpdate(selectedTicket._id, 'resolved');
                      }}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  {selectedTicket.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedTicket._id, 'closed')}
                      className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
