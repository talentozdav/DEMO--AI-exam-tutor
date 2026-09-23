import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Message, ExamType } from '../types';
import { getTutorResponse } from '../services/geminiService';
import { recordDailyActivity } from '../utils/streakUtils';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  BookOpen, 
  GraduationCap, 
  Info, 
  Image as ImageIcon, 
  X, 
  Lightbulb, 
  HelpCircle, 
  ArrowRight, 
  Bookmark, 
  CheckCircle,
  Camera,
  Target,
  FileQuestion,
  Layers,
  BrainCircuit
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
}

interface ImageState {
  data: string;
  mimeType: string;
  preview: string;
}

const ResponseRenderer: React.FC<{ 
  content: string; 
  onActionClick?: (actionPrompt: string) => void;
}> = ({ content, onActionClick }) => {
  const blocks = content.split('\n\n');
  
  return (
    <div className="space-y-4 text-left">
      {blocks.map((block, i) => {
        // Step detection (1., 2., etc)
        if (block.match(/^\d\./m)) {
          return (
            <div key={i} className="space-y-2.5 pl-1 border-l-2 border-emerald-300 py-1">
              {block.split('\n').filter(line => line.trim()).map((line, li) => (
                <div key={li} className="flex gap-2.5 items-start">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center border border-emerald-200 mt-0.5">
                    {li + 1}
                  </span>
                  <p className="text-slate-800 leading-relaxed font-normal text-xs sm:text-sm">{line.replace(/^\d\.[ \t]*/, '')}</p>
                </div>
              ))}
            </div>
          );
        }

        // Definition / Key Concept detection
        if (block.includes('**Definition:**') || block.startsWith('>')) {
          return (
            <div key={i} className="bg-slate-900 text-white p-4 rounded-xl relative overflow-hidden border-l-4 border-emerald-500">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Core Principle</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-100 italic">
                {block.replace(/(\*\*Definition:\*\*|>)/g, '').trim()}
              </p>
            </div>
          );
        }

        // Example detection
        if (block.toLowerCase().includes('example:') || block.toLowerCase().includes('for instance:')) {
          return (
            <div key={i} className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <BookOpen size={14} />
                <span>Worked Exam Example</span>
              </div>
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">{block}</p>
            </div>
          );
        }

        // Headers
        if (block.startsWith('###') || (block.startsWith('**') && block.endsWith('**') && block.length < 60)) {
          return (
            <div key={i} className="pt-2">
              <h4 className="text-slate-900 font-bold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-600" />
                {block.replace(/[#*]/g, '').trim()}
              </h4>
            </div>
          );
        }

        // Standard Paragraph
        return <p key={i} className="text-slate-800 leading-relaxed text-xs sm:text-sm">{block}</p>;
      })}
    </div>
  );
};

const AITutor: React.FC<Props> = ({ profile, onUpdateProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<ExamType>(profile.exams[0] || 'WAEC');
  const [activeSubject, setActiveSubject] = useState<string>(
    profile.selectedSubjects[profile.exams[0] || 'WAEC']?.[0] || 'Mathematics'
  );
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
      alert('Please select an image file (PNG, JPG, JPEG).');
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
      content: currentInput || "[Attached question diagram for analysis]", 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const response = await getTutorResponse(
        currentInput || "Analyze this academic diagram or question and provide a step-by-step breakdown.", 
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
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I encountered an issue connecting to the syllabus tutor. Please verify your connection and try asking again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }

    if (onUpdateProfile) {
      const { streak: updatedStreak, hasChanged } = recordDailyActivity(profile.studyStreak);
      if (hasChanged) {
        onUpdateProfile({ ...profile, studyStreak: updatedStreak });
      }
    }
  };

  const handleModeChange = (mode: ExamType) => {
    setActiveMode(mode);
    const modeSubjects = profile.selectedSubjects[mode];
    if (modeSubjects && modeSubjects.length > 0) {
      setActiveSubject(modeSubjects[0]);
    }
  };

  const smartFollowups = [
    "Explain simpler",
    "Give me an example",
    "Test me on this",
    "Show the steps",
    "What are the exam hotspots for this?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 relative overflow-hidden max-w-4xl mx-auto w-full">
      {/* Header / Active Syllabus Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 z-30 sticky top-0 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          {/* Exam Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Exam:</span>
            <div className="flex gap-1">
              {profile.exams.map(exam => (
                <button 
                  key={exam}
                  onClick={() => handleModeChange(exam)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeMode === exam 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>
          
          {/* Subject Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowSubjectMenu(!showSubjectMenu)}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200/80 transition-all text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-emerald-900 truncate max-w-[130px] sm:max-w-[200px]">
                {activeSubject}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${showSubjectMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSubjectMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 mb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Subject</span>
                </div>
                <div className="max-h-60 overflow-y-auto px-1">
                  {(profile.selectedSubjects[activeMode] || []).map(subject => (
                    <button 
                      key={subject}
                      onClick={() => {
                        setActiveSubject(subject);
                        setShowSubjectMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        activeSubject === subject ? 'text-emerald-800 bg-emerald-50' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{subject}</span>
                      {activeSubject === subject && <CheckCircle size={14} className="text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Stream or Dedicated Empty State */}
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth z-10" 
        onClick={() => setShowSubjectMenu(false)}
      >
        {messages.length === 0 ? (
          /* High-Quality Empty State */
          <div className="max-w-xl mx-auto py-8 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <BrainCircuit className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Ask DEMO Anything About Your Exam
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Type a difficult topic, upload a question diagram from your past questions booklet, or select a starter prompt below.
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
              <button
                onClick={() => handleSend(`Explain the core principles of ${activeSubject} in simple terms with a real exam question.`)}
                className="p-3.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <BookOpen className="w-4 h-4" /> Explain a Topic
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Break down fundamental concepts in {activeSubject} step-by-step.
                </p>
              </button>

              <button
                onClick={() => handleSend(`Give me a standard ${activeMode} exam question on ${activeSubject} and wait for my answer before revealing the solution.`)}
                className="p-3.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs mb-1">
                  <FileQuestion className="w-4 h-4" /> Test Me on Syllabus
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Get a diagnostic question and test your recall right now.
                </p>
              </button>

              <button
                onClick={() => handleSend(`What are the most frequently repeated exam topics and pitfalls in ${activeMode} ${activeSubject}?`)}
                className="p-3.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                  <Target className="w-4 h-4" /> Exam Hotspots & Traps
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Discover what examiners look for and common mistakes to avoid.
                </p>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
                  <Camera className="w-4 h-4" /> Scan a Question / Diagram
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Snap a photo of a textbook problem or geometry figure for AI analysis.
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
            >
              <div className={`flex gap-3 max-w-[92%] sm:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold self-end mb-1 shadow-xs ${
                  m.role === 'user' 
                    ? 'bg-slate-200 text-slate-700' 
                    : 'bg-emerald-600 text-white'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className="space-y-1">
                  <div className={`p-4 sm:p-5 rounded-2xl shadow-xs transition-all ${
                    m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-br-xs font-medium text-xs sm:text-sm' 
                      : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200'
                  }`}>
                    {m.role === 'assistant' ? (
                      <ResponseRenderer 
                        content={m.content} 
                        onActionClick={(prompt) => handleSend(prompt)} 
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                  <span className={`block text-[10px] font-semibold text-slate-400 px-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2.5 max-w-[85%] items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Bot size={16} />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-xs border border-slate-200 shadow-xs flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-xs font-semibold text-slate-600">DEMO is consulting the syllabus...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Contextual Follow-up Chips (When conversation is active) */}
      {!isTyping && messages.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-white/80 backdrop-blur-xs border-t border-slate-200">
          {smartFollowups.map((action, i) => (
            <button 
              key={i}
              onClick={() => handleSend(action)}
              className="bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Lightbulb size={12} className="text-emerald-600" />
              <span>{action}</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Image Attachment Tray */}
      {selectedImage && (
        <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800 animate-in slide-in-from-bottom-1 duration-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={selectedImage.preview} alt="Attachment" className="h-10 w-10 rounded-lg object-cover border border-white/20" />
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white p-0.5 rounded-full hover:bg-red-700"
                aria-label="Remove image"
              >
                <X size={10} />
              </button>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Image Attached</span>
              <p className="text-xs text-slate-200 font-medium">Ready for syllabus diagram analysis</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedImage(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Tutor Input Tray */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 z-20">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              selectedImage 
                ? 'bg-emerald-600 text-white' 
                : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-100'
            }`}
            title="Upload question photo or diagram"
            aria-label="Upload diagram image"
          >
            <ImageIcon size={18} />
          </button>
          
          <textarea 
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={selectedImage ? "Add context about this question (optional)..." : `Ask a question in ${activeSubject}...`}
            className="flex-1 bg-transparent px-2.5 py-2.5 outline-none text-xs sm:text-sm resize-none font-medium text-slate-900 placeholder:text-slate-400"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          
          <button 
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shrink-0 cursor-pointer"
            aria-label="Send message"
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
