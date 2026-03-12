import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Users, ArrowUp, Crown } from 'lucide-react';
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
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onClose }) => {
  // Sort by active referrals
  const sortedEntries = [...entries].sort((a, b) => b.activeReferrals - a.activeReferrals);

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
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;

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
                  {entry.name.charAt(0)}
                </div>

                {/* Name & Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{entry.name}</span>
                    {entry.isCurrentUser && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} />
                    {entry.activeReferrals} active referrals
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-lg font-black text-gray-900 leading-none">
                    {entry.activeReferrals}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5">
                    <ArrowUp size={10} />
                    {Math.floor(Math.random() * 5) + 1}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
          >
            Close Leaderboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
