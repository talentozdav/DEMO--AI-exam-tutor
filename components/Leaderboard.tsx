import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Users, Crown, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeaderboardEntry {
  id: string;
  name: string;
  referrals: number;
  activeReferrals: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
  isLoading?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onClose, isLoading }) => {
  // Sort by active referrals strictly based on real database records
  const validEntries = entries || [];
  const sortedEntries = [...validEntries].sort((a, b) => b.activeReferrals - a.activeReferrals);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-md">
              <Trophy size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Referral Champions</h2>
            <p className="text-amber-100 text-sm">Top referrers this month</p>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl pointer-events-none" />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Loading referral rankings...</p>
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Leaderboard data is currently unavailable.</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                No active referral rankings are available right now. Invite friends to start earning points and climb the board.
              </p>
            </div>
          ) : (
            sortedEntries.map((entry, index) => {
              const rank = index + 1;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-all border",
                    entry.isCurrentUser 
                      ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                      : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50"
                  )}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center items-center font-bold text-lg">
                    {rank === 1 ? <Crown className="text-amber-500" size={24} /> :
                     rank === 2 ? <Medal className="text-slate-400" size={22} /> :
                     rank === 3 ? <Medal className="text-amber-700" size={20} /> :
                     <span className="text-gray-400">{rank}</span>}
                  </div>

                  {/* Avatar/Initial */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                    rank === 1 ? "bg-amber-500" :
                    rank === 2 ? "bg-slate-400" :
                    rank === 3 ? "bg-amber-700" :
                    "bg-emerald-500"
                  )}>
                    {entry.name ? entry.name.charAt(0).toUpperCase() : 'S'}
                  </div>

                  {/* Name & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 truncate">{entry.name || 'Student'}</span>
                      {entry.isCurrentUser && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Users size={12} />
                      {entry.activeReferrals} active {entry.activeReferrals === 1 ? 'referral' : 'referrals'}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-gray-900 leading-none">
                      {entry.activeReferrals}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">pts</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
          >
            Close Leaderboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
