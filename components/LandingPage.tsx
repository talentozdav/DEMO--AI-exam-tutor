import React, { useState } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  BrainCircuit, 
  Target, 
  Zap, 
  Clock, 
  GraduationCap, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface Props {
  onStart: () => void;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
  onShowContact: () => void;
  onShowInstall: () => void;
}

const LandingPage: React.FC<Props> = ({ 
  onStart, 
  onShowPrivacy, 
  onShowTerms, 
  onShowContact, 
  onShowInstall 
}) => {
  const [activeTab, setActiveTab] = useState<'waec' | 'jamb' | 'neco'>('waec');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">DEMO</span>
              <span className="hidden sm:inline text-xs text-slate-500 font-medium ml-2">Digital Exam Mentor</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onShowInstall}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Install App
            </button>
            <button 
              onClick={onStart}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Built for Nigerian Secondary School Candidates</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Your Personal <span className="text-emerald-600">AI Exam Mentor</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Learn difficult topics. Practice real syllabus questions. Understand your mistakes with step-by-step guidance. Prepare smarter for <strong className="text-slate-800 font-semibold">WAEC, NECO & JAMB</strong>.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto flex-1 bg-emerald-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-center"
            >
              See How DEMO Works
            </a>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 3-Day Free Trial
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Official Syllabus-Aligned
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Low Data Usage
            </span>
          </div>
        </div>

        {/* Realistic Product Preview */}
        <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-bold tracking-wide">DEMO AI Mentor — WAEC Mathematics</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Product Preview</span>
          </div>

          <div className="p-5 sm:p-6 space-y-4 bg-slate-50/50 text-left">
            {/* Student Message */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl rounded-tr-none text-xs sm:text-sm max-w-xs sm:max-w-md leading-relaxed">
                I get confused solving quadratic equations using the formula method. Can you break down <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">2x² + 5x - 3 = 0</code>?
              </div>
            </div>

            {/* AI Mentor Response */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl rounded-tl-none text-xs sm:text-sm space-y-3 shadow-xs max-w-lg">
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-900">
                    No problem! In WAEC and NECO, the quadratic formula is:
                  </p>
                  <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl font-mono text-xs text-center font-bold">
                    x = [-b ± √(b² - 4ac)] / (2a)
                  </div>
                </div>

                <div className="space-y-1 text-slate-700">
                  <p className="font-medium">Step 1: Identify your coefficients from <span className="font-mono">ax² + bx + c = 0</span>:</p>
                  <p className="text-slate-600 pl-2">
                    • <span className="font-semibold">a = 2</span>, <span className="font-semibold">b = 5</span>, <span className="font-semibold">c = -3</span>
                  </p>
                  <p className="font-medium pt-1">Step 2: Calculate the discriminant <span className="font-mono">b² - 4ac</span>:</p>
                  <p className="text-slate-600 pl-2">
                    • 5² - 4(2)(-3) = 25 - (-24) = 25 + 24 = <strong className="text-slate-800">49</strong>
                  </p>
                  <p className="font-medium pt-1">Step 3: Take the square root: <span className="font-mono">√49 = 7</span></p>
                  <p className="text-slate-600 pl-2">
                    • x = (-5 + 7) / 4 = 2/4 = <strong className="text-emerald-700">1/2</strong>
                    <br />
                    • x = (-5 - 7) / 4 = -12/4 = <strong className="text-emerald-700">-3</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    Try One Yourself
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Explain with Factoring
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Give Exam Past Question
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Differentiator Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">The Learning Difference</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            DEMO doesn't just give you the answer.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Most study apps only display an answer key. DEMO identifies why you missed a question, explains the underlying rule, and teaches you how to get it right next time.
          </p>
        </div>

        {/* The 6-Step Loop Diagram */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <LoopCard 
              step="01" 
              title="Practice Question" 
              desc="You tackle a syllabus-aligned WAEC, NECO, or JAMB question." 
            />
            <LoopCard 
              step="02" 
              title="Submit Your Answer" 
              desc="Select your option or enter your theory solution for review." 
            />
            <LoopCard 
              step="03" 
              title="Pinpoint The Mistake" 
              desc="DEMO explains exactly where your calculation or reasoning went wrong." 
              highlight
            />
            <LoopCard 
              step="04" 
              title="Simpler Analogy" 
              desc="Get a clearer, step-by-step breakdown using familiar real-world concepts." 
            />
            <LoopCard 
              step="05" 
              title="Try Again" 
              desc="Solve a fresh similar question right away to reinforce understanding." 
            />
            <LoopCard 
              step="06" 
              title="System Adapts" 
              desc="Your study schedule automatically prioritizes this topic until mastered." 
              highlight
            />
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tools That Work</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Everything Needed for SSCE & UTME Success</h2>
          <p className="text-slate-600 text-sm sm:text-base">Comprehensive study tools designed around how Nigerian exams are actually graded.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard 
            icon={<BrainCircuit className="w-5 h-5 text-emerald-600" />}
            title="24/7 AI Exam Tutor"
            desc="Ask questions in simple English anytime. Upload photos of diagrams, equations, or past question papers for instant step-by-step guidance."
          />
          <FeatureCard 
            icon={<Target className="w-5 h-5 text-teal-600" />}
            title="Realistic JAMB CBT Mock"
            desc="Timed drills and full mock simulations that match official examination timing, question pacing, and speed-accuracy metrics."
          />
          <FeatureCard 
            icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
            title="WAEC & NECO Theory Coach"
            desc="Learn how to structure essay and theory answers according to WAEC and NECO marking scheme standards to maximize your step marks."
          />
          <FeatureCard 
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            title="Adaptive Study Missions"
            desc="Never wonder what to read today. Get daily targeted practice missions focusing directly on your specific weak subjects."
          />
        </div>
      </section>

      {/* Exam Coverage */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Covering Nigeria's Three Primary Exams</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Prepare for all your senior secondary examinations in one unified workspace.</p>
          </div>

          <div className="flex justify-center gap-2 p-1 bg-slate-100 rounded-xl max-w-xs mx-auto mb-6">
            {(['waec', 'jamb', 'neco'] as const).map(exam => (
              <button
                key={exam}
                onClick={() => setActiveTab(exam)}
                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  activeTab === exam ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {exam}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-3">
            {activeTab === 'waec' && (
              <>
                <h4 className="font-bold text-slate-900 text-base">West African Senior School Certificate Examination (WASSCE)</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Both Objective and Theory/Practical coverage for Science, Commercial, and Arts subjects with marking-scheme aligned explanations.
                </p>
              </>
            )}
            {activeTab === 'jamb' && (
              <>
                <h4 className="font-bold text-slate-900 text-base">Unified Tertiary Matriculation Examination (UTME)</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Fast-paced CBT drills, 40-to-60 question simulations, pacing analytics, and speed optimization for your 4 JAMB subjects.
                </p>
              </>
            )}
            {activeTab === 'neco' && (
              <>
                <h4 className="font-bold text-slate-900 text-base">National Examinations Council (SSCE Internal & External)</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Structured past question reviews and essay coaching aligned with the national curriculum and NECO marking patterns.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Security Notice */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center">
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Academic Integrity & Secure Authentication</h4>
              <p className="text-xs text-slate-600">Your learning profile and progress are protected with industry-standard cryptographic authentication.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-emerald-800 shrink-0">
            <span>₦1,000 / month</span>
            <span aria-hidden="true" className="text-emerald-300">·</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Ready to study smarter with DEMO?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Join candidates across Nigeria mastering difficult subjects, practicing past questions, and learning with their personal AI mentor.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 max-w-xs mx-auto">
            <button 
              onClick={onStart}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
            >
              Start Free 3-Day Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">DEMO</span>
            <span>— Digital Exam Mentor</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-medium">
            <button onClick={onShowInstall} className="hover:text-emerald-700 cursor-pointer">Install App</button>
            <button onClick={onShowContact} className="hover:text-emerald-700 cursor-pointer">Support</button>
            <button onClick={onShowPrivacy} className="hover:text-emerald-700 cursor-pointer">Privacy Policy</button>
            <button onClick={onShowTerms} className="hover:text-emerald-700 cursor-pointer">Terms of Use</button>
          </div>

          <p className="text-slate-400 text-center sm:text-right">
            © {new Date().getFullYear()} DEMO. Built for Nigerian candidates.
          </p>
        </div>
      </footer>
    </div>
  );
};

const LoopCard: React.FC<{ step: string; title: string; desc: string; highlight?: boolean }> = ({ 
  step, 
  title, 
  desc, 
  highlight 
}) => (
  <div className={`p-4 rounded-xl border text-left transition-all ${
    highlight 
      ? 'bg-emerald-50/60 border-emerald-300/80 shadow-xs' 
      : 'bg-white border-slate-200/80 hover:border-slate-300'
  }`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`text-[10px] font-black tracking-wider uppercase ${highlight ? 'text-emerald-700' : 'text-slate-400'}`}>
        Step {step}
      </span>
      {highlight && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
    </div>
    <h4 className="font-bold text-sm text-slate-900 mb-1">{title}</h4>
    <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ 
  icon, 
  title, 
  desc 
}) => (
  <div className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs text-left space-y-2.5 transition-all">
    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 text-base">{title}</h3>
    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
