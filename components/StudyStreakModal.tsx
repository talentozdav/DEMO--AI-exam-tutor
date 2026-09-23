import React from 'react';
import { StudyStreak } from '../types';
import { getStreakMilestone, getRollingSevenDays } from '../utils/streakUtils';
import { X, Flame, Trophy, Calendar, Sparkles, CheckCircle2, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  streak: StudyStreak;
  onClose: () => void;
  onStartCBT: () => void;
  onStartTutor: () => void;
}

const MILESTONES = [
  { days: 3, title: 'Spark Builder', reward: 'Streak badge unlocked', icon: Zap },
  { days: 7, title: 'Weekly Blaze', reward: 'Top 10% Consistency', icon: Flame },
  { days: 14, title: 'Torchbearer', reward: 'Memory Retention +45%', icon: Target },
  { days: 30, title: 'Academic Titan', reward: 'Full Exam Readiness', icon: Trophy },
];

const StudyStreakModal: React.FC<Props> = ({ streak, onClose, onStartCBT, onStartTutor }) => {
  const milestone = getStreakMilestone(streak.currentStreak);
  const weekDays = getRollingSevenDays(streak.activeDates);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-sm bg-white rounded-[36px] overflow-hidden shadow-2xl border border-slate-100 z-10"
      >
        {/* Header with Warm Flame Theme */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Flame size={120} />
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Flame className="w-10 h-10 text-amber-200 fill-amber-300 drop-shadow-md animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-100 uppercase tracking-widest">Active Momentum</p>
              <h2 className="text-3xl font-black tracking-tight flex items-baseline gap-1.5">
                {streak.currentStreak}
                <span className="text-lg font-bold">
                  {streak.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
                </span>
              </h2>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                Personal Best: {streak.longestStreak} {streak.longestStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 7-Day Activity Strip */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500" /> Past 7 Days
              </h4>
              <span className="text-[11px] font-bold text-slate-400">
                {streak.activeDates.length} total active days
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {weekDays.map((day) => (
                <div key={day.dateStr} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{day.dayName}</span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                      day.isActive
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-200'
                        : day.isToday
                        ? 'border-2 border-dashed border-orange-400 text-orange-600 bg-orange-50/50'
                        : 'bg-white text-slate-400 border border-slate-200/60'
                    }`}
                  >
                    {day.isActive ? (
                      <Flame className="w-4 h-4 fill-white" />
                    ) : (
                      <span>{day.dayNumber}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {day.isToday ? 'Today' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Rank / Milestone Progress */}
          <div className="bg-orange-50/60 border border-orange-100 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-orange-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Rank: {milestone.levelTitle}
              </span>
              <span className="font-black text-orange-700">
                {streak.currentStreak} / {milestone.nextMilestone} Days
              </span>
            </div>
            <div className="w-full h-2 bg-orange-200/70 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-700"
                style={{ width: `${milestone.progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-orange-800/90 font-medium leading-relaxed">
              {milestone.message}
            </p>
          </div>

          {/* Milestone Ladder */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Streak Milestones
            </h4>
            <div className="space-y-2">
              {MILESTONES.map((m) => {
                const Icon = m.icon;
                const achieved = streak.currentStreak >= m.days;
                return (
                  <div 
                    key={m.days}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      achieved 
                        ? 'bg-amber-50/70 border-amber-200 text-slate-900' 
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        achieved ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-black ${achieved ? 'text-slate-900' : 'text-slate-500'}`}>
                          {m.days} Days · {m.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">{m.reward}</p>
                      </div>
                    </div>
                    {achieved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">{m.days - streak.currentStreak}d left</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Study CTAs */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => { onClose(); onStartCBT(); }}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Target className="w-4 h-4" /> Start Quick CBT Test
            </button>
            <button
              onClick={() => { onClose(); onStartTutor(); }}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-orange-500" /> Ask AI Tutor a Question
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudyStreakModal;
