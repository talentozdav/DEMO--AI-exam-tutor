import React, { useState } from 'react';
import { UserProfile, ExamType, Question } from '../types';
import { MOCK_QUESTIONS } from '../constants';
import { 
  Target, 
  Search, 
  Calendar, 
  Filter, 
  ChevronDown, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  FileQuestion,
  Book,
  ChevronRight
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  onStartEssay: () => void;
  onStartCBT: () => void;
}

const YEARS = ['All Years', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

const QuestionBank: React.FC<Props> = ({ profile, onStartEssay, onStartCBT }) => {
  const [activeExam, setActiveExam] = useState<ExamType>(profile.exams[0] || 'WAEC');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeSubjects = profile.selectedSubjects[activeExam] || [];
  const filteredSubjects = activeSubjects.filter(s => 
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Question Bank Archive</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Access official syllabus-aligned questions and launch targeted practice sessions.
        </p>
      </div>

      {/* Exam Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {profile.exams.map(exam => (
          <button 
            key={exam}
            onClick={() => {
              setActiveExam(exam);
              setShowYearDropdown(false);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all whitespace-nowrap cursor-pointer ${
              activeExam === exam 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {exam} Syllabus
          </button>
        ))}
      </div>

      {/* Flagship AI Generator Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-5 sm:p-6 rounded-2xl text-white shadow-md border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles size={80} />
        </div>
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-700/60 text-emerald-200">
            <Sparkles size={11} className="text-emerald-400" /> Syllabus AI Generator
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">Generate Targeted Practice Set</h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-normal leading-relaxed max-w-lg">
            Practice freshly generated questions matching {activeExam} examination patterns, complete with marking scheme solutions.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button 
              onClick={onStartCBT}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Target size={15} /> Start CBT Mock
            </button>
            <button 
              onClick={onStartEssay}
              className="bg-emerald-900/80 hover:bg-emerald-800/80 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-emerald-700/80 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Book size={15} /> Theory & Essay Set
            </button>
          </div>
        </div>
      </div>

      {/* Year Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Year Filter */}
        <div className="relative">
          <button 
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="w-full bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700 text-xs sm:text-sm">{selectedYear}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showYearDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
              {YEARS.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setShowYearDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedYear === year 
                      ? 'bg-emerald-50 text-emerald-900' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter subjects..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 px-1">
          {activeExam} Active Subjects ({filteredSubjects.length})
        </h3>

        {filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredSubjects.map(subject => (
              <div 
                key={subject} 
                onClick={onStartCBT}
                className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-emerald-300 hover:shadow-xs transition-all shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{subject}</h4>
                    <span className="text-[10px] font-semibold text-emerald-700">Official Syllabus Active</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 p-6 space-y-2">
            <FileQuestion className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No matching subjects found</p>
            <p className="text-[11px] text-slate-400">
              {searchQuery ? `No subjects match "${searchQuery}"` : `No subjects selected for ${activeExam}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
