
import React, { useState } from 'react';
import { UserProfile, ExamType, Question } from '../types';
import { MOCK_QUESTIONS } from '../constants';
import { FileText, Target, Search, Clock, Zap, Calendar, Filter, ChevronDown, BookOpen, Sparkles, Loader2, ArrowRight, ZapOff } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onStartEssay: () => void;
  onStartCBT: () => void;
}

const YEARS = ['All Years', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

const QuestionBank: React.FC<Props> = ({ profile, onStartEssay, onStartCBT }) => {
  const [activeExam, setActiveExam] = useState<ExamType>(profile.exams[0]);
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const filteredQuestions = MOCK_QUESTIONS.filter(q => {
    const matchExam = q.examType === activeExam;
    const matchYear = selectedYear === 'All Years' || q.year.toString() === selectedYear;
    return matchExam && matchYear;
  });

  const questionCount = filteredQuestions.length;

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900">Question Bank</h2>
        <p className="text-slate-500 font-medium text-sm">Practice makes perfect. Choose your mode.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
        {profile.exams.map(exam => (
          <button 
            key={exam}
            onClick={() => {
              setActiveExam(exam);
              setShowYearDropdown(false);
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs border transition-all whitespace-nowrap ${
              activeExam === exam 
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {exam} Past Qs
          </button>
        ))}
      </div>

      {/* AI Fresh Questions Feature */}
      <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 p-6 rounded-[32px] text-white shadow-xl shadow-blue-100 relative overflow-hidden group border-4 border-white">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Sparkles size={80} /></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
            <Zap size={10} className="text-amber-300" /> Syllabus AI
          </div>
          <h3 className="text-xl font-black">AI Practice Generator</h3>
          <p className="text-xs text-blue-100 font-medium leading-relaxed max-w-[80%]">
            Generate original exam-style questions aligned with official standards. No copies, just fresh content.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={onStartCBT}
              className="bg-white text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              Start CBT Mock
            </button>
            <button 
              onClick={onStartEssay}
              className="bg-blue-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all border border-blue-400 flex items-center justify-center gap-1.5"
            >
              Theory Set
            </button>
          </div>
        </div>
      </div>

      {/* Year Filter Dropdown */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2 px-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Filter size={10} className="text-blue-600" /> Exam Year Archive
          </label>
        </div>
        <button 
          onClick={() => setShowYearDropdown(!showYearDropdown)}
          className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-700 text-sm">{selectedYear}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showYearDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 max-h-60 overflow-y-auto custom-scrollbar p-2 animate-in zoom-in-95 fade-in duration-200">
            {YEARS.map(year => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setShowYearDropdown(false);
                }}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors ${
                  selectedYear === year 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest px-1">Subjects Available</h3>
        {profile.selectedSubjects[activeExam].length > 0 ? (
          profile.selectedSubjects[activeExam].map(subject => (
            <div key={subject} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-400 hover:shadow-md transition-all shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="font-black text-slate-700 text-sm">{subject}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">Syllabus Active</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <ZapOff className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No subjects selected for {activeExam}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 px-1">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search specific topics..." 
            className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-200 outline-none transition-all shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
