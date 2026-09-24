
import React, { useState } from 'react';
import { ChevronLeft, Mail, MessageSquare, Send, Phone, ExternalLink, AlertCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const ContactSupport: React.FC<Props> = ({ onBack }) => {
  const [form, setForm] = useState({ subject: '', message: '' });

  const handleSendViaEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;

    const emailSubject = encodeURIComponent(`[DEMO Exams Support] ${form.subject.trim()}`);
    const emailBody = encodeURIComponent(form.message.trim());
    window.location.href = `mailto:democustomersupportservices@gmail.com?subject=${emailSubject}&body=${emailBody}`;
  };

  const handleSendViaWhatsApp = () => {
    const text = form.subject.trim() || form.message.trim()
      ? encodeURIComponent(`*${form.subject.trim() || 'Support Request'}*\n\n${form.message.trim()}`)
      : '';
    const url = text ? `https://wa.me/2347078966300?text=${text}` : 'https://wa.me/2347078966300';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white min-h-screen flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-xs">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Help & Support</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-20">
        <section className="text-center space-y-2 py-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Direct Academic Support</h1>
          <p className="text-xs text-slate-500 font-medium">Reach our official help channels directly via WhatsApp or Email.</p>
        </section>

        {/* Direct Action Cards */}
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={handleSendViaWhatsApp}
            className="flex items-center gap-4 p-4 bg-emerald-600 text-white rounded-2xl shadow-md hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer text-left"
          >
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm uppercase tracking-tight">WhatsApp Official Support</p>
              <p className="text-xs text-emerald-100 font-semibold">+234 707 896 6300</p>
            </div>
            <ExternalLink size={16} className="opacity-70 shrink-0" />
          </button>

          <a 
            href="mailto:democustomersupportservices@gmail.com"
            className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-300 transition-all text-left group"
          >
            <div className="w-11 h-11 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Email Support Desk</p>
              <p className="text-xs text-slate-400 font-semibold truncate">democustomersupportservices@gmail.com</p>
            </div>
            <ExternalLink size={16} className="text-slate-300 group-hover:text-emerald-600 shrink-0 transition-colors" />
          </a>
        </div>

        {/* In-App Direct Inquiry Form */}
        <section className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">Draft Inquiry</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Compose your query below to launch your email app directly addressed to our support desk.
            </p>
          </div>

          <form onSubmit={handleSendViaEmail} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 px-1 tracking-wider">Subject</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Account query, Billing, Exam questions"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold placeholder:text-slate-300 bg-slate-50/50"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 px-1 tracking-wider">Message</label>
              <textarea 
                required
                rows={4}
                placeholder="Please describe your question or issue in detail..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold resize-none placeholder:text-slate-300 bg-slate-50/50"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button 
                type="button"
                onClick={handleSendViaWhatsApp}
                className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> Via WhatsApp
              </button>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Via Email
              </button>
            </div>
          </form>
        </section>

        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
          <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Frequently Asked Questions</h3>
          <div className="space-y-2.5">
            <details className="group bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
              <summary className="list-none font-bold text-xs text-slate-800 cursor-pointer flex justify-between items-center">
                Is DEMO free to use?
                <ChevronLeft className="w-4 h-4 -rotate-90 group-open:rotate-90 transition-transform text-slate-400" />
              </summary>
              <p className="text-[11px] text-slate-500 pt-2.5 leading-relaxed">
                DEMO provides free access to practice questions and AI tutoring during trial. Full packs are unlocked via subscription or referral milestones.
              </p>
            </details>
            <details className="group bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
              <summary className="list-none font-bold text-xs text-slate-800 cursor-pointer flex justify-between items-center">
                How does student privacy work?
                <ChevronLeft className="w-4 h-4 -rotate-90 group-open:rotate-90 transition-transform text-slate-400" />
              </summary>
              <p className="text-[11px] text-slate-500 pt-2.5 leading-relaxed">
                Your study data and test scores are private to your account and used only to track your progress and personalize your study sessions.
              </p>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactSupport;
