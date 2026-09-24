
import React, { useState } from 'react';
import { ChevronLeft, Smartphone, Apple, Chrome, Share, PlusSquare, MoreVertical, Download, Zap, BookOpen } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const InstallGuide: React.FC<Props> = ({ onBack }) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('android');

  return (
    <div className="bg-white min-h-screen flex flex-col max-w-md mx-auto animate-in fade-in duration-300">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Install DEMO App</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-20">
        <section className="text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xl shadow-emerald-50">
            <Download className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-none">DEMO Anywhere</h1>
          <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
            Install the web app to your home screen for faster study sessions and a full-screen academic experience.
          </p>
        </section>

        {/* Platform Toggle */}
        <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
          <button 
            onClick={() => setPlatform('android')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${platform === 'android' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
          >
            <Smartphone size={16} /> Android
          </button>
          <button 
            onClick={() => setPlatform('ios')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${platform === 'ios' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
          >
            <Apple size={16} /> iOS (iPhone)
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          {platform === 'android' ? (
            <>
              <InstallStep 
                num="1" 
                icon={<Chrome size={20} className="text-blue-500" />} 
                title="Open Chrome" 
                desc="Launch Google Chrome and visit demoexams.netlify.app" 
              />
              <InstallStep 
                num="2" 
                icon={<MoreVertical size={20} className="text-slate-500" />} 
                title="Tap Menu" 
                desc="Tap the three dots icon at the top right corner of the browser." 
              />
              <InstallStep 
                num="3" 
                icon={<Download size={20} className="text-emerald-500" />} 
                title="Install App" 
                desc="Tap 'Install app' or 'Add to Home screen' from the menu." 
              />
              <InstallStep 
                num="4" 
                icon={<BookOpen size={20} className="text-slate-400" />} 
                title="Confirm" 
                desc="Click 'Install' or 'Add' in the popup to finish setup." 
              />
            </>
          ) : (
            <>
              <InstallStep 
                num="1" 
                icon={<Smartphone size={20} className="text-blue-400" />} 
                title="Open Safari" 
                desc="Open Safari browser and navigate to the DEMO website." 
              />
              <InstallStep 
                num="2" 
                icon={<Share size={20} className="text-blue-600" />} 
                title="Tap Share" 
                desc="Tap the Share icon (square with an arrow pointing up) at the bottom." 
              />
              <InstallStep 
                num="3" 
                icon={<PlusSquare size={20} className="text-slate-600" />} 
                title="Add to Home Screen" 
                desc="Scroll down the list of options and tap 'Add to Home Screen'." 
              />
              <InstallStep 
                num="4" 
                icon={<CheckCircle2 size={20} className="text-emerald-500" />} 
                title="Done" 
                desc="Tap 'Add' at the top right to create your desktop shortcut." 
              />
            </>
          )}
        </div>

        <section className="bg-emerald-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 -rotate-12" />
          <div className="relative z-10 space-y-4">
            <h3 className="font-black text-lg leading-tight">Why install DEMO?</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm font-medium">
                <span className="text-emerald-400 font-black">•</span>
                Instant access from your home screen
              </li>
              <li className="flex gap-3 text-sm font-medium">
                <span className="text-emerald-400 font-black">•</span>
                Full-screen academic focus mode
              </li>
              <li className="flex gap-3 text-sm font-medium">
                <span className="text-emerald-400 font-black">•</span>
                Lower data usage during study sessions
              </li>
            </ul>
          </div>
        </section>

        <button 
          onClick={onBack}
          className="w-full border-2 border-slate-100 text-slate-400 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
        >
          Close Guide
        </button>
      </main>
    </div>
  );
};

const InstallStep = ({ num, icon, title, desc }: { num: string, icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-5 rounded-[28px] border border-slate-100 flex items-start gap-4 hover:border-emerald-200 hover:shadow-lg transition-all group">
    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-300 text-sm shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
      {num}
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{title}</h4>
      </div>
      <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

const CheckCircle2 = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

export default InstallGuide;
