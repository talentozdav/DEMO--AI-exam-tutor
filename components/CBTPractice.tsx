
import React, { useState, useEffect } from 'react';
import { UserProfile, Question } from '../types';
import { MOCK_QUESTIONS } from '../constants';
import { generatePracticeQuestions } from '../services/geminiService';
import { ChevronLeft, ChevronRight, Timer, Flag, CheckCircle, Info, Sparkles, Zap, Loader2, Target, Clock, Trophy, ArrowRight, XCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

type SessionMode = 'DRILL' | 'FOCUS' | 'FULL';

const CBTPractice: React.FC<Props> = ({ onBack, profile, onUpdateProfile }) => {
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const startSession = async (selectedMode: SessionMode) => {
    setMode(selectedMode);
    setIsGenerating(true);
    
    const subject = profile.selectedSubjects.JAMB[0] || 'Mathematics';
    const isEnglish = subject.toLowerCase().includes('english');
    
    let count = 10;
    let time = 600;

    if (selectedMode === 'DRILL') count = 10, time = 600;
    else if (selectedMode === 'FOCUS') count = 20, time = 1500;
    else if (selectedMode === 'FULL') count = isEnglish ? 60 : 40, time = isEnglish ? 3600 : 2700;

    setTimeLeft(time);

    try {
      const generated = await generatePracticeQuestions(count, 'JAMB', subject);
      if (generated && generated.length > 0) setQuestions(generated);
      else setQuestions(MOCK_QUESTIONS.filter(q => q.examType === 'JAMB').slice(0, count));
    } catch (error) {
      setQuestions(MOCK_QUESTIONS.filter(q => q.examType === 'JAMB').slice(0, count));
    }
    
    setIsGenerating(false);
  };

  useEffect(() => {
    if (mode && timeLeft > 0 && !isFinished && !isGenerating) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (mode && timeLeft === 0 && !isGenerating && !isFinished) {
      setIsFinished(true);
    }
  }, [timeLeft, isFinished, isGenerating, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    if (confirm("Are you sure you want to submit your CBT mock?")) {
      const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
      const subject = profile.selectedSubjects.JAMB[0] || 'Mathematics';
      
      const newScore = {
        examType: 'JAMB' as const,
        subject,
        score,
        total: questions.length,
        timestamp: Date.now()
      };

      const updatedProfile = {
        ...profile,
        scores: [...(profile.scores || []), newScore]
      };

      onUpdateProfile(updatedProfile);
      setIsFinished(true);
    }
  };

  if (!mode) {
    return (
      <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-md mx-auto h-full flex flex-col justify-center">
        <div className="text-center space-y-2 mb-4">
           <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8" />
           </div>
           <h2 className="text-3xl font-black text-slate-900">MOCK SESSION</h2>
           <p className="text-slate-500 font-medium">Test your readiness with timed exam sets.</p>
        </div>

        <div className="space-y-4">
          <SessionOption icon={<Clock className="text-blue-500" />} title="Quick Drill" desc="10 Questions • 10 Minutes" onClick={() => startSession('DRILL')} />
          <SessionOption icon={<Target className="text-emerald-500" />} title="Focus Practice" desc="20 Questions • 25 Minutes" onClick={() => startSession('FOCUS')} />
          <SessionOption icon={<Trophy className="text-amber-500" />} title="Full AI Mock" desc={`${profile.selectedSubjects.JAMB[0]?.includes('English') ? '60' : '40'} Questions • Official Timings`} onClick={() => startSession('FULL')} />
        </div>

        <button onClick={onBack} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600">Cancel & Exit</button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-6 text-center space-y-6">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase">Preparing Lab</h2>
          <p className="text-slate-400 font-medium">Generating unique practice questions...</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
    const timeSpent = (mode === 'DRILL' ? 600 : mode === 'FOCUS' ? 1500 : 3600) - timeLeft;
    const avgSpeed = questions.length > 0 ? Math.round(timeSpent / questions.length) : 0;

    return (
      <div className="p-4 space-y-8 animate-in zoom-in-95 duration-500 max-w-md mx-auto pb-20">
        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-2xl text-center space-y-4 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
           <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
              <Trophy className="w-10 h-10" />
           </div>
           <h2 className="text-4xl font-black text-slate-900">{score} / {questions.length}</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mock Final Result</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Time Used" value={formatTime(timeSpent)} icon={<Clock size={12}/>} />
          <StatCard label="Avg Pace" value={`${avgSpeed}s / q`} icon={<Zap size={12}/>} color="text-emerald-600" />
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-slate-900 px-1 uppercase text-xs tracking-widest flex items-center gap-2">
            <Target size={14} className="text-emerald-500" /> Correction & Insights
          </h3>
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-md">
              <div className={`px-5 py-3 flex items-center justify-between ${answers[q.id] === q.correctAnswer ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Q{i + 1}</span>
                <div className="flex items-center gap-2">
                   {answers[q.id] === q.correctAnswer ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                   <span className={`text-[10px] font-black uppercase ${answers[q.id] === q.correctAnswer ? 'text-emerald-600' : 'text-red-500'}`}>
                     {answers[q.id] === q.correctAnswer ? 'Accurate' : 'Missed'}
                   </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.text}</p>
                <div className="flex flex-wrap gap-2">
                   {q.options?.map((opt, idx) => (
                      <div key={idx} className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : opt === answers[q.id] ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {String.fromCharCode(65+idx)}. {opt}
                      </div>
                   ))}
                </div>
                
                {/* Logic Lab Explainer */}
                <div className="bg-emerald-900 p-5 rounded-2xl text-white space-y-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform"><Sparkles size={40} /></div>
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Logic Breakdown</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-emerald-50 font-medium">
                    {q.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onBack} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all">Done Reviewing</button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden">
      <div className="bg-emerald-600 p-4 pt-6 text-white flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center font-black">J</div>
          <div>
            <h2 className="font-black text-[10px] uppercase tracking-widest opacity-80">JAMB CBT</h2>
            <p className="text-sm font-black uppercase tracking-tight">{profile.selectedSubjects.JAMB[0]}</p>
          </div>
        </div>
        <div className="bg-emerald-900/40 px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
          <Timer size={16} />
          <span className="font-mono font-black text-lg leading-none">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 z-0">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
          <Flag className="w-4 h-4 text-slate-200" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 leading-tight">{currentQ?.text}</h3>
        <div className="space-y-3 pt-4">
          {currentQ?.options?.map((opt, i) => (
            <button key={i} onClick={() => setAnswers({...answers, [currentQ.id]: opt})} className={`w-full p-5 rounded-[28px] border-2 text-left transition-all flex items-center gap-5 active:scale-[0.98] ${answers[currentQ.id] === opt ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}>
              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm shrink-0 transition-all ${answers[currentQ.id] === opt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-300 border-slate-200'}`}>{String.fromCharCode(65 + i)}</div>
              <span className={`font-black text-[15px] ${answers[currentQ.id] === opt ? 'text-emerald-900' : 'text-slate-600'}`}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 pb-8 shadow-sm">
        <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)} className="py-5 border-2 border-slate-100 rounded-3xl font-black text-[10px] text-slate-400 uppercase tracking-widest disabled:opacity-20 transition-all">Prev</button>
        <button onClick={() => currentIdx === questions.length - 1 ? handleFinish() : setCurrentIdx(currentIdx + 1)} className="py-5 bg-emerald-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all">{currentIdx === questions.length - 1 ? 'Finish' : 'Next Question'}</button>
      </div>

      <div className="px-4 py-3 bg-slate-50 flex gap-2 overflow-x-auto border-t border-slate-100 custom-scrollbar">
        {questions.map((q, i) => (
          <button key={q.id} onClick={() => setCurrentIdx(i)} className={`min-w-[40px] h-10 rounded-xl text-[10px] font-black border-2 transition-all flex-shrink-0 flex items-center justify-center ${currentIdx === i ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-110' : answers[q.id] ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-300 border-slate-100'}`}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = 'text-slate-900' }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-1">
    <div className="flex items-center gap-2 mb-1">
      <div className="text-slate-300">{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

const SessionOption = ({ icon, title, desc, onClick }: any) => (
  <button onClick={onClick} className="w-full p-6 bg-white border-2 border-slate-100 rounded-[32px] flex items-center gap-5 hover:border-emerald-300 hover:shadow-xl transition-all active:scale-95 group text-left">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:scale-110 transition-all">{icon}</div>
    <div>
      <h4 className="font-black text-slate-900 leading-none">{title}</h4>
      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{desc}</p>
    </div>
  </button>
);

export default CBTPractice;
