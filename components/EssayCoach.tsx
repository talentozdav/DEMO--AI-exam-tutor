
import React, { useState, useEffect } from 'react';
import { UserProfile, Question } from '../types';
import { analyzeEssay, generatePracticeQuestions } from '../services/geminiService';
import { ChevronLeft, Send, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Lightbulb, TrendingUp, BookOpen, Loader2, ListChecks, Award, Target, Info, ArrowRight, ChevronDown, Flag, Star } from 'lucide-react';

interface Props {
  onBack: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const EssayCoach: React.FC<Props> = ({ onBack, profile, onUpdateProfile }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [results, setResults] = useState<Record<number, any>>({});
  const [activeSubject, setActiveSubject] = useState(profile.selectedSubjects.WAEC?.[0] || profile.selectedSubjects.NECO?.[0] || "English Language");
  const [expandedSection, setExpandedSection] = useState<'strengths' | 'weaknesses' | 'model' | null>('strengths');

  const fetchFreshSet = async () => {
    setIsLoadingQuestions(true);
    setResults({});
    setAnswers({});
    setCurrentIdx(0);
    const examType = profile.exams.find(e => e === 'WAEC' || e === 'NECO') || 'WAEC';
    const generated = await generatePracticeQuestions(3, examType, activeSubject, 'THEORY');
    if (generated && generated.length > 0) {
      setQuestions(generated);
    } else {
      setQuestions([{
        id: 'fallback_1',
        text: "Discuss the socio-economic impacts of urbanization in Nigeria.",
        explanation: "1. Define Urbanization: The shift from rural to urban areas.\n2. Economic Benefits: Job creation, industrialization.\n3. Social Challenges: Overcrowding, housing shortages.\n4. Infrastructure pressure: Roads, water, electricity.\n5. Summary: Need for sustainable urban planning.",
        type: 'THEORY',
        subjectId: activeSubject,
        examType: examType,
        year: 2025,
        correctAnswer: "Model answer placeholder"
      }]);
    }
    setIsLoadingQuestions(false);
  };

  useEffect(() => {
    fetchFreshSet();
  }, [activeSubject]);

  const handleAnalyze = async () => {
    const currentAnswer = answers[currentIdx];
    if (!currentAnswer?.trim()) return;

    setIsAnalyzing(true);
    const examType = profile.exams.find(e => e === 'WAEC' || e === 'NECO') || 'WAEC';
    const feedback = await analyzeEssay(questions[currentIdx].text, currentAnswer, examType);
    
    // Save score to profile for predictor
    const newScore = {
      examType: examType as any,
      subject: activeSubject,
      score: feedback.score,
      total: 100,
      timestamp: Date.now()
    };

    const updatedProfile = {
      ...profile,
      scores: [...(profile.scores || []), newScore]
    };
    onUpdateProfile(updatedProfile);

    setResults(prev => ({ ...prev, [currentIdx]: feedback }));
    setExpandedSection('strengths');
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-emerald-600', text: 'text-emerald-900', light: 'bg-emerald-50', border: 'border-emerald-100' };
    if (score >= 45) return { bg: 'bg-amber-500', text: 'text-amber-900', light: 'bg-amber-50', border: 'border-amber-100' };
    return { bg: 'bg-red-500', text: 'text-red-900', light: 'bg-red-50', border: 'border-red-100' };
  };

  const currentQ = questions[currentIdx];
  const currentResult = results[currentIdx];
  const theme = currentResult ? getScoreColor(currentResult.score) : { bg: '', text: '', light: '', border: '' };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">THEORY COACH</h2>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">Examiner AI Active</p>
          </div>
        </div>
        <select 
          value={activeSubject}
          onChange={(e) => setActiveSubject(e.target.value)}
          className="text-[10px] font-black text-slate-700 bg-slate-100 border-2 border-slate-200 rounded-2xl px-3 py-2 outline-none appearance-none"
        >
          {Array.from(new Set([...profile.selectedSubjects.WAEC, ...profile.selectedSubjects.NECO])).map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 custom-scrollbar">
        {isLoadingQuestions ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Accessing Syllabus</p>
              <p className="text-[11px] text-slate-400 font-bold mt-1">Generating unique exam-style tasks...</p>
            </div>
          </div>
        ) : !currentResult ? (
          <div className="space-y-6 max-w-lg mx-auto">
            {/* Question Card */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Question {currentIdx + 1}</span>
                <span className="text-slate-200 font-bold">/</span>
                <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{activeSubject}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-6 relative z-10">{currentQ?.text}</h3>
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 w-fit px-4 py-2 rounded-2xl border border-emerald-100">
                <Target size={14} />
                <span className="text-[11px] font-black uppercase tracking-tight tracking-widest">Official Standards</span>
              </div>
            </div>

            {/* Editor Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={12}/> Academic Workspace</h4>
                <div className="flex items-center gap-3">
                   <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-emerald-500 transition-all" 
                      style={{ width: `${Math.min(100, (answers[currentIdx]?.length || 0) / 15)}%` }}
                     ></div>
                   </div>
                   <span className="text-[10px] font-black text-slate-500">{answers[currentIdx]?.length || 0} WORDS</span>
                </div>
              </div>
              <textarea 
                value={answers[currentIdx] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentIdx]: e.target.value }))}
                placeholder="Structure your answer with an introduction, key points, and conclusion..."
                className="w-full h-80 p-8 rounded-[48px] border-2 border-slate-100 focus:border-emerald-500 focus:bg-white bg-white outline-none transition-all text-slate-800 leading-relaxed shadow-sm text-[16px] font-bold placeholder:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setCurrentIdx((currentIdx + 1) % questions.length)}
                className="bg-white border-2 border-slate-100 text-slate-500 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:border-slate-300 active:scale-95 transition-all"
              >
                Skip Task
              </button>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !answers[currentIdx]?.trim()}
                className="bg-emerald-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                {isAnalyzing ? "Submitting..." : "Analyze Grade"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-700">
            {/* Professional Grade Header */}
            <div className={`p-10 rounded-[48px] border-2 shadow-2xl text-center space-y-6 relative overflow-hidden transition-all ${theme.light} ${theme.border}`}>
              <Sparkles className="absolute top-4 right-4 w-12 h-12 opacity-20" />
              <div className="flex flex-col items-center">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Final Score</p>
                 <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-white ${theme.bg} text-white font-black text-6xl shadow-2xl relative z-10 animate-in zoom-in duration-1000`}>
                  {currentResult.score}%
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Official Feedback</h3>
                <p className="text-sm mt-4 leading-relaxed font-bold text-slate-600 px-4">{currentResult.feedback}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-3 bg-white/50">
                 <div className="h-full bg-emerald-600 transition-all duration-1500" style={{ width: `${currentResult.score}%` }}></div>
              </div>
            </div>

            {/* Interactive Report Card Sections */}
            <div className="space-y-3">
              <ReportSection 
                id="strengths"
                title="Syllabus Successes"
                icon={<CheckCircle2 size={18} />}
                color="emerald"
                items={currentResult.strengths}
                isExpanded={expandedSection === 'strengths'}
                onToggle={() => setExpandedSection(expandedSection === 'strengths' ? null : 'strengths')}
              />
              <ReportSection 
                id="weaknesses"
                title="Marking Scheme Gaps"
                icon={<AlertCircle size={18} />}
                color="amber"
                items={currentResult.weakAreas}
                isExpanded={expandedSection === 'weaknesses'}
                onToggle={() => setExpandedSection(expandedSection === 'weaknesses' ? null : 'weaknesses')}
              />
              <ReportSection 
                id="model"
                title="Model Marking Scheme"
                icon={<Flag size={18} />}
                color="slate"
                items={currentQ?.explanation.split('\n').filter(l => l.trim())}
                isExpanded={expandedSection === 'model'}
                onToggle={() => setExpandedSection(expandedSection === 'model' ? null : 'model')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pb-12">
               <button 
                  onClick={() => setResults({})}
                  className="bg-white border-2 border-slate-100 py-5 rounded-3xl font-black text-[11px] text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  Rewrite Answer
                </button>
                <button 
                  onClick={() => {
                    if (Object.keys(results).length === questions.length) fetchFreshSet();
                    else setCurrentIdx((currentIdx + 1) % questions.length);
                  }}
                  className="bg-emerald-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-200 active:scale-95 transition-all"
                >
                  {Object.keys(results).length === questions.length ? "End Session" : "Next Task"}
                  <ArrowRight size={16} />
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportSection = ({ id, title, icon, color, items, isExpanded, onToggle }: any) => {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-900 text-white border-slate-800"
  };

  return (
    <div className={`rounded-[32px] border-2 transition-all duration-300 ${colors[color]} ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}>
      <button 
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
           <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color === 'slate' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
              {icon}
           </div>
           <h4 className="font-black text-[11px] uppercase tracking-widest">{title}</h4>
        </div>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`h-px w-full mb-4 ${color === 'slate' ? 'bg-white/10' : 'bg-white/50'}`}></div>
          {items?.map((item: string, i: number) => (
            <div key={i} className="flex gap-4 items-start">
               <span className={`text-[10px] font-black mt-1 ${color === 'slate' ? 'text-emerald-400' : 'text-slate-400'}`}>{i + 1}.</span>
               <p className={`text-[13px] leading-relaxed font-bold ${color === 'slate' ? 'text-slate-300' : 'text-slate-600'}`}>{item.replace(/^\d\.[ \t]*/, '')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EssayCoach;
