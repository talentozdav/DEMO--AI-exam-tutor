
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Message, ExamType } from '../types';
import { getTutorResponse } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, ChevronDown, BookOpen, GraduationCap, Info, Image as ImageIcon, X, Lightbulb, HelpCircle, ArrowRight, Bookmark, Maximize2, Quote, CheckCircle } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

interface ImageState {
  data: string;
  mimeType: string;
  preview: string;
}

const ResponseRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = content.split('\n\n');
  
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        // Step detection (1., 2., etc)
        if (block.match(/^\d\./m)) {
          return (
            <div key={i} className="space-y-3 pl-1 border-l-2 border-emerald-100 py-1">
              {block.split('\n').filter(line => line.trim()).map((line, li) => (
                <div key={li} className="flex gap-3 items-start group">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {li + 1}
                  </span>
                  <p className="text-slate-700 leading-relaxed pt-0.5 font-medium">{line.replace(/^\d\.[ \t]*/, '')}</p>
                </div>
              ))}
            </div>
          );
        }

        // Definition / Key Concept detection
        if (block.includes('**Definition:**') || block.startsWith('>')) {
          return (
            <div key={i} className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-lg border-b-4 border-emerald-500 group">
              <Quote className="absolute -top-2 -right-2 w-16 h-16 opacity-10 rotate-12 group-hover:rotate-0 transition-transform" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Core Definition</span>
              </div>
              <p className="text-sm font-bold leading-relaxed italic">{block.replace(/(\*\*Definition:\*\*|>)/g, '').trim()}</p>
            </div>
          );
        }

        // Example detection
        if (block.toLowerCase().includes('example:') || block.toLowerCase().includes('for instance:')) {
          return (
            <div key={i} className="bg-amber-50 border-2 border-amber-100/50 p-5 rounded-3xl relative">
              <div className="absolute top-4 right-4 text-amber-200"><BookOpen size={20} /></div>
              <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Workbook Example
              </h5>
              <p className="text-slate-700 text-sm leading-relaxed font-semibold italic">{block}</p>
            </div>
          );
        }

        // Header detection
        if (block.startsWith('###') || (block.startsWith('**') && block.endsWith('**'))) {
          return (
            <div key={i} className="pt-2">
              <h4 className="text-emerald-900 font-black text-sm uppercase tracking-tight flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-500" />
                {block.replace(/[#*]/g, '').trim()}
              </h4>
              <div className="w-12 h-1 bg-emerald-500/20 rounded-full mt-1"></div>
            </div>
          );
        }

        // Standard Paragraph
        return <p key={i} className="text-slate-700 leading-relaxed font-medium">{block}</p>;
      })}
    </div>
  );
};

const AITutor: React.FC<Props> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello ${profile.name.split(' ')[0]}! I'm your DEMO AI Mentor. I can help you with ${profile.selectedSubjects[profile.exams[0]].join(', ')} for your ${profile.exams[0]} prep. 

Ask me anything or upload a photo of a diagram or question you're stuck on!`, 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<ExamType>(profile.exams[0]);
  const [activeSubject, setActiveSubject] = useState<string>(profile.selectedSubjects[profile.exams[0]][0] || 'Mathematics');
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageState | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedImage({
        data: base64,
        mimeType: file.type,
        preview: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customInput?: string) => {
    const msgText = customInput || input;
    if ((!msgText.trim() && !selectedImage) || isTyping) return;

    const currentImage = selectedImage;
    const currentInput = msgText;
    
    const userMessage: Message = { 
      role: 'user', 
      content: currentInput || "[Visual Content Analysis Requested]", 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const response = await getTutorResponse(
      currentInput || "Analyze the academic content in this image.", 
      activeMode, 
      activeSubject, 
      history,
      currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined
    );
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: response, 
      timestamp: Date.now() 
    }]);
    setIsTyping(false);
  };

  const handleModeChange = (mode: ExamType) => {
    setActiveMode(mode);
    const modeSubjects = profile.selectedSubjects[mode];
    if (modeSubjects && modeSubjects.length > 0) {
      setActiveSubject(modeSubjects[0]);
    }
  };

  const smartSuggestions = [
    `Simplify this explanation`,
    `Give me a practice drill`,
    `What are the exam hotspots for this?`,
    `Summarize into key points`
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none select-none z-0">
        <div className="absolute top-10 left-10 rotate-12"><GraduationCap size={160} /></div>
        <div className="absolute bottom-40 right-10 -rotate-12"><BookOpen size={140} /></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex flex-col gap-2 z-30 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Prep</p>
              <div className="flex gap-1.5 mt-0.5">
                {profile.exams.map(exam => (
                  <button 
                    key={exam}
                    onClick={() => handleModeChange(exam)}
                    className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-all ${
                      activeMode === exam 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-right relative">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syllabus</p>
            <button 
              onClick={() => setShowSubjectMenu(!showSubjectMenu)}
              className="flex items-center gap-2 group bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all mt-0.5 max-w-[140px]"
            >
              <span className="font-black text-emerald-800 text-[11px] truncate">{activeSubject}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${showSubjectMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSubjectMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-4 z-40 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-2 mb-2">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Select Subject</p>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar px-2">
                  {profile.selectedSubjects[activeMode].map(subject => (
                    <button 
                      key={subject}
                      onClick={() => {
                        setActiveSubject(subject);
                        setShowSubjectMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-[13px] font-bold flex items-center justify-between mb-1 ${
                        activeSubject === subject ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {subject}
                      {activeSubject === subject && <CheckCircle size={14} className="text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar scroll-smooth z-10 bg-gradient-to-b from-slate-50 to-white" 
        onClick={() => setShowSubjectMenu(false)}
      >
        <div className="flex justify-center">
          <div className="bg-emerald-900/5 backdrop-blur-sm border border-emerald-900/10 px-4 py-1.5 rounded-full text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <Info size={12} />
            Study Mode: {activeMode} {activeSubject}
          </div>
        </div>

        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            <div className={`flex gap-3 max-w-[94%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg self-end mb-1 ${
                m.role === 'user' 
                ? 'bg-white text-slate-400 border border-slate-200' 
                : 'bg-gradient-to-tr from-emerald-600 to-emerald-800 text-white'
              }`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <div className={`relative px-6 py-5 rounded-[32px] shadow-sm transition-all ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-br-none font-semibold' 
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-xl shadow-emerald-900/5'
                }`}>
                  {m.role === 'assistant' ? (
                    <ResponseRenderer content={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap text-[15px]">{m.content}</p>
                  )}
                  
                  {m.role === 'assistant' && (
                    <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
                      <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                        <Bookmark size={12} /> Save Note
                      </button>
                      <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                        <Maximize2 size={12} /> Focus View
                      </button>
                    </div>
                  )}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest text-slate-300 px-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] items-end">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-lg">
                <Bot size={18} />
              </div>
              <div className="bg-white px-6 py-6 rounded-[32px] rounded-bl-none border border-slate-100 shadow-lg flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-[10px] font-black text-emerald-800 tracking-widest uppercase">Consulting Syllabus...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-6" />
      </div>

      {/* Suggested Actions Bar */}
      {!isTyping && messages.length > 1 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto bg-white/50 backdrop-blur-md z-20 custom-scrollbar border-t border-slate-100">
          {smartSuggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => handleSend(s)}
              className="bg-white border-2 border-slate-100 px-5 py-2.5 rounded-2xl whitespace-nowrap text-[11px] font-black text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Lightbulb size={12} className="text-emerald-500" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Media Tray */}
      {selectedImage && (
        <div className="px-4 py-4 bg-emerald-900 text-white flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300 rounded-t-[32px]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={selectedImage.preview} alt="Input" className="h-14 w-14 rounded-xl object-cover border-2 border-white/20" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full shadow-lg"><X size={10} /></button>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-emerald-300">Image Attached</p>
              <p className="text-xs font-bold">Scanning for Exam Content...</p>
            </div>
          </div>
          <Sparkles className="animate-pulse text-emerald-400" size={24} />
        </div>
      )}

      {/* Premium Input Tray */}
      <div className="p-4 bg-white border-t border-slate-100 pb-10 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <div className="max-w-xl mx-auto">
          <div className="flex items-end gap-2 bg-slate-50 rounded-[32px] p-2 border-2 border-transparent focus-within:border-emerald-500/30 focus-within:bg-white focus-within:ring-8 focus-within:ring-emerald-50 transition-all duration-500">
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                selectedImage ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 hover:text-emerald-600 shadow-sm'
              }`}
            >
              <ImageIcon size={22} />
            </button>
            
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={selectedImage ? "Describe what to find..." : "Ask your exam question..."}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-[15px] resize-none font-bold text-slate-800 placeholder:text-slate-400 custom-scrollbar"
              style={{ minHeight: '48px', maxHeight: '140px' }}
            />
            
            <button 
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 hover:scale-110 active:scale-95 disabled:bg-slate-200 transition-all shadow-xl shadow-emerald-100"
            >
              {isTyping ? <Loader2 className="animate-spin" /> : <ArrowRight size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
