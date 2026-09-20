
import React from 'react';
import { ArrowRight, BookOpen, BrainCircuit, Target, Zap, Clock, GraduationCap, Download } from 'lucide-react';

interface Props {
  onStart: () => void;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
  onShowContact: () => void;
  onShowInstall: () => void;
}

const LandingPage: React.FC<Props> = ({ onStart, onShowPrivacy, onShowTerms, onShowContact, onShowInstall }) => {
  return (
    <div className="bg-white max-w-md mx-auto min-h-screen overflow-x-hidden flex flex-col pb-10">
      {/* Hero Section */}
      <section className="px-6 py-12 text-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-2xl flex flex-col items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-200 relative overflow-hidden">
          <GraduationCap className="w-8 h-8 z-10" />
          <BookOpen className="w-5 h-5 -mt-1 opacity-90 z-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
          Pass WAEC, NECO & JAMB with Confidence
        </h1>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          DEMO is an AI-powered SSCE exam tutor that helps Nigerian students understand subjects better, practice real questions, and study smart.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onStart}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
          >
            Continue with Google <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={onShowInstall}
            className="flex items-center justify-center gap-2 text-emerald-600 font-bold py-2 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <Download size={18} /> Install DEMO App
          </button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Built for Nigeria</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>WAEC & JAMB Focused</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>Low Data Usage</span>
        </div>
      </section>

      {/* The Problem */}
      <section className="px-6 py-12 bg-slate-900 text-white rounded-t-[40px] -mt-6">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Many Students Fail SSCE Exams</h2>
        <div className="space-y-4">
          {[
            "Topics are not well understood in class",
            "Past questions lack clear explanations",
            "Private lessons are expensive",
            "Students don't know what to read or when",
            "No personal teacher to ask questions anytime"
          ].map((pain, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-slate-300 text-sm leading-snug">{pain}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-emerald-400 font-bold text-sm italic">
          Result: Students study hard but still fail or barely pass.
        </p>
      </section>

      {/* The Solution */}
      <section className="px-6 py-12 bg-white">
        <div className="text-center mb-10">
          <span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">The Solution</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-4">Meet DEMO – Your Personal AI Exam Tutor</h2>
          <p className="text-slate-500 mt-2">Like a patient secondary school teacher in your pocket.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <SolutionCard icon={<BrainCircuit className="text-emerald-600" />} title="Explains topics step‑by‑step" />
          <SolutionCard icon={<Zap className="text-amber-500" />} title="Answers questions instantly" />
          <SolutionCard icon={<Target className="text-emerald-500" />} title="Focuses on official syllabuses" />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-12 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">How DEMO Works</h2>
        <div className="space-y-8 relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-emerald-100"></div>
          {[
            { step: "1", title: "Choose Your Exam", desc: "Select WAEC, NECO, or JAMB." },
            { step: "2", title: "Pick Your Subjects", desc: "Maths, English, Science, Arts & more." },
            { step: "3", title: "Learn with AI Tutor", desc: "Ask questions, get step-by-step explanations." },
            { step: "4", title: "Practice Real Questions", desc: "Study with past questions and CBT practice." },
            { step: "5", title: "Track Your Progress", desc: "See weak areas and improve before exam day." }
          ].map((item, i) => (
            <div key={i} className="flex gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xl shadow-sm">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Master Every Subject</h2>
        <div className="space-y-4">
          <FeatureItem 
            title="🧠 AI Tutor (24/7)" 
            desc="Explain differentiation, solve chemistry questions, or get physics shortcuts. Explains in simple English." 
            color="bg-emerald-50 text-emerald-600"
          />
          <FeatureItem 
            title="📘 SSCE Past Questions" 
            desc="Objective, theory & practicals with marking-scheme style AI guidance for every answer." 
            color="bg-indigo-50 text-indigo-600"
          />
          <FeatureItem 
            title="⏱️ JAMB CBT Practice" 
            desc="Timed exams on a real JAMB-style interface with speed & accuracy analysis." 
            color="bg-teal-50 text-teal-600"
          />
          <FeatureItem 
            title="📅 Smart Study Planner" 
            desc="AI-generated reading timetable tailored to your weak subjects and exam dates." 
            color="bg-emerald-50 text-emerald-700"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Pass Your Exams?</h2>
        <p className="text-slate-600 mb-8">Start studying smarter today with DEMO.</p>
        <button 
          onClick={onStart}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all"
        >
          Continue with Google
        </button>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-50 border-t">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex flex-col items-center justify-center text-white font-bold">
            <GraduationCap className="w-5 h-5" />
            <BookOpen className="w-3 h-3 -mt-1 opacity-70" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">DEMO</h1>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900">Explore</h4>
            <ul className="text-slate-500 text-sm space-y-2">
              <li onClick={onShowInstall} className="cursor-pointer hover:text-emerald-600 transition-colors flex items-center gap-2"><Download size={14}/> Install App</li>
              <li className="cursor-pointer hover:text-emerald-600 transition-colors">How It Works</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900">Support</h4>
            <ul className="text-slate-500 text-sm space-y-2">
              <li onClick={onShowContact} className="cursor-pointer hover:text-emerald-600 transition-colors">Contact Support</li>
              <li onClick={onShowPrivacy} className="cursor-pointer hover:text-emerald-600 transition-colors font-semibold text-emerald-500">Privacy Policy</li>
              <li onClick={onShowTerms} className="cursor-pointer hover:text-emerald-600 transition-colors font-semibold text-emerald-500">Terms of Use</li>
            </ul>
          </div>
        </div>
        <p className="text-slate-400 text-xs text-center">
          DEMO – SSCE Exam Tutor. Your AI companion for WAEC, NECO & JAMB success.
        </p>
      </footer>
    </div>
  );
};

const SolutionCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <span className="font-bold text-slate-800 text-sm">{title}</span>
  </div>
);

const FeatureItem = ({ title, desc, color }: { title: string, desc: string, color: string }) => (
  <div className={`p-6 rounded-3xl ${color.split(' ')[0]} border border-white`}>
    <h3 className={`font-black text-lg mb-2 ${color.split(' ')[1]}`}>{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
