
import React from 'react';
import { UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import JAMBScorePredictor from './JAMBScorePredictor';

interface Props {
  profile: UserProfile;
}

const ProgressTracker: React.FC<Props> = ({ profile }) => {
  const data = profile.selectedSubjects[profile.exams[0]]?.map(s => ({
    name: s.substring(0, 5),
    score: Math.floor(Math.random() * 40) + 60,
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 space-y-6"
    >
      <motion.div variants={item} className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Performance</h2>
        <p className="text-slate-500">How ready are you for the exams?</p>
      </motion.div>

      {profile.exams.includes('JAMB') && (
        <motion.div variants={item}>
          <JAMBScorePredictor profile={profile} />
        </motion.div>
      )}

      <motion.div variants={item} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Readiness Score</p>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <motion.circle 
              cx="64" 
              cy="64" 
              r="56" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={351.8} 
              initial={{ strokeDashoffset: 351.8 }}
              animate={{ strokeDashoffset: 351.8 * 0.25 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-blue-600 rounded-full" 
            />
          </svg>
          <span className="absolute text-3xl font-bold text-slate-900">75%</span>
        </div>
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> +5% vs last week
          </div>
        </div>
      </motion.div>

      <motion.section variants={item} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 px-1">Subject Proficiency</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-3">
        <motion.div variants={item} className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-2">
          <div className="w-8 h-8 bg-amber-200/50 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h4 className="text-xs font-bold text-amber-800">Weak Topics</h4>
          <p className="text-[10px] text-amber-700 font-medium">Coordinate Geometry, Photosynthesis</p>
        </motion.div>
        <motion.div variants={item} className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-2">
          <div className="w-8 h-8 bg-emerald-200/50 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="text-xs font-bold text-emerald-800">Mastered</h4>
          <p className="text-[10px] text-emerald-700 font-medium">Cell Biology, Sets & Logic</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProgressTracker;
