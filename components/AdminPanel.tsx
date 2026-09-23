import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../lib/supabaseClient';
import { ArrowLeft, Users, CreditCard, Bot, ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Award } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const AdminPanel: React.FC<Props> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Override controls
  const [targetUserId, setTargetUserId] = useState('');
  const [overrideDays, setOverrideDays] = useState(30);
  const [overrideAction, setOverrideAction] = useState<'grant_premium' | 'revoke_premium'>('grant_premium');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken() || '';
      const res = await fetch('/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Admin authentication failed');
      }
      const data = await res.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleOverride = async () => {
    if (!targetUserId.trim()) {
      alert('Please enter a target User ID');
      return;
    }
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const token = await getAuthToken() || '';
      const res = await fetch('/api/admin/overrideSubscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: targetUserId.trim(),
          action: overrideAction,
          days: overrideDays
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setActionSuccess(data.message || 'Successfully applied override');
      fetchMetrics();
    } catch (err: any) {
      alert(err.message || 'Error executing action');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-lg font-bold text-slate-900">Admin Control Center</h1>
          </div>
        </div>
        <button 
          onClick={fetchMetrics} 
          disabled={loading}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="p-4 max-w-md mx-auto w-full space-y-5 flex-1 pb-10">
        {error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-semibold">Access Restricted</p>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading authoritative metrics...
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                  <Users className="w-4 h-4 text-emerald-600" /> Total Students
                </div>
                <span className="text-2xl font-black text-slate-900">{metrics?.totalUsers ?? 0}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                  <Award className="w-4 h-4 text-amber-500" /> Active Subs
                </div>
                <span className="text-2xl font-black text-slate-900">{metrics?.activeSubscribers ?? 0}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Revenue (NGN)
                </div>
                <span className="text-xl font-black text-emerald-600">
                  ₦{(metrics?.totalRevenueNGN ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                  <Bot className="w-4 h-4 text-blue-500" /> AI Interacted
                </div>
                <span className="text-2xl font-black text-slate-900">{metrics?.totalAIInteractions ?? 0}</span>
              </div>
            </div>

            {/* Authoritative Subscription Override */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Authoritative Subscription Override
              </h2>

              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Student User ID (UID)
                </label>
                <input 
                  type="text" 
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Enter user's Firebase UID"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Action
                  </label>
                  <select 
                    value={overrideAction}
                    onChange={(e: any) => setOverrideAction(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="grant_premium">Grant Premium</option>
                    <option value="revoke_premium">Revoke Premium</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Duration (Days)
                  </label>
                  <input 
                    type="number"
                    value={overrideDays}
                    onChange={(e) => setOverrideDays(Number(e.target.value))}
                    disabled={overrideAction === 'revoke_premium'}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                onClick={handleOverride}
                disabled={actionLoading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Applying...' : 'Apply Override (Server Logged)'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
