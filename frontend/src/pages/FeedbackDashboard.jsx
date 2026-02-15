import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calendar,
  Download,
  Filter,
  AlertCircle
} from 'lucide-react';
import axios from '../axiosConfig';

export default function FeedbackDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
    fetchFeedbackList();
  }, [selectedCategory, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      // Set date range
      if (dateRange !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        if (dateRange === '7d') startDate.setDate(endDate.getDate() - 7);
        else if (dateRange === '30d') startDate.setDate(endDate.getDate() - 30);
        else if (dateRange === '90d') startDate.setDate(endDate.getDate() - 90);
        
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }

      const response = await axios.get('/api/v2/chat/feedback/analytics', { params });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackList = async () => {
    try {
      const params = { limit: 10 };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await axios.get('/api/v2/chat/feedback/list', { params });
      setFeedbackList(response.data.data.feedback);
    } catch (error) {
      console.error('Failed to fetch feedback list:', error);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvContent = [
      ['Category', 'Positive', 'Negative', 'Total', 'Satisfaction Rate %'],
      ...analytics.byCategory.map(cat => [
        cat.category,
        cat.positive,
        cat.negative,
        cat.total,
        cat.satisfactionRate.toFixed(1)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-800 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Feedback Analytics</h1>
          <p className="text-gray-600">Monitor and improve your AI assistant performance</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filters:</span>
            </div>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="shipping">Shipping</option>
              <option value="returns">Returns</option>
              <option value="orders">Orders</option>
              <option value="payment">Payment</option>
              <option value="products">Products</option>
              <option value="support">Support</option>
              <option value="general">General</option>
            </select>

            <button
              onClick={exportData}
              className="ml-auto px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-semibold">Total Feedback</span>
              <BarChart3 size={24} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{analytics?.summary.total || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-700 text-sm font-semibold">Positive</span>
              <ThumbsUp size={24} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-800">{analytics?.summary.positive || 0}</p>
            <p className="text-xs text-emerald-600 mt-1">
              {analytics?.summary.total > 0 
                ? ((analytics.summary.positive / analytics.summary.total) * 100).toFixed(1) 
                : 0}% of total
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-700 text-sm font-semibold">Negative</span>
              <ThumbsDown size={24} className="text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-800">{analytics?.summary.negative || 0}</p>
            <p className="text-xs text-red-600 mt-1">
              {analytics?.summary.total > 0 
                ? ((analytics.summary.negative / analytics.summary.total) * 100).toFixed(1) 
                : 0}% of total
            </p>
          </div>

          <div className={`bg-gradient-to-br rounded-xl shadow-lg p-6 ${
            analytics?.summary.satisfactionRate >= 80 
              ? 'from-green-50 to-green-100' 
              : analytics?.summary.satisfactionRate >= 60
              ? 'from-yellow-50 to-yellow-100'
              : 'from-orange-50 to-orange-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${
                analytics?.summary.satisfactionRate >= 80 
                  ? 'text-green-700' 
                  : analytics?.summary.satisfactionRate >= 60
                  ? 'text-yellow-700'
                  : 'text-orange-700'
              }`}>Satisfaction Rate</span>
              <TrendingUp size={24} className={
                analytics?.summary.satisfactionRate >= 80 
                  ? 'text-green-600' 
                  : analytics?.summary.satisfactionRate >= 60
                  ? 'text-yellow-600'
                  : 'text-orange-600'
              } />
            </div>
            <p className={`text-3xl font-bold ${
              analytics?.summary.satisfactionRate >= 80 
                ? 'text-green-800' 
                : analytics?.summary.satisfactionRate >= 60
                ? 'text-yellow-800'
                : 'text-orange-800'
            }`}>
              {analytics?.summary.satisfactionRate || 0}%
            </p>
            <p className={`text-xs mt-1 ${
              analytics?.summary.satisfactionRate >= 80 
                ? 'text-green-600' 
                : analytics?.summary.satisfactionRate >= 60
                ? 'text-yellow-600'
                : 'text-orange-600'
            }`}>
              {analytics?.summary.satisfactionRate >= 80 
                ? 'Excellent!' 
                : analytics?.summary.satisfactionRate >= 60
                ? 'Good, room to improve'
                : 'Needs improvement'}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance by Category</h2>
          <div className="space-y-4">
            {analytics?.byCategory.map((cat) => (
              <div key={cat.category} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-700 capitalize">{cat.category}</span>
                  <span className={`text-lg font-bold ${
                    cat.satisfactionRate >= 80 
                      ? 'text-green-600' 
                      : cat.satisfactionRate >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {cat.satisfactionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${cat.satisfactionRate}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <ThumbsUp size={16} /> {cat.positive}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <ThumbsDown size={16} /> {cat.negative}
                    </span>
                    <span className="text-gray-600">({cat.total} total)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Negative Feedback */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={24} className="text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800">Recent Negative Feedback (Needs Review)</h2>
          </div>
          
          {analytics?.recentNegative && analytics.recentNegative.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentNegative.map((feedback, idx) => (
                <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-red-700 uppercase bg-red-200 px-2 py-1 rounded">
                      {feedback.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {feedback.question && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 font-semibold">Question:</p>
                      <p className="text-sm text-gray-800">{feedback.question}</p>
                    </div>
                  )}
                  {feedback.answer && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">AI Response:</p>
                      <p className="text-sm text-gray-800">{feedback.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ThumbsUp size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No negative feedback in this period! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
