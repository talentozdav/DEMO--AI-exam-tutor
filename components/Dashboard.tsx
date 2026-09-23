
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
  ChevronLeft, 
  Camera, 
  Gift, 
  Share2,
  Flame
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 space-y-5"
    >
      {/* Greeting & Header Streak Flame */}
      <motion.section variants={item} className="space-y-1 relative">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-black text-slate-900">Hi, {profile.name.split(' ')[0]} 👋</h2>
          
          {/* Header Quick Flame Streak Counter */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/90 hover:border-orange-300 rounded-2xl shadow-xs transition-all group cursor-pointer active:scale-95"
            title="View Study Streak details"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black text-slate-800">
              {streak.currentStreak}
            </span>
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">
              {streak.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </button>
        </div>
        <p className="text-slate-500 font-medium">You have {profile.exams.join(' & ')} exams coming up.</p>
      </motion.section>

      {/* Study Streak Feature Card */}
      <motion.section variants={item}>
        <StudyStreakCard
          streak={streak}
          onOpenDetails={() => setShowStreakModal(true)}
          onStartStudy={() => onNavigate('practice')}
        />
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={item} className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onNavigate('tutor')}
          className="bg-emerald-600 text-white p-4 rounded-[28px] flex flex-col gap-3 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-100"
        >
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-black text-sm uppercase tracking-tighter">AI Tutor</p>
            <p className="text-[10px] text-emerald-100 font-medium">Ask & Learn 24/7</p>
          </div>
        </button>
        <button 
          onClick={() => onNavigate('tutor')}
          className="bg-teal-600 text-white p-4 rounded-[28px] flex flex-col gap-3 hover:bg-teal-700 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-teal-100"
        >
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-black text-sm uppercase tracking-tighter">Scan & Solve</p>
            <p className="text-[10px] text-teal-100 font-medium">Identify Diagrams</p>
          </div>
        </button>
        <button 
          onClick={() => onNavigate('practice')}
          className="bg-slate-900 text-white p-4 rounded-[28px] flex flex-col gap-3 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-200 col-span-2"
        >
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div className="text-left flex items-center justify-between w-full pr-2">
            <div>
               <p className="font-black text-sm uppercase tracking-tighter">Practice Q Bank</p>
               <p className="text-[10px] text-slate-400 font-medium">Smash Past Questions</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>
        </button>
      </motion.section>

      {/* Countdown Card */}
      <motion.section variants={item} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-emerald-600"><Calendar size={80} /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-widest">
            <Calendar className="w-4 h-4 text-emerald-600" /> Exam Countdown
          </h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {profile.exams.map(exam => {
            const daysLeft = calculateDaysLeft(profile.examDates[exam]);
            const progress = daysLeft !== null ? getProgressPercentage(daysLeft) : 0;
            
            return (
              <div key={exam} className="min-w-[140px] p-4 rounded-2xl bg-slate-50 border border-slate-100 relative group transition-all hover:bg-white hover:border-emerald-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{exam}</p>
                <div className="flex items-baseline gap-1">
                  {daysLeft === null ? (
                    <span className="text-lg font-black text-slate-300 italic">Not Set</span>
                  ) : daysLeft < 0 ? (
                    <span className="text-lg font-black text-emerald-600 uppercase">Passed</span>
                  ) : daysLeft === 0 ? (
                    <span className="text-2xl font-black text-amber-600 uppercase">Today!</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">{daysLeft}</span>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">days left</span>
                    </>
                  )}
                </div>
                <div className="mt-3 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${daysLeft !== null && daysLeft <= 7 ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                    style={{ width: `${progress}%` }}
                   ></div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Referral Program Card */}
      <motion.section variants={item}>
        <button 
          onClick={onShowReferral}
          className="w-full p-5 rounded-[32px] bg-amber-50 border border-amber-100 flex items-center justify-between group hover:bg-amber-100 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Gift className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-900">Refer & Earn</p>
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">Invite 20 friends for full access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-600 uppercase tracking-tighter">{profile.activeReferralCount || 0}/20</span>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </button>
      </motion.section>

      {/* Daily Study Plan */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Today's Smart Plan</h3>
          <button className="text-[10px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-tighter">
            View Schedule <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {MOCK_STUDY_PLAN.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-colors ${item.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                {item.completed ? (
                  <Play className="w-5 h-5 fill-current" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.time} • {item.subject}</p>
                <p className="font-bold text-slate-800 text-sm truncate">{item.task}</p>
              </div>
              {item.completed && (
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-emerald-50"></div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Specialized Tools */}
      <motion.section variants={item} className="space-y-4">
        <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest px-1">Pro Prep Tools</h3>
        {profile.exams.includes('JAMB') && (
          <button 
            onClick={onStartCBT}
            className="w-full p-5 rounded-[32px] bg-gradient-to-r from-emerald-500 to-emerald-700 text-white flex items-center justify-between shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-lg leading-tight">JAMB CBT Mock</p>
                <p className="text-[10px] text-emerald-50 font-bold uppercase tracking-widest opacity-80">Speed & Accuracy mode</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 opacity-60" />
          </button>
        )}
        {(profile.exams.includes('WAEC') || profile.exams.includes('NECO')) && (
          <button 
            onClick={onStartEssay}
            className="w-full p-5 rounded-[32px] bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center justify-between shadow-xl shadow-teal-100 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Book className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-lg leading-tight">Essay/Theory Coach</p>
                <p className="text-[10px] text-teal-50 font-bold uppercase tracking-widest opacity-80">Marking Scheme Guide</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 opacity-60" />
          </button>
        )}
      </motion.section>

      {/* Admin Section */}
      {(profile.email === 'democustomersupportservices@gmail.com' || (profile as any).role === 'admin') && onShowAdmin && (
        <motion.section variants={item}>
          <button 
            onClick={onShowAdmin}
            className="w-full p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 flex items-center gap-4 shadow-sm hover:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-xs uppercase tracking-wider text-emerald-400">Admin Control Center</p>
              <p className="text-[10px] text-slate-300 font-medium">Manage metrics, overrides & audit logs</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </motion.section>
      )}

      {/* Help Section */}
      <motion.section variants={item} className="pb-8">
        <button 
          onClick={onShowContact}
          className="w-full p-4 rounded-3xl bg-white border border-slate-100 flex items-center gap-4 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center">
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="font-black text-slate-900 text-xs uppercase tracking-tighter">Need academic help?</p>
            <p className="text-[10px] text-slate-500 font-medium">Contact our expert support team</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180" />
        </button>
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
