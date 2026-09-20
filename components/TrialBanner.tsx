import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrialBannerProps {
  daysLeft: number;
  onUpgrade: () => void;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ daysLeft, onUpgrade }) => {
  if (daysLeft < 0) return null;

  const isLastDay = daysLeft <= 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-md mx-auto px-4 py-3 ${isLastDay ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'} border-b flex items-center justify-between gap-4 z-30`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${isLastDay ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className={`text-[11px] font-black uppercase tracking-wider ${isLastDay ? 'text-red-600' : 'text-emerald-600'}`}>
            {isLastDay ? 'Trial Ends Tomorrow' : `${Math.ceil(daysLeft)} Days Left in Trial`}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {isLastDay 
              ? "Upgrade for ₦1,000 to continue learning" 
              : "Enjoy full access to all premium features"}
          </p>
        </div>
      </div>
      <button 
        onClick={onUpgrade}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
          isLastDay 
            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
        }`}
      >
        <Zap className="w-3 h-3 fill-current" /> Upgrade
      </button>
    </motion.div>
  );
};

export default TrialBanner;
