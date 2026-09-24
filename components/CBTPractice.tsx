import React, { useState, useEffect } from 'react';
import { UserProfile, Question } from '../types';
import { generatePracticeQuestions } from '../services/geminiService';
import { supabase } from '../lib/supabaseClient';
import { recordDailyActivity } from '../utils/streakUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Timer, 
  Flag, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Loader2, 
  Target, 
  Clock, 
  Trophy, 
  ArrowRight, 
  XCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';

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
  const [reviewOnlyMistakes, setReviewOnlyMistakes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = async (selectedMode: SessionMode) => {
    setMode(selectedMode);
    setIsGenerating(true);
    setError(null);
    setAnswers({});
    setCurrentIdx(0);
    setIsFinished(false);
    setReviewOnlyMistakes(false);
    
    const subject = profile.selectedSubjects.JAMB?.[0] || 'Mathematics';
    const isEnglish = subject.toLowerCase().includes('english');
    
    let count = 10;
    let time = 600;

    if (selectedMode === 'DRILL') {
      count = 10;
      time = 600;
    } else if (selectedMode === 'FOCUS') {
      count = 20;
      time = 1500;
    } else if (selectedMode === 'FULL') {
      count = isEnglish ? 60 : 40;
      time = isEnglish ? 3600 : 2700;
    }

    setTimeLeft(time);

    try {
      const generated = await generatePracticeQuestions(count, 'JAMB', subject);
      if (generated && generated.length > 0) {
        setQuestions(generated);
      } else {
        setError("We couldn't load this practice session. Please try again.");
      }
    } catch (err) {
      console.error("CBT question generation failed:", err);
      setError("We couldn't load this practice session. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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

  const handleFinish = async () => {
    const answeredCount = Object.keys(answers).length;
    const unanswered = questions.length - answeredCount;
    
    const promptMessage = unanswered > 0 
      ? `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
      : "Are you sure you want to submit your CBT mock session?";

    if (confirm(promptMessage)) {
      const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
      const subject = profile.selectedSubjects.JAMB?.[0] || 'Mathematics';
      const now = Date.now();
      
      const newScore = {
        examType: 'JAMB' as const,
        subject,
        score,
        total: questions.length,
        timestamp: now
      };

      const { streak: updatedStreak } = recordDailyActivity(profile.studyStreak);

      const updatedProfile = {
        ...profile,
        studyStreak: updatedStreak,
        scores: [...(profile.scores || []), newScore]
      };

      onUpdateProfile(updatedProfile);

      // Record exam session in database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('exam_sessions').insert({
            userId: user.id,
            examType: 'JAMB',
            subject,
            score,
            total: questions.length,
            createdAt: now
          });
        }
      } catch (err) {
        console.warn('Failed to record exam session:', err);
      }

      setIsFinished(true);
    }
  };

  // Pre-session selector
  if (!mode) {
    const activeSubject = profile.selectedSubjects.JAMB?.[0] || 'Mathematics';
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto min-h-[calc(100vh-140px)] flex flex-col justify-center space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            JAMB CBT Practice
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Simulate realistic UTME test conditions for <strong className="text-slate-700 font-semibold">{activeSubject}</strong>.
          </p>
        </div>

        <div className="space-y-3">
          <SessionOption 
            icon={<Clock className="text-emerald-600" />} 
            title="Quick Drill" 
            desc="10 Questions • 10 Minutes" 
            badge="Fast Practice"
            onClick={() => startSession('DRILL')} 
          />
          <SessionOption 
            icon={<Target className="text-teal-600" />} 
            title="Focus Practice" 
            desc="20 Questions • 25 Minutes" 
            badge="Standard"
            onClick={() => startSession('FOCUS')} 
          />
          <SessionOption 
            icon={<Trophy className="text-amber-600" />} 
            title="Full UTME Simulation" 
            desc={`${activeSubject.toLowerCase().includes('english') ? '60' : '40'} Questions • Official Timings`} 
            badge="Full Length"
            onClick={() => startSession('FULL')} 
          />
        </div>

        <button 
          onClick={onBack} 
          className="w-full py-3 text-slate-500 font-bold text-xs uppercase tracking-wider hover:text-slate-800 transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-6 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Preparing Your CBT Exam</h3>
          <p className="text-xs text-slate-500">Retrieving syllabus questions and verifying answer keys...</p>
        </div>
      </div>
    );
  }

  // Error state if question retrieval fails
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-900 leading-snug">
            We couldn't load this practice session. Please try again.
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There was a problem retrieving exam questions. Please verify your connection and retry.
          </p>
        </div>
        <div className="flex flex-col w-full gap-2.5 pt-2">
          <button
            onClick={() => mode && startSession(mode)}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <button
            onClick={() => { setMode(null); setError(null); }}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Choose Different Mode
          </button>
        </div>
      </div>
    );
  }

  // Results Screen with structured post-exam learning loop
  if (isFinished) {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
    const totalDuration = mode === 'DRILL' ? 600 : mode === 'FOCUS' ? 1500 : 3600;
    const timeSpent = totalDuration - timeLeft;
    const avgSpeed = questions.length > 0 ? Math.round(timeSpent / questions.length) : 0;
    const accuracyPercent = Math.round((score / questions.length) * 100);

    const questionsToReview = reviewOnlyMistakes 
      ? questions.filter(q => answers[q.id] !== q.correctAnswer)
      : questions;

    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto pb-16">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Session Completed
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {score} <span className="text-xl sm:text-2xl text-slate-400 font-semibold">/ {questions.length}</span>
            </span>
          </div>
          <p className="text-xs font-bold text-emerald-700">
            {accuracyPercent}% Accuracy
          </p>
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Time Used</span>
            <p className="text-sm sm:text-base font-black text-slate-800 mt-1">{formatTime(timeSpent)}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Speed</span>
            <p className="text-sm sm:text-base font-black text-slate-800 mt-1">{avgSpeed}s / question</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Missed</span>
            <p className="text-sm sm:text-base font-black text-red-600 mt-1">{questions.length - score}</p>
          </div>
        </div>

        {/* Action Loop Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button 
            onClick={() => setReviewOnlyMistakes(!reviewOnlyMistakes)}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors text-center cursor-pointer"
          >
            {reviewOnlyMistakes ? "Show All Questions" : `Review Missed Only (${questions.length - score})`}
          </button>
          <button 
            onClick={() => setMode(null)}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all text-center cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Another Session
          </button>
        </div>

        {/* Detailed Correction & Explanations */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Detailed Explanations ({questionsToReview.length})
            </h3>
          </div>

          {questionsToReview.map((q, i) => {
            const isCorrect = answers[q.id] === q.correctAnswer;
            return (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                  isCorrect ? 'bg-emerald-50/60 border-emerald-100' : 'bg-red-50/60 border-red-100'
                }`}>
                  <span className="text-xs font-bold text-slate-600">Question {questions.indexOf(q) + 1}</span>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${
                    isCorrect ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {isCorrect ? 'Correct' : 'Missed'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">{q.text}</p>
                  
                  {/* Options List */}
                  <div className="space-y-1.5 pt-1">
                    {q.options?.map((opt, idx) => {
                      const isOptionCorrect = opt === q.correctAnswer;
                      const isOptionSelected = opt === answers[q.id];

                      let style = "border-slate-200 bg-slate-50 text-slate-600";
                      if (isOptionCorrect) {
                        style = "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = "border-red-300 bg-red-50 text-red-900 font-semibold";
                      }

                      return (
                        <div key={idx} className={`px-3 py-2 rounded-lg text-xs border flex items-center justify-between ${style}`}>
                          <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                          {isOptionCorrect && <span className="text-[10px] font-bold text-emerald-700 uppercase">Correct Answer</span>}
                          {isOptionSelected && !isOptionCorrect && <span className="text-[10px] font-bold text-red-600 uppercase">Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Marking Explanation */}
                  {q.explanation && (
                    <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                        Marking Explanation
                      </span>
                      <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={onBack} 
          className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Active Exam Interface (Distraction-Free)
  const currentQ = questions[currentIdx];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white max-w-2xl mx-auto w-full relative">
      {/* Top Exam Header: High-contrast timer & status */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">JAMB CBT Simulation</span>
          <p className="text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-[280px]">
            {profile.selectedSubjects.JAMB?.[0] || 'Mathematics'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Timer size={14} className={timeLeft <= 180 ? "text-amber-400 animate-pulse" : "text-emerald-400"} />
            <span className={`font-mono font-bold text-sm sm:text-base ${timeLeft <= 180 ? "text-amber-400" : "text-white"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button 
            onClick={handleFinish}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            {answers[currentQ?.id] ? 'Answered' : 'Not Answered'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {currentQ?.text}
        </h3>

        {/* Answer Choices */}
        <div className="space-y-2.5 pt-2">
          {currentQ?.options?.map((opt, i) => {
            const isSelected = answers[currentQ.id] === opt;
            return (
              <button 
                key={i} 
                onClick={() => setAnswers({...answers, [currentQ.id]: opt})} 
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer active:scale-[0.99] ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-semibold ring-1 ring-emerald-600' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${
                  isSelected 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-xs sm:text-sm flex-1">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Palette / Navigation Grid */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-1.5 overflow-x-auto shrink-0">
        {questions.map((q, i) => (
          <button 
            key={q.id} 
            onClick={() => setCurrentIdx(i)} 
            className={`min-w-[32px] h-8 rounded-lg text-xs font-bold border transition-all shrink-0 flex items-center justify-center cursor-pointer ${
              currentIdx === i 
                ? 'bg-slate-900 text-white border-slate-900' 
                : answers[q.id] 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' 
                  : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-3 shrink-0">
        <button 
          disabled={currentIdx === 0} 
          onClick={() => setCurrentIdx(currentIdx - 1)} 
          className="py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 uppercase tracking-wider disabled:opacity-30 transition-all cursor-pointer"
        >
          Previous
        </button>
        <button 
          onClick={() => currentIdx === questions.length - 1 ? handleFinish() : setCurrentIdx(currentIdx + 1)} 
          className="py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
        >
          {currentIdx === questions.length - 1 ? 'Finish Exam' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

const SessionOption: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  badge: string; 
  onClick: () => void; 
}> = ({ icon, title, desc, badge, onClick }) => (
  <button 
    onClick={onClick} 
    className="w-full p-4 sm:p-5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-2xl flex items-center justify-between transition-all shadow-xs cursor-pointer group text-left"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h4>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {badge}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
  </button>
);

export default CBTPractice;
