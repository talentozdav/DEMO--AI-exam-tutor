import React, { useState, useEffect } from 'react';
import { UserProfile, ExamType, StudyStreak } from '../types';
import { MOCK_STUDY_PLAN } from '../constants';
import { recordDailyActivity } from '../utils/streakUtils';
import StudyStreakCard from './StudyStreakCard';
import StudyStreakModal from './StudyStreakModal';
import { 
  Calendar, 
  Clock, 
  Target, 
  ArrowRight, 
  Play, 
  Book, 
  BrainCircuit, 
  MessageCircleQuestion, 
  ChevronRight, 
  Camera, 
  Gift, 
  Flame,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  profile: UserProfile;
  onNavigate: (tab: string) => void;
  onStartEssay: () => void;
  onStartCBT: () => void;
  onShowContact: () => void;
  onShowReferral?: () => void;
  onShowAdmin?: () => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
}

const Dashboard: React.FC<Props> = ({ 
  profile, 
  onNavigate, 
  onStartEssay, 
  onStartCBT, 
  onShowContact, 
  onShowReferral, 
  onShowAdmin, 
  onUpdateProfile 
}) => {
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  // Track and record streak for today
  const [streak, setStreak] = useState<StudyStreak>(() => {
    const { streak: calculated } = recordDailyActivity(profile.studyStreak);
    return calculated;
  });

  useEffect(() => {
    const { streak: nextStreak, hasChanged } = recordDailyActivity(profile.studyStreak);
    setStreak(nextStreak);
    if (hasChanged && onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        studyStreak: nextStreak,
      });
    }
  }, [profile.studyStreak]);
  
  const calculateDaysLeft = (dateString: string) => {
    if (!dateString) return null;
    const examDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (daysLeft: number) => {
    const totalWindow = 100;
    const consumed = totalWindow - Math.min(daysLeft, totalWindow);
    return Math.max(0, Math.min(100, (consumed / totalWindow) * 100));
  };

  // Derive "Today's Study Mission" dynamically from real user data (weak subjects or active subjects)
  const primaryExam: ExamType = profile.exams[0] || 'WAEC';
  const subjectsForExam = profile.selectedSubjects[primaryExam] || [];
  const focusSubject = (profile.weakSubjects && profile.weakSubjects.length > 0 && profile.weakSubjects[0]) 
    || subjectsForExam[0] 
    || 'Mathematics';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto"
    >
      {/* 1. Student Identity & Quick Streak Bar */}
      <motion.section variants={item} className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hi, {profile.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Preparing for {profile.exams.join(' & ')}
          </p>
        </div>
        
        {/* Streak Indicator */}
        <button
          onClick={() => setShowStreakModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/90 hover:border-orange-300 rounded-xl shadow-xs transition-all group cursor-pointer active:scale-95 shrink-0"
          title="View Study Streak details"
        >
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-black text-slate-800">
            {streak.currentStreak}
          </span>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            {streak.currentStreak === 1 ? 'day' : 'days'}
          </span>
        </button>
      </motion.section>

      {/* 2. Today's Study Mission ("What should I do now?") */}
      <motion.section variants={item}>
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-emerald-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Sparkles size={96} />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-700/60 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Study Mission</span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Master {focusSubject} for {primaryExam}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 leading-relaxed max-w-xl">
                {profile.weakSubjects && profile.weakSubjects.includes(focusSubject)
                  ? `Focus session targeting your designated weak area in ${focusSubject}. Review step-by-step principles and practice standard exam questions.`
                  : `Complete today's active practice drill in ${focusSubject} to reinforce official syllabus concepts and track your accuracy.`
                }
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigate('tutor')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4" /> Start AI Mentor Session
              </button>
              <button
                onClick={() => onNavigate('practice')}
                className="px-4 py-2.5 bg-emerald-900/80 hover:bg-emerald-800/80 text-white font-semibold text-xs sm:text-sm rounded-xl border border-emerald-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Practice Questions <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. Quick Actions — Clear visual hierarchy */}
      <motion.section variants={item} className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Quick Study Tools
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Flagship: AI Tutor (Hero Card) */}
          <button 
            onClick={() => onNavigate('tutor')}
            className="sm:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-2xl flex items-center justify-between shadow-sm transition-all text-left cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Flagship Tool</span>
                <h4 className="text-base font-bold text-white">Ask DEMO AI Mentor</h4>
                <p className="text-xs text-emerald-100 font-normal">Step-by-step topic breakdown & scan questions</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Secondary: Practice Question Bank */}
          <button 
            onClick={() => onNavigate('practice')}
            className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xs transition-all text-left cursor-pointer active:scale-[0.99]"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Question Bank</h4>
              <p className="text-xs text-slate-500 font-normal">Syllabus past questions archive</p>
            </div>
          </button>
        </div>
      </motion.section>

      {/* 4. Exam Countdown Cards */}
      <motion.section variants={item} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
            <Calendar className="w-4 h-4 text-emerald-600" /> Exam Countdown
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profile.exams.map(exam => {
            const daysLeft = calculateDaysLeft(profile.examDates[exam]);
            const progress = daysLeft !== null ? getProgressPercentage(daysLeft) : 0;
            
            return (
              <div key={exam} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{exam}</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  {daysLeft === null ? (
                    <span className="text-base font-semibold text-slate-400 italic">Date Not Set</span>
                  ) : daysLeft < 0 ? (
                    <span className="text-base font-bold text-emerald-600 uppercase">Exam Concluded</span>
                  ) : daysLeft === 0 ? (
                    <span className="text-xl font-bold text-amber-600 uppercase">Today!</span>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{daysLeft}</span>
                      <span className="text-xs text-slate-500 font-medium">days left</span>
                    </>
                  )}
                </div>
                <div className="mt-2.5 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${daysLeft !== null && daysLeft <= 14 ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* 5. Pro Prep Tools (Specialized CBT / Essay) */}
      {(profile.exams.includes('JAMB') || profile.exams.includes('WAEC') || profile.exams.includes('NECO')) && (
        <motion.section variants={item} className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Exam Simulators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.exams.includes('JAMB') && (
              <button 
                onClick={onStartCBT}
                className="p-4 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-2xl flex items-center justify-between text-left transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">JAMB CBT Mock Exam</h4>
                    <p className="text-xs text-slate-500">Speed & accuracy timed mode</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>
            )}

            {(profile.exams.includes('WAEC') || profile.exams.includes('NECO')) && (
              <button 
                onClick={onStartEssay}
                className="p-4 bg-white border border-slate-200/80 hover:border-teal-300 rounded-2xl flex items-center justify-between text-left transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center shrink-0">
                    <Book className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Essay & Theory Coach</h4>
                    <p className="text-xs text-slate-500">Official marking scheme guidance</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>
            )}
          </div>
        </motion.section>
      )}

      {/* 6. Study Streak Card */}
      <motion.section variants={item}>
        <StudyStreakCard
          streak={streak}
          onOpenDetails={() => setShowStreakModal(true)}
          onStartStudy={() => onNavigate('practice')}
        />
      </motion.section>

      {/* 7. Today's Smart Study Schedule */}
      <motion.section variants={item} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Suggested Reading Schedule
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">Daily syllabus targets</span>
        </div>
        <div className="space-y-2">
          {MOCK_STUDY_PLAN.slice(0, 3).map(plan => (
            <div 
              key={plan.id} 
              className="bg-white p-3.5 rounded-xl border border-slate-200/70 flex items-center gap-3.5 hover:border-slate-300 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                plan.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {plan.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {plan.time} • {plan.subject}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{plan.task}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 8. Secondary Actions (Referral, Admin, Help) */}
      <motion.section variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {onShowReferral && (
          <button 
            onClick={onShowReferral}
            className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Invite Friends & Earn Rewards</h4>
                <p className="text-[11px] text-slate-500">Share your link with fellow candidates</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        )}

        <button 
          onClick={onShowContact}
          className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
              <MessageCircleQuestion className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Academic Support</h4>
              <p className="text-[11px] text-slate-500">Questions about your exams or account</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* Admin Link if authorized */}
        {(profile.email === 'democustomersupportservices@gmail.com' || (profile as any).role === 'admin') && onShowAdmin && (
          <button 
            onClick={onShowAdmin}
            className="sm:col-span-2 p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors text-xs font-bold px-4 cursor-pointer"
          >
            <span>Admin Control Center</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </motion.section>

      {/* Study Streak Details Modal */}
      <AnimatePresence>
        {showStreakModal && (
          <StudyStreakModal
            streak={streak}
            onClose={() => setShowStreakModal(false)}
            onStartCBT={() => onStartCBT()}
            onStartTutor={() => onNavigate('tutor')}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
