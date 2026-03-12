
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Privacy Policy</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 leading-relaxed custom-scrollbar">
        <div className="space-y-2 text-center pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">DEMO – SSCE Exam Tutor</h1>
          <p className="text-sm text-slate-400 font-medium">Last updated: May 2024</p>
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">1. Introduction</h3>
          <p className="text-sm">
            DEMO – SSCE Exam Tutor ("DEMO", "we", "our", or "us") respects your privacy and is committed to protecting the personal information of students, parents, and users who use our platform.
          </p>
          <p className="text-sm">
            This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, mobile web app (PWA), and related services (collectively, the “Service”).
          </p>
          <p className="text-sm">
            By using DEMO, you agree to the practices described in this Privacy Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">2. Information We Collect</h3>
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-800">2.1 Personal Information</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Exam type (WAEC, NECO, JAMB)</li>
              <li>Subjects selected</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-800">2.2 Student Learning Data</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Questions asked to the AI tutor</li>
              <li>Practice test results and scores</li>
              <li>Essay submissions and feedback</li>
              <li>Study progress and performance data</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">3. How We Use Your Information</h3>
          <p className="text-sm">We use collected information to:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Provide and improve learning services</li>
            <li>Personalize study plans and AI responses</li>
            <li>Track learning progress</li>
            <li>Communicate important updates</li>
            <li>Maintain platform security</li>
            <li>Process subscriptions and payments</li>
          </ul>
          <p className="text-sm font-bold text-blue-600">We do not sell or rent your personal data to third parties.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">4. AI & Data Usage</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Questions and answers may be processed by AI systems to generate responses.</li>
            <li>AI interactions are used only to improve learning experience and system quality.</li>
            <li>We do <strong>not</strong> use student data to encourage cheating or exam malpractice.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">5. Children’s Privacy</h3>
          <p className="text-sm">DEMO is designed for secondary school students.</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>We do not knowingly collect unnecessary personal data from children.</li>
            <li>Parents or guardians may review or request deletion of their child’s data.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">6. Data Storage & Security</h3>
          <p className="text-sm">
            We take reasonable measures to protect user data, including secure servers and databases, access controls, and encrypted connections.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">11. Contact Us</h3>
          <p className="text-sm">
            If you have questions or concerns about this Privacy Policy, contact us at:
          </p>
          <p className="text-sm font-bold text-blue-600">
            Email: <a href="mailto:democustomersupportservices@gmail.com">democustomersupportservices@gmail.com</a>
          </p>
        </section>

        <div className="pt-8 pb-10 text-center text-xs text-slate-400 border-t border-slate-100">
          <p>© 2024 DEMO – SSCE Exam Tutor</p>
          <p>Protecting student privacy while supporting exam success.</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
