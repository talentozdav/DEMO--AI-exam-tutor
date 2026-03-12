
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const TermsOfUse: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Terms of Use</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 leading-relaxed custom-scrollbar">
        <div className="space-y-2 text-center pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">DEMO – SSCE Exam Tutor</h1>
          <p className="text-sm text-slate-400 font-medium">Last updated: December, 2025</p>
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h3>
          <p className="text-sm">
            By accessing or using **DEMO – SSCE Exam Tutor** ("DEMO", "we", "our", or "us"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.
          </p>
          <p className="text-sm">
            These Terms apply to all users, including students, parents, and schools, who access DEMO via our website or Progressive Web App (PWA).
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">2. Description of the Service</h3>
          <p className="text-sm">
            DEMO is an AI-powered study companion designed to help students prepare for **WAEC, NECO, and JAMB** examinations.
          </p>
          <p className="text-sm">The Service provides:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>AI-based tutoring and explanations</li>
            <li>Practice questions and mock tests</li>
            <li>Study planning and progress tracking</li>
          </ul>
          <p className="text-sm italic">
            DEMO is an <strong>educational support tool</strong> and does not guarantee any specific exam result.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">3. Eligibility</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>DEMO is intended for secondary school students.</li>
            <li>Users under 18 years of age should use the Service with the consent of a parent or guardian.</li>
            <li>By using DEMO, you confirm that the information you provide is accurate.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">5. Acceptable Use Policy</h3>
          <p className="text-sm">You agree <strong>not</strong> to:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Use DEMO for cheating, exam malpractice, or impersonation</li>
            <li>Upload false, abusive, or harmful content</li>
            <li>Attempt to copy, reverse-engineer, or disrupt the Service</li>
            <li>Misuse AI features for non-educational purposes</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">7. AI-Generated Content Disclaimer</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>AI responses are generated based on available data and prompts.</li>
            <li>While we aim for accuracy, AI explanations may contain errors.</li>
            <li>Users are encouraged to verify information and consult teachers where necessary.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">10. Limitation of Liability</h3>
          <p className="text-sm">To the maximum extent permitted by law:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>DEMO shall not be liable for exam results or academic outcomes</li>
            <li>DEMO is not responsible for data loss or service interruptions</li>
          </ul>
          <p className="text-sm">The Service is provided on an <strong>“as-is”</strong> basis.</p>
        </section>

        <section className="space-y-3 border-t pt-6">
          <h3 className="text-lg font-bold text-slate-900">13. Contact Information</h3>
          <p className="text-sm">For questions about these Terms, contact us at:</p>
          <p className="text-sm font-bold text-blue-600">
            Email: <a href="mailto:democustomersupportservices@gmail.com">democustomersupportservices@gmail.com</a>
          </p>
        </section>

        <div className="pt-8 pb-10 text-center text-xs text-slate-400 border-t border-slate-100">
          <p>© 2024 DEMO – SSCE Exam Tutor</p>
          <p>Helping students learn responsibly and prepare ethically for exams.</p>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUse;
