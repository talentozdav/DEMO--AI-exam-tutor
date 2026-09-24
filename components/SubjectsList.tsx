
import React, { useState } from 'react';
import { UserProfile, ExamType } from '../types';
import { SUBJECTS_LIST } from '../constants';
import { Search, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  profile: UserProfile;
}

const SubjectsList: React.FC<Props> = ({ profile }) => {
  const [activeExam, setActiveExam] = useState<ExamType>(profile.exams[0]);
  const subjects = profile.selectedSubjects[activeExam];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 space-y-6"
    >
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {profile.exams.map(exam => (
          <button 
            key={exam}
            onClick={() => setActiveExam(exam)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap border transition-all ${
              activeExam === exam 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {exam} Syllabus
          </button>
        ))}
      </motion.div>

      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search topics..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
      </motion.div>

      <div className="space-y-4">
        {subjects.map(subject => {
          const subjectScores = (profile.scores || []).filter(
            s => s.subject === subject && (s.examType === activeExam || !s.examType)
          );
          const totalAttempted = subjectScores.reduce((sum, s) => sum + (s.total || 0), 0);
          const totalCorrect = subjectScores.reduce((sum, s) => sum + (s.score || 0), 0);
          const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;
          const isWeak = profile.weakSubjects && profile.weakSubjects.includes(subject);

          return (
            <motion.div 
              key={subject} 
              variants={item}
              className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${accuracy !== null && accuracy >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${accuracy ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {accuracy !== null ? `${accuracy}% Accuracy` : 'Not tested yet'}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Focus Designation</p>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {isWeak ? 'Target Priority (Weak)' : 'Standard Syllabus'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-2">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {totalAttempted > 0 ? `${totalAttempted} Qs Attempted` : 'Drills Available'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Challenge with actual session counts */}
      {(() => {
        const weeklyCompleted = Math.min(5, (profile.scores || []).length);
        const challengePercent = (weeklyCompleted / 5) * 100;
        return (
          <motion.div variants={item} className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-1">Weekly Challenge</h4>
              <p className="text-slate-400 text-sm mb-4">
                {weeklyCompleted === 0 
                  ? `Complete 5 practice sessions this week to build your ${activeExam} exam stamina.`
                  : weeklyCompleted >= 5
                  ? `Challenge completed! You finished 5 sessions this week.`
                  : `Complete ${5 - weeklyCompleted} more session${5 - weeklyCompleted === 1 ? '' : 's'} this week to reach your 5-drill goal.`
                }
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${challengePercent}%` }}></div>
                </div>
                <span className="text-xs font-bold">{weeklyCompleted}/5</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 blur-[80px] opacity-20 pointer-events-none"></div>
          </motion.div>
        );
      })()}
    </motion.div>
  );
};

export default SubjectsList;
