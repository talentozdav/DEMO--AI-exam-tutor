
import React, { useState } from 'react';
import { UserProfile, ExamType } from '../types';
import { SUBJECTS_LIST, EXAM_METADATA } from '../constants';
import { ArrowRight, ChevronLeft, Calendar, GraduationCap, BookOpen } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
  initialData?: Partial<UserProfile>;
}

const Onboarding: React.FC<Props> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    exams: initialData?.exams || [],
    selectedSubjects: initialData?.selectedSubjects || { WAEC: [], NECO: [], JAMB: [] },
    examDates: initialData?.examDates || { WAEC: '', NECO: '', JAMB: '' },
    weakSubjects: initialData?.weakSubjects || [],
    isSubscribed: initialData?.isSubscribed || false,
  });

  const updateExams = (exam: ExamType) => {
    const current = formData.exams || [];
    if (current.includes(exam)) {
      setFormData({ ...formData, exams: current.filter(e => e !== exam) });
    } else {
      setFormData({ ...formData, exams: [...current, exam] });
    }
  };

  const updateSubjects = (exam: ExamType, subject: string) => {
    const subs = { ...formData.selectedSubjects } as Record<ExamType, string[]>;
    if (subs[exam].includes(subject) ) {
      subs[exam] = subs[exam].filter(s => s !== subject);
    } else {
      subs[exam] = [...subs[exam], subject];
    }
    setFormData({ ...formData, selectedSubjects: subs });
  };

  const updateDate = (exam: ExamType, date: string) => {
    const dates = { ...formData.examDates } as Record<ExamType, string>;
    dates[exam] = date;
    setFormData({ ...formData, examDates: dates });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const areDatesSet = () => {
    if (!formData.exams) return false;
    return formData.exams.every(exam => !!formData.examDates?.[exam]);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto">
      {step > 1 && (
        <button onClick={handleBack} className="mb-8 p-2 -ml-2 hover:bg-slate-100 rounded-full w-fit">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
      )}

      {step === 1 && (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-3xl flex flex-col items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-200 relative overflow-hidden">
              <GraduationCap className="w-10 h-10 z-10" />
              <BookOpen className="w-6 h-6 -mt-1 opacity-90 z-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to DEMO</h1>
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Digital Exam mentor</p>
            <p className="text-slate-400 text-sm mt-4">Your AI-powered guide to smashing WAEC, NECO & JAMB exams.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all"
                placeholder="Abiola Johnson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Phone</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <button 
            disabled={!formData.name || !formData.email}
            onClick={handleNext}
            className="mt-auto w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">What are you writing?</h2>
          <p className="text-slate-500 mb-8">You can select multiple exams if you're taking more than one.</p>
          
          <div className="space-y-4">
            {(['WAEC', 'NECO', 'JAMB'] as ExamType[]).map(exam => (
              <button 
                key={exam}
                onClick={() => updateExams(exam)}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                  formData.exams?.includes(exam) 
                    ? 'border-emerald-600 bg-emerald-50' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <h3 className="text-xl font-bold text-slate-900">{exam}</h3>
                <p className="text-slate-500 text-sm">{EXAM_METADATA[exam].fullName}</p>
              </button>
            ))}
          </div>

          <button 
            disabled={!formData.exams?.length}
            onClick={handleNext}
            className="mt-auto w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Your Subjects</h2>
          <p className="text-slate-500 mb-6">Pick the subjects you'll be writing in your selected exams.</p>
          
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            {formData.exams?.map(exam => (
              <div key={exam}>
                <h3 className="font-bold text-emerald-600 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
                  {exam} Subjects
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS_LIST.map(subject => (
                    <button 
                      key={subject}
                      onClick={() => updateSubjects(exam, subject)}
                      className={`p-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                        formData.selectedSubjects?.[exam].includes(subject)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            disabled={!formData.exams?.every(e => formData.selectedSubjects?.[e].length > 0)}
            onClick={handleNext}
            className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            Set Exam Dates
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">When are your exams?</h2>
          <p className="text-slate-500 mb-8">We'll use this to build your personalized countdown and study timeline.</p>
          
          <div className="space-y-6">
            {formData.exams?.map(exam => (
              <div key={exam} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-slate-900">
                  <Calendar className="text-emerald-600 w-5 h-5" />
                  <h3 className="font-bold text-lg">{exam} Start Date</h3>
                </div>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.examDates?.[exam] || ''}
                  onChange={(e) => updateDate(exam, e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-700 bg-white"
                />
              </div>
            ))}
          </div>

          <button 
            disabled={!areDatesSet()}
            onClick={() => onComplete(formData as UserProfile)}
            className="mt-auto w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
