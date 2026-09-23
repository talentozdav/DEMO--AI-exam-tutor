import React from 'react';
import { UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Target, CheckCircle2, Award, Flame, Calendar, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import JAMBScorePredictor from './JAMBScorePredictor';

interface Props {
  profile: UserProfile;
}

const ProgressTracker: React.FC<Props> = ({ profile }) => {
  const scores = profile.scores || [];
  const hasScores = scores.length > 0;

  // Calculate real metrics strictly from stored data
  const totalQuestionsAttempted = scores.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalCorrect = scores.reduce((sum, s) => sum + (s.score || 0), 0);
  const overallAccuracy = totalQuestionsAttempted > 0 
    ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) 
    : 0;

  // Aggregate by subject from real scores
  const subjectAggregates: Record<string, { correct: number; total: number }> = {};
  scores.forEach(s => {
    if (!subjectAggregates[s.subject]) {
      subjectAggregates[s.subject] = { correct: 0, total: 0 };
    }
    subjectAggregates[s.subject].correct += s.score;
    subjectAggregates[s.subject].total += s.total;
  });

  const chartData = Object.entries(subjectAggregates).map(([subject, stat]) => ({
    name: subject.length > 8 ? subject.substring(0, 8) + '...' : subject,
    fullName: subject,
    accuracy: Math.round((stat.correct / stat.total) * 100),
    attempted: stat.total
  }));

  const COLORS = ['#059669', '#0d9488', '#0284c7', '#d97706', '#4f46e5'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={item} className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Performance & Readiness</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Real learning analytics derived from your practice sessions.</p>
      </motion.div>

      {/* JAMB Predictor if student is enrolled in JAMB */}
      {profile.exams.includes('JAMB') && (
        <motion.div variants={item}>
          <JAMBScorePredictor profile={profile} />
        </motion.div>
      )}

      {/* Primary Metrics Grid */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Overall Accuracy</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {hasScores ? `${overallAccuracy}%` : '—'}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {hasScores ? `${totalCorrect} / ${totalQuestionsAttempted} correct` : 'No mock tests yet'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Questions Solved</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalQuestionsAttempted}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            Across {scores.length} session{scores.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Current Streak</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {profile.studyStreak?.currentStreak || 0} <span className="text-xs text-slate-500 font-normal">days</span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            Best: {profile.studyStreak?.bestStreak || 0} days
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Exams</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 truncate">
            {profile.exams.join(', ')}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            Target qualification
          </span>
        </div>
      </motion.div>

      {/* Subject Proficiency Chart (Based on Real Scores) */}
      <motion.section variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Subject Accuracy Breakdown</h3>
          <span className="text-[11px] text-slate-400 font-medium">Based on CBT sessions</span>
        </div>

        {chartData.length > 0 ? (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  unit="%" 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value}% Accuracy`, 'Performance']}
                  labelFormatter={(name) => {
                    const found = chartData.find(d => d.name === name);
                    return found?.fullName || name;
                  }}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-10 text-center space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Target className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-700">No Subject Scores Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete practice drills in the CBT Lab to generate your subject-by-subject accuracy report.
            </p>
          </div>
        )}
      </motion.section>

      {/* Recent Exam Sessions Log */}
      <motion.section variants={item} className="space-y-3">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider text-slate-600 px-1">
          Recent Exam Sessions ({scores.length})
        </h3>

        {hasScores ? (
          <div className="space-y-2">
            {scores.slice(-5).reverse().map((session, idx) => {
              const sessionAccuracy = Math.round((session.score / session.total) * 100);
              return (
                <div 
                  key={idx} 
                  className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      sessionAccuracy >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {sessionAccuracy}%
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {session.subject} ({session.examType})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {session.score} of {session.total} questions correct • {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {sessionAccuracy >= 70 ? 'Passed' : 'Needs Review'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No completed sessions recorded yet. Start practicing to build your study record.
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default ProgressTracker;
