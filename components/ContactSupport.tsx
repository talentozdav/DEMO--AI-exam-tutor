
import React, { useState } from 'react';
import { ChevronLeft, Mail, MessageSquare, Send, CheckCircle2, Phone, ExternalLink } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const ContactSupport: React.FC<Props> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/2347078966300', '_blank');
  };

  if (submitted) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Message Received!</h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">Our expert academic support team will get back to you within 24 hours.</p>
        <button 
          onClick={onBack}
          className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Help & Support</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-20">
        <section className="text-center space-y-2 py-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-none">Need Help?</h1>
          <p className="text-[13px] text-slate-500 font-medium">Have a question or technical issue? We're here for you.</p>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handleWhatsApp}
            className="flex items-center gap-4 p-5 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-sm uppercase tracking-tight">WhatsApp Support</p>
              <p className="text-[10px] text-emerald-100 font-bold">+234 707 896 6300</p>
            </div>
            <ExternalLink size={16} className="opacity-60" />
          </button>

          <a 
            href="mailto:democustomersupportservices@gmail.com"
            className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-300 transition-all group"
          >
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Email Support</p>
              <p className="text-[10px] text-slate-400 font-bold">democustomersupportservices@gmail.com</p>
            </div>
          </a>
        </div>

        <section className="space-y-4 pt-4">
          <h3 className="font-black text-slate-900 px-1 uppercase text-xs tracking-widest">In-App Inquiry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 px-2 tracking-widest">Subject</label>
              <input 
                required
                type="text" 
                placeholder="e.g., Billing Issue, Feature Request"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold placeholder:text-slate-300 bg-slate-50/50"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 px-2 tracking-widest">Message</label>
              <textarea 
                required
                rows={4}
                placeholder="Describe your issue in detail..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold resize-none placeholder:text-slate-300 bg-slate-50/50"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-100"
            >
              <Send className="w-4 h-4" /> Send Inquiry
            </button>
          </form>
        </section>

        <section className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-4">
          <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Common Questions</h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="list-none font-black text-xs text-slate-700 cursor-pointer flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                Is DEMO truly free?
                <ChevronLeft className="w-4 h-4 -rotate-90 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-[12px] text-slate-500 p-4 leading-relaxed font-medium">
                Yes! All core features including the AI Tutor, Theory Coach, and JAMB CBT Mock are currently free for students.
              </p>
            </details>
            <details className="group">
              <summary className="list-none font-black text-xs text-slate-700 cursor-pointer flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                Data security for students?
                <ChevronLeft className="w-4 h-4 -rotate-90 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-[12px] text-slate-500 p-4 leading-relaxed font-medium">
                We take privacy seriously. Your learning data is used only to personalize your study experience.
              </p>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactSupport;
