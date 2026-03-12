import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Users, Trophy, Gift, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReferralDashboardProps {
  user: UserProfile;
  onClose: () => void;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}?ref=${user.referralCode || 'DEMO'}`;
  const shareMessage = `I just found a free WAEC and JAMB practice site.

Practice here: ${referralLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Digital Exam Mentor',
          text: shareMessage,
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
      alert('Link copied to clipboard! You can now paste it to your friends.');
    }
  };

  const activeReferrals = user.activeReferralCount || 0;
  const totalReferrals = user.referralCount || 0;
  const progress = Math.min((activeReferrals / 20) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl text-white">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Referral Program</h2>
              <p className="text-sm text-gray-500">Invite friends and earn rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
          >
            <AlertCircle className="rotate-45 text-gray-400" size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Reward Goal */}
          <div className="bg-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={20} className="text-emerald-200" />
                <span className="text-emerald-100 font-medium uppercase tracking-wider text-xs">Current Goal</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Invite 20 friends → Get full WAEC and NECO questions pack</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progress: {activeReferrals} / 20 active friends</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  />
                </div>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
              <Trophy size={160} />
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Share2 size={18} className="text-emerald-600" />
              Your Unique Referral Link
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-sm text-gray-600 break-all">
                {referralLink}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  {copied ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Copy size={18} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-lg shadow-emerald-200"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              * Only active users count towards your goal. An active user is someone who completes at least one practice session.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Total Invited</div>
              <div className="text-2xl font-bold text-gray-900">{totalReferrals}</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="text-sm text-emerald-600 mb-1">Active Referrals</div>
              <div className="text-2xl font-bold text-emerald-700">{activeReferrals}</div>
            </div>
          </div>

          {/* Leaderboard Preview Link */}
          <div className="p-4 border border-dashed border-gray-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Trophy size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Referral Leaderboard</div>
                <div className="text-xs text-gray-500">See how you rank against others</div>
              </div>
            </div>
            <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
              View All <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReferralDashboard;
