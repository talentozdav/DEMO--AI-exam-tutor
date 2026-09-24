import React from 'react';
import { UserProfile } from '../types';
import { Target, BookOpen, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onStartEssay: () => void;
  onStartCBT: () => void;
}

const QuestionBank: React.FC<Props> = ({ profile, onStartEssay, onStartCBT }) => {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            <Sparkles size={12} className="text-amber-600" />
            In Active Curation
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Question Bank — Coming Soon
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Our comprehensive past question archive for WAEC, NECO, and JAMB is currently being digitized and verified against official examination marking schemes.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">What's coming</span>
          <ul className="space-y-2 text-xs font-semibold text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              10+ years of official WAEC & NECO past papers with step-by-step theory solutions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              JAMB UTME past question archives categorized by topic and syllabus section
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              Official marking guide breakdowns and examiners' comments
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <p className="text-xs font-bold text-slate-700">
            Ready to study now? Launch our live practice tools:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={onStartCBT}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Target size={16} /> Start CBT Practice
            </button>
            <button
              onClick={onStartEssay}
              className="bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <BookOpen size={16} /> Launch Essay Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
