import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

// --- Type Definitions ---

interface FeedbackItem {
  _id?: string;
  category: string;
  timestamp: string;
  question?: string;
  answer?: string;
}

interface CategoryStat {
  category: string;
  positive: number;
  negative: number;
  total: number;
  satisfactionRate: number;
}

interface AnalyticsSummary {
  total: number;
  positive: number;
  negative: number;
  satisfactionRate: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  byCategory: CategoryStat[];
  recentNegative: FeedbackItem[];
}

const FeedbackDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');

  useEffect(() => {
    fetchAnalytics();
    fetchFeedbackList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, dateRange]);

  const fetchAnalytics = async (): Promise<void> => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
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
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackList = async (): Promise<void> => {
    try {
      const params: Record<string, string | number> = { limit: 10 };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await axios.get('/api/v2/chat/feedback/list', { params });
      setFeedbackList(response.data.data.feedback);
    } catch (error) {
      console.error("Failed to fetch feedback list", error);
    }
  };

  const exportData = (): void => {
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
      <div className="min-h-screen w-full relative" style={{
        backgroundColor: "#f8fafc",
        backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
        backgroundSize: '30px 30px',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
            <p className="text-gray-900 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative" style={{
        backgroundColor: "#f8fafc",
        backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
        backgroundSize: '30px 30px',
        backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>

      <main className="relative z-10 pt-20 pb-20 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Feedback <span className="text-indigo-600">Analytics</span></h1>
          <p className="text-gray-500 mt-2 font-medium">Monitor and improve your AI assistant performance</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Filters</span>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900"
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
          </div>

          <button
            onClick={exportData}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all text-sm font-bold shadow-sm"
          >
            Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Total Feedback</span>
            <p className="text-4xl font-black text-gray-900">{analytics?.summary.total || 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/20"></div>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Positive</span>
            <p className="text-4xl font-black text-gray-900">{analytics?.summary.positive || 0}</p>
            <p className="text-xs font-medium text-indigo-600 mt-2">
              {analytics?.summary.total ? ((analytics.summary.positive / analytics.summary.total) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500/20"></div>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Negative</span>
            <p className="text-4xl font-black text-gray-900">{analytics?.summary.negative || 0}</p>
            <p className="text-xs font-medium text-rose-600 mt-2">
              {analytics?.summary.total ? ((analytics.summary.negative / analytics.summary.total) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="bg-gray-900 rounded-[2rem] border border-gray-800 shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-2">Satisfaction Rate</span>
            <p className="text-4xl font-black text-white">{analytics?.summary.satisfactionRate || 0}%</p>
            <p className="text-xs font-medium text-gray-300 mt-2">
              {analytics && analytics.summary.satisfactionRate >= 80 
                ? 'Excellent performance' 
                : analytics && analytics.summary.satisfactionRate >= 60
                ? 'Good, room to improve'
                : 'Needs improvement'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Breakdown */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance by Category</h2>
            <div className="space-y-6">
                {analytics?.byCategory.map((cat) => (
                <div key={cat.category} className="border-b border-gray-100/60 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">{cat.category}</span>
                    <span className="text-sm font-black text-gray-900">
                        {cat.satisfactionRate.toFixed(1)}%
                    </span>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                            className="bg-gray-900 h-full rounded-full transition-all"
                            style={{ width: `${cat.satisfactionRate}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="text-indigo-600">POS: {cat.positive}</span>
                            <span className="text-rose-600">NEG: {cat.negative}</span>
                            <span className="text-gray-400 border-l border-gray-200 pl-3">TOTAL: {cat.total}</span>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            </div>

            {/* Recent Negative Feedback */}
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Escalations</h2>
            
            {analytics?.recentNegative && analytics.recentNegative.length > 0 ? (
                <div className="space-y-4">
                {analytics.recentNegative.map((feedback, idx) => (
                    <div key={idx} className="border border-gray-100 bg-gray-50/50 p-5 rounded-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest bg-white border border-gray-200 px-2.5 py-1 rounded-md">
                            {feedback.category}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                            {new Date(feedback.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                        {feedback.question && (
                            <div className="mb-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">User Query</p>
                            <p className="text-sm text-gray-900 font-medium">{feedback.question}</p>
                            </div>
                        )}
                        {feedback.answer && (
                            <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">AI Response</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{feedback.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-500 font-semibold text-sm">No negative feedback recorded</p>
                    <p className="text-gray-400 text-xs mt-1">Everything is running smoothly</p>
                </div>
            )}
            </div>
        </div>
      </main>
    </div>
  );
}

export default FeedbackDashboard;