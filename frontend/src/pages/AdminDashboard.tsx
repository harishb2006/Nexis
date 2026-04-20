import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// --- Type Definitions ---

interface UserState {
  email: string | null;
  role: string | null;
  name?: string;
}

interface RootState {
  user: UserState;
}

interface Document {
  filename: string;
  size: number;
  createdAt: string;
}

interface TicketStats {
  total: number;
  byStatus: {
    open?: number;
    'in-progress'?: number;
    resolved?: number;
    closed?: number;
  };
}

interface TicketNote {
  text: string;
  addedBy?: { name: string };
  addedAt: string;
}

interface TicketBriefing {
  conversationDuration?: string;
  messageCount?: number;
  summary?: string;
}

interface Ticket {
  _id: string;
  ticketId: string;
  email?: string;
  userId?: { email: string };
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  notes?: TicketNote[];
  briefing?: TicketBriefing;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');

  // Knowledge Base State
  const [activeTab, setActiveTab] = useState<string>('tickets');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [ingesting, setIngesting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (activeTab === 'tickets') {
      fetchTickets();
      fetchStats();
    } else if (activeTab === 'knowledge-base') {
      fetchDocuments();
    }
  }, [filter, activeTab]);

  const fetchDocuments = async (): Promise<void> => {
    try {
      const { data } = await axios.get('/api/v2/chat/documents');
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post('/api/v2/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded successfully!');
      fetchDocuments();
    } catch (error) {
      console.error("Upload failed", error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (filename: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      await axios.delete(`/api/v2/chat/documents/${filename}`);
      alert('Document deleted');
      fetchDocuments();
    } catch (error) {
      console.error("Delete failed", error);
      alert('Failed to delete document');
    }
  };

  const handleIngest = async (): Promise<void> => {
    setIngesting(true);
    try {
      const { data } = await axios.post('/api/v2/chat/ingest');
      alert(`Knowledge base updated! Ingested ${data.data?.chunksIngested || 0} chunks from ${data.data?.files?.length || 0} files.`);
    } catch (error) {
      console.error("Ingest failed", error);
      alert('Failed to rebuild knowledge base');
    } finally {
      setIngesting(false);
    }
  };

  const fetchTickets = async (): Promise<void> => {
    try {
      setLoading(true);
      const queryParams = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await axios.get(`/api/v2/tickets/admin/tickets${queryParams}`);
      setTickets(data.tickets);
    } catch (error: any) {
      console.error("Failed to fetch tickets:", error);
      if (error.response?.status === 401) {
        alert("Your session has expired or is invalid. Please log in again.");
        localStorage.removeItem('shophub_user');
        navigate('/login');
        return;
      }
      const errMsg = error.response?.data?.message || error.message;
      alert(`Failed to load tickets. Error: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const { data } = await axios.get('/api/v2/tickets/admin/tickets/stats');
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string): Promise<void> => {
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
      alert('Failed to update ticket status');
    }
  };

  const handleAssignToMe = async (ticketId: string): Promise<void> => {
    try {
      await axios.put(`/api/v2/tickets/admin/tickets/${ticketId}/assign`, {});
      fetchTickets();
      alert('Ticket assigned to you');
    } catch (error) {
      alert('Failed to assign ticket');
    }
  };

  const handleAddNote = async (ticketId: string): Promise<void> => {
    if (!newNote.trim()) return;

    try {
      await axios.post(`/api/v2/tickets/admin/tickets/${ticketId}/notes`, {
        text: newNote,
      });
      setNewNote('');
      fetchTickets();
      
      const { data } = await axios.get(`/api/v2/tickets/admin/tickets/${ticketId}`);
      setSelectedTicket(data.ticket);
    } catch (error) {
      alert('Failed to add note');
    }
  };

  const getUrgencyColor = (urgency: string): string => {
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

  const getStatusColor = (status: string): string => {
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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Support Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage customer support tickets and AI knowledge base</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-6 py-3 font-semibold transition-colors border ${activeTab === 'tickets' ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
              >
                Tickets
              </button>
              <button
                onClick={() => setActiveTab('knowledge-base')}
                className={`px-6 py-3 font-semibold transition-colors border ${activeTab === 'knowledge-base' ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
              >
                Knowledge Base
              </button>
              <button
                onClick={() => navigate('/admin/feedback')}
                className="px-6 py-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors font-semibold"
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'knowledge-base' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    AI Knowledge Base Documents
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Upload .txt or .md files for the AI agent to use as context when answering user questions.
                  </p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.md,.pdf"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                  <button
                    onClick={handleIngest}
                    disabled={ingesting}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                  >
                    {ingesting ? 'Rebuilding Matrix...' : 'Rebuild Knowledge Base'}
                  </button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-300">
                  <p className="text-gray-900 font-medium text-lg">No documents uploaded yet</p>
                  <p className="text-gray-500 text-sm mt-2">Upload policies, FAQs, or manuals to empower your AI support agent.</p>
                </div>
              ) : (
                <div className="border border-gray-200">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-sm font-bold text-gray-900">Filename</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-900 w-32">Size</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-900 w-48">Uploaded Date</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-900 text-right w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {documents.map((doc, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 truncate">
                            {doc.filename}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {(doc.size / 1024).toFixed(1)} KB
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(doc.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteDocument(doc.filename)}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm transition-colors"
                              title="Delete Document"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {activeTab === 'tickets' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus.open || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus['in-progress'] || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Resolved</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus.resolved || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {activeTab === 'tickets' && (
          <>
            <div className="bg-white border border-gray-200 p-4 mb-6">
              <div className="flex gap-3 flex-wrap">
                {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-6 py-2.5 font-semibold transition-all border capitalize ${filter === status
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {status === 'all' ? 'All Tickets' : status.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white border border-gray-200">
              {loading ? (
                <div className="p-12 text-center">
                  <p className="mt-4 text-gray-900 font-semibold">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-900 font-semibold text-lg">No tickets found</p>
                </div>
              ) : (
                <div className="w-full">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-32">Ticket ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Reason</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-24">Urgency</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-32">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-48">Created</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold text-gray-900">{ticket.ticketId}</span>
                          </td>
                          <td className="px-6 py-4 truncate">
                            <span className="text-sm font-medium">
                              {ticket.email || ticket.userId?.email || 'Anonymous'}
                            </span>
                          </td>
                          <td className="px-6 py-4 truncate">
                            <p className="text-sm text-gray-700">{ticket.reason}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold border ${getUrgencyColor(ticket.urgency)}`}>
                              {ticket.urgency.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 truncate">
                            {new Date(ticket.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-semibold"
                              >
                                View
                              </button>
                              {ticket.status === 'open' && (
                                <button
                                  onClick={() => handleAssignToMe(ticket._id)}
                                  className="px-4 py-2 bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors text-sm font-semibold"
                                >
                                  Assign
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
          </>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 max-w-3xl w-full">
              <div className="sticky top-0 bg-black text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedTicket.ticketId}</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-sm font-semibold hover:text-gray-300 transition-colors"
                >
                  Close
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
                    <span className={`inline-block px-3 py-1 text-xs font-bold border mt-1 ${getUrgencyColor(selectedTicket.urgency)}`}>
                      {selectedTicket.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                    <span className={`inline-block px-3 py-1 text-xs font-bold border mt-1 ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p className="text-sm text-gray-900 font-bold mb-2">Escalation Reason</p>
                  <p className="text-base bg-gray-50 border border-gray-200 p-4">{selectedTicket.reason}</p>
                </div>

                {/* Briefing */}
                {selectedTicket.briefing && (
                  <div>
                    <p className="text-sm text-gray-900 font-bold mb-2">AI Briefing</p>
                    <div className="bg-gray-50 p-4 border border-gray-200 space-y-2">
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
                    <p className="text-sm text-gray-900 font-bold mb-2">Notes</p>
                    <div className="space-y-2">
                      {selectedTicket.notes.map((note, idx) => (
                        <div key={idx} className="bg-white p-3 border border-gray-200">
                          <p className="text-sm text-gray-900">{note.text}</p>
                          <p className="text-xs text-gray-500 mt-2 font-medium">
                            {note.addedBy?.name || 'Admin'} • {new Date(note.addedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Note */}
                <div>
                  <label className="text-sm text-gray-900 font-bold mb-2 block">
                    Add Internal Note
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <button
                      onClick={() => handleAddNote(selectedTicket._id)}
                      className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Resolution */}
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div>
                    <label className="text-sm text-gray-900 font-bold mb-2 block">
                      Resolution Notes (Required for resolving)
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe how you resolved this ticket..."
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      rows={3}
                    />
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedTicket._id, 'in-progress')}
                      className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors font-semibold"
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
                      className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  {selectedTicket.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedTicket._id, 'closed')}
                      className="flex-1 px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 transition-colors font-semibold"
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