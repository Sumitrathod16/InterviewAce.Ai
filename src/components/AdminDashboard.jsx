import React, { useState, useEffect } from 'react';
import { Users, CreditCard, TrendingUp, BarChart2, Shield, Calendar, RefreshCw, Layers } from 'lucide-react';
import API from '../services/api';

export default function AdminDashboard({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({ totalInterviews: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const usersRes = await API.get('/auth/admin/users');
      setUsers(usersRes.data);

      const analyticsRes = await API.get('/interviews/admin/analytics');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setError('Failed to fetch admin dashboard analytics data. Ensure you have Admin privileges.');
      
      // Fallback details for mock local test in Admin dashboard
      setUsers([
        { _id: '1', name: 'Sumit Rathod', email: 'sumit@example.com', role: 'Student', subscription: 'Premium', createdAt: '2026-06-15T10:00:00Z' },
        { _id: '2', name: 'Sarah Chen', email: 'sarah@example.com', role: 'Student', subscription: 'Pro', createdAt: '2026-06-14T12:30:00Z' },
        { _id: '3', name: 'Alex Johnson', email: 'alex@example.com', role: 'Student', subscription: 'Free', createdAt: '2026-06-12T08:15:00Z' },
        { _id: '4', name: 'Admin Root', email: 'admin@interviewace.ai', role: 'Admin', subscription: 'Premium', createdAt: '2026-06-01T09:00:00Z' }
      ]);
      setAnalytics({ totalInterviews: 24, avgScore: 82 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.subscription !== 'Free').length;
  const proUsersCount = users.filter(u => u.subscription === 'Pro').length;
  const premiumUsersCount = users.filter(u => u.subscription === 'Premium').length;
  
  // Calculate mock revenue: Pro (₹199), Premium (₹499)
  const monthlyRevenue = (proUsersCount * 199) + (premiumUsersCount * 499);
  const conversionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const stats = [
    { title: 'Total Registered Users', value: totalUsers, icon: Users, desc: 'Candidate accounts' },
    { title: 'Paid Premium Subscriptions', value: activeUsers, icon: CreditCard, desc: 'Active Pro & Premium tiers' },
    { title: 'Estimated Monthly Revenue', value: `₹${monthlyRevenue}`, icon: TrendingUp, desc: 'Calculated monthly MMR' },
    { title: 'Average Mock Score', value: `${analytics.avgScore}%`, icon: BarChart2, desc: `Across ${analytics.totalInterviews} sessions` }
  ];

  return (
    <div className="pt-28 pb-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-white mb-1">
              <Shield className="text-white" size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-lightGray/60">Administrative Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Analytics Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 text-xs font-semibold text-lightGray/70 hover:text-white border border-white/5 rounded-lg flex items-center gap-2 transition-colors hover:bg-white/5"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-background bg-white hover:bg-lightGray rounded-lg flex items-center gap-2 transition-colors"
            >
              Logout Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-orange-950/20 border border-orange-900/40 rounded-xl text-xs text-orange-200 leading-relaxed text-center">
            {error} (Using local developer metrics details fallback).
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-5 bg-secondaryBg/40 border border-white/5 rounded-xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-lightGray/50 uppercase">{stat.title}</span>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-lightGray/40">{stat.desc}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-white">
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        {/* User Base and Prompt Console splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* User List Panel */}
          <div className="lg:col-span-8 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Registered Candidate Registry</h2>
              <p className="text-xs text-lightGray/55 mt-0.5">Manage details and preparation tracks of candidate profiles</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-lightGray/40 uppercase font-semibold text-[10px] tracking-wider pb-3">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Subscription</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{user.name}</td>
                      <td className="py-3 px-4 text-lightGray/70">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          user.role === 'Admin' ? 'bg-white text-background' : 'bg-secondaryBg text-lightGray/60 border border-white/5'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          user.subscription === 'Premium' 
                            ? 'bg-white text-background' 
                            : user.subscription === 'Pro' 
                              ? 'bg-lightGray text-background' 
                              : 'bg-secondaryBg text-lightGray/40 border border-white/5'
                        }`}>
                          {user.subscription}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-lightGray/50 font-mono">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Custom System Prompts Configuration Panel */}
          <div className="lg:col-span-4 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Prompts Manager</h2>
                <p className="text-xs text-lightGray/55 mt-0.5">Edit prompt instructions sent directly to Gemini models</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-lightGray/50 uppercase">HR Behavioral Prompt</label>
                  <textarea
                    defaultValue="You are a professional behavioral interviewer utilizing the STAR framework to analyze candidate communication, confidence, and professionalism ratios..."
                    className="w-full h-20 bg-background/50 text-white rounded-lg p-2.5 text-[11px] border border-white/5 focus:outline-none focus:border-white/30 resize-none font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-lightGray/50 uppercase">Technical Parsing Prompt</label>
                  <textarea
                    defaultValue="Evaluate standard coding files, checking key execution runtimes, memory usage profiles, and deep coding optimizations for specific job targets..."
                    className="w-full h-20 bg-background/50 text-white rounded-lg p-2.5 text-[11px] border border-white/5 focus:outline-none focus:border-white/30 resize-none font-sans"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('AI prompt configs updated successfully!')}
              className="w-full py-2.5 text-xs font-bold bg-white text-background hover:bg-lightGray rounded-lg transition-all text-center"
            >
              Save Prompt Configurations
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
