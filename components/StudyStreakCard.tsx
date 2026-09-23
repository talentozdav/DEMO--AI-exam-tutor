import React from 'react';
import { StudyStreak } from '../types';
import { getRollingSevenDays, getStreakMilestone } from '../utils/streakUtils';
import { Flame, Trophy, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  streak: StudyStreak;
  onOpenDetails: () => void;
  onStartStudy: () => void;
}

const StudyStreakCard: React.FC<Props> = ({ streak, onOpenDetails, onStartStudy }) => {
  const weekDays = getRollingSevenDays(streak.activeDates);
  const milestone = getStreakMilestone(streak.currentStreak);
  const todayEntry = weekDays.find((d) => d.isToday);
  const isStudiedToday = todayEntry?.isActive;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-orange-200/80 rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all hover:border-orange-300">
      {/* Subtle Background Watermark */}
      <div className="absolute -right-3 -bottom-3 p-4 opacity-5 pointer-events-none text-orange-600">
        <Flame size={110} />
      </div>

      {/* Top Bar: Flame Icon, Streak Count & Personal Best */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Flame Icon with Warm Dynamic Glow */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Flame className="w-7 h-7 fill-white drop-shadow-sm animate-pulse" />
            </div>
            {isStudiedToday && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" title="Active today">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {streak.currentStreak}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                {streak.currentStreak === 1 ? 'Day Study Streak' : 'Days Study Streak'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              {isStudiedToday ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Flame lit today!
                </span>
              ) : (
                <span className="text-orange-700 font-bold">
                  Study today to keep your streak burning
                </span>
              )}
            </p>
          </div>
        </div>

        {/* View Details / Best Streak Link */}
        <button
          onClick={onOpenDetails}
          className="flex flex-col items-end text-right p-1.5 -mr-1 hover:bg-white/60 rounded-xl transition-colors cursor-pointer group"
          title="View full study streak breakdown"
        >
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-orange-600">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" /> Best: {streak.longestStreak}d
          </span>
        </button>
      </div>

      {/* 7-Day Rolling Activity Strip */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2.5 sm:p-3 border border-orange-100/80 shadow-xs mb-3">
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {day.dayName}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                  day.isActive
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs shadow-orange-300'
                    : day.isToday
                    ? 'border-2 border-dashed border-orange-400 bg-orange-50/50 text-orange-600'
                    : 'bg-slate-50 text-slate-400 border border-slate-200/50'
                }`}
              >
                {day.isActive ? (
                  <Flame className="w-4 h-4 fill-white" />
                ) : (
                  <span>{day.dayNumber}</span>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-400 leading-none">
                {day.isToday ? 'Today' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Motivation Bar & Quick Study Link */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">{milestone.message}</span>
        </div>

        <button
          onClick={onStartStudy}
          className="shrink-0 text-[11px] font-black text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-0.5 uppercase tracking-wider cursor-pointer"
        >
          Study now →
        </button>
      </div>
    </div>
  );
};

export default StudyStreakCard;
