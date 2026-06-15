import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  BrainCircuit,
  GraduationCap,
  Send,
  Loader2,
  Mic,
  Camera,
  Award,
  Star,
  MoreVertical,
  X,
  Users,
  ArrowLeft,
  Percent,
  Atom,
  Heart,
  Zap,
  FlaskConical,
  Sparkles,
  Clock,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStudyAnswer, generateQuiz, generateStudyDiagram } from './services/geminiService';
import { LANGUAGES, translate } from './services/translations';
import type { AppLanguage } from './services/translations';
import type { Note, ScheduleItem, Progress, ChatMessage, Subject, User as UserType, Group, GroupMessage, GroupNote } from './types';

const SUBJECTS: Subject[] = ['Mathematics', 'Science', 'Biology', 'Physics', 'Chemistry', 'English'];

const getTimeGreeting = (lang: AppLanguage) => {
  const hr = new Date().getHours();
  if (hr < 5) return { label: translate('greet_night', lang, "Good Night"), icon: "🌙" };
  if (hr < 12) return { label: translate('greet_morning', lang, "Good Morning"), icon: "☀️" };
  if (hr < 16) return { label: translate('greet_afternoon', lang, "Good Afternoon"), icon: "🌤️" };
  if (hr < 21) return { label: translate('greet_evening', lang, "Good Evening"), icon: "🌇" };
  return { label: translate('greet_night', lang, "Good Night"), icon: "🌙" };
};

// Sub-helper to process **bold text**
const parseBoldWords = (text: string) => {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <strong key={i} className="font-extrabold text-slate-900 bg-slate-100 px-1 py-0.5 rounded-md border border-slate-200/55">
          {part}
        </strong>
      );
    }
    return part;
  });
};

const renderChatMessage = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 font-sans text-xs md:text-sm leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Match Markdown Headers e.g. ### Header or ## Header
        if (trimmed.startsWith('#')) {
          const depth = trimmed.match(/^#+/)?.[0].length || 1;
          const headingText = trimmed.replace(/^#+\s*/, '');
          const isHindi = /[\u0900-\u097F]/.test(headingText);
          const headerAccent = isHindi 
            ? "border-orange-200 bg-orange-50/50 text-orange-850" 
            : "border-indigo-150 bg-indigo-50/50 text-indigo-900";
          
          return (
            <h4 
              key={idx} 
              className={`font-black tracking-tight rounded-2xl px-3 py-1.5 border text-xs md:text-sm mt-4 mb-2 flex items-center gap-1.5 ${headerAccent}`}
            >
              <span>{isHindi ? "✨" : "💡"}</span>
              <span>{headingText}</span>
            </h4>
          );
        }
        
        // Bullet points starting with * or -
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          const content = trimmed.replace(/^[\*\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2 my-1">
              <span className="text-indigo-500 shrink-0 select-none text-[10px] pt-1.5">●</span>
              <span className="text-slate-700 font-medium">{parseBoldWords(content)}</span>
            </div>
          );
        }
        
        // Ordered items starting with dynamic digits e.g. 1. or 2.
        if (/^\d+\.\s/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s*/, '');
          const match = trimmed.match(/^(\d+)\.\s*/);
          const num = match ? match[1] : "•";
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5 my-1.5">
              <span className="bg-indigo-50 text-indigo-600 rounded-lg w-5 h-5 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-indigo-150/40 shadow-2xs">
                {num}
              </span>
              <span className="text-slate-700 font-medium pt-0.5">{parseBoldWords(content)}</span>
            </div>
          );
        }
        
        // Empty space separation
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        
        // Normal paragraph line
        return (
          <p key={idx} className="text-slate-705 leading-relaxed font-medium">
            {parseBoldWords(line)}
          </p>
        );
      })}
    </div>
  );
};

const SUBJECT_DETAILS: Record<Subject, { icon: any, color: string, bg: string, border: string, text: string, textHi: string }> = {
  'Mathematics': { 
    icon: Percent, 
    color: 'from-blue-500 to-indigo-600', 
    bg: 'bg-blue-50/60', 
    border: 'border-blue-100/50', 
    text: 'Mathematics',
    textHi: 'गणित (Maths)'
  },
  'Science': { 
    icon: Atom, 
    color: 'from-emerald-500 to-teal-600', 
    bg: 'bg-emerald-50/60', 
    border: 'border-emerald-100/50', 
    text: 'Science',
    textHi: 'विज्ञान (Science)'
  },
  'Biology': { 
    icon: Heart, 
    color: 'from-pink-500 to-rose-600', 
    bg: 'bg-pink-50/60', 
    border: 'border-pink-100/50', 
    text: 'Biology',
    textHi: 'जीव विज्ञान (Biology)'
  },
  'Physics': { 
    icon: Zap, 
    color: 'from-purple-500 to-violet-600', 
    bg: 'bg-purple-50/60', 
    border: 'border-purple-100/50', 
    text: 'Physics',
    textHi: 'भौतिकी (Physics)'
  },
  'Chemistry': { 
    icon: FlaskConical, 
    color: 'from-amber-500 to-orange-600', 
    bg: 'bg-amber-50/60', 
    border: 'border-amber-100/50', 
    text: 'Chemistry',
    textHi: 'रसायन शास्त्र (Chemistry)'
  },
  'English': { 
    icon: BookOpen, 
    color: 'from-sky-500 to-indigo-500', 
    bg: 'bg-sky-50/60', 
    border: 'border-sky-100/50', 
    text: 'English',
    textHi: 'अंग्रेजी (English)'
  }
};

const KEYS = {
  USER: 'studybuddy_user',
  NOTES: 'studybuddy_notes',
  SCHEDULE: 'studybuddy_schedule',
  PROGRESS: 'studybuddy_progress',
  GROUPS: 'studybuddy_groups',
  GROUP_MESSAGES: 'studybuddy_group_messages',
  GROUP_NOTES: 'studybuddy_group_notes',
  CHAT_HISTORY: 'studybuddy_chat_history',
};

const DEFAULT_USER = null;

const DEFAULT_NOTES: Note[] = [
  { id: 1, title: 'Derivative Basics', content: 'd/dx(sin x) = cos x\nd/dx(cos x) = -sin x', subject: 'Mathematics', updated_at: new Date().toISOString() },
  { id: 2, title: "Newton's Laws", content: 'F = ma. Action & Reaction are equal and opposite.', subject: 'Physics', updated_at: new Date().toISOString() }
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: 1, task: 'Math Review', time: '14:00', day: 'Monday', completed: false },
  { id: 2, task: 'Chemistry Revision', time: '10:00', day: 'Wednesday', completed: true }
];

const DEFAULT_PROGRESS: Progress[] = [
  { id: 1, subject: 'Mathematics', score: 4, total: 5, date: new Date().toISOString() }
];

const DEFAULT_GROUPS: Group[] = [
  { id: 1, name: 'Science Squad', description: 'Collaborative biology & chemistry studies', created_by: 2, created_at: new Date().toISOString(), member_count: 3 },
  { id: 2, name: 'Calc Warriors', description: 'Solving calculus step-by-step', created_by: 3, created_at: new Date().toISOString(), member_count: 2 }
];

const PEER_PRESENCE = [
  { id: 101, name: 'Alice Johnson', subject: 'Biology', online: true, avatar: '🦄', waveResponse: "Hey {name}! Let's conquer Biology today! 🔬" },
  { id: 102, name: 'Bob Smith', subject: 'Mathematics', online: true, avatar: '🦊', waveResponse: "Nice to see you {name}! Check out my new math note! ✏️" },
  { id: 103, name: 'Sarah Connor', subject: 'Physics', online: false, avatar: '🦉', waveResponse: "Just reading about Einstein! See you in group class later!" }
];

const getChatPlaceholder = (lang: AppLanguage) => {
  const placeholders: Record<AppLanguage, string> = {
    English: 'Ask a homework question or request a diagram...',
    Hindi: 'कोई होमवर्क प्रश्न पूछें या चित्र बनाने को कहें...',
    Hinglish: 'Apna homework Sawaal likhein ya diagram mangein...',
    Marathi: 'गृहपाठाचा प्रश्न विचारा किंवा आकृती मागा...',
    Tamil: 'கேள்வி கேட்கவும் அல்லது வரைபடம் கேட்கவும்...',
    Bengali: 'প্রশ্ন জিজ্ঞাসা করো বা ছবি আঁকতে বলো...',
    Spanish: 'Haz una pregunta o pide un diagrama...',
    French: 'Posez une question ou demandez un schéma...',
    German: 'Stelle eine Frage oder bitte um ein Diagramm...'
  };
  return placeholders[lang] || 'Ask a homework question...';
};

const getSolvingText = (lang: AppLanguage) => {
  const txt: Record<AppLanguage, string> = {
    English: 'Gemini is solving...',
    Hindi: 'जेमिनी शिक्षक हल कर रहे हैं...',
    Hinglish: 'Gemini solution dhoondh raha hai...',
    Marathi: 'जेमिनी सोडवत आहे...',
    Tamil: 'ஜெமिनी பதிலளிக்கிறது...',
    Bengali: 'জেমিনি সমাধান করছে...',
    Spanish: 'Gemini está respondiendo...',
    French: 'Gemini est en train de résoudre...',
    German: 'Gemini löst...'
  };
  return txt[lang] || 'Gemini is solving...';
};

const getFullscreenLabel = (lang: AppLanguage) => {
  const lbls: Record<AppLanguage, string> = {
    English: 'Fullscreen 📺',
    Hindi: 'पूरे स्क्रीन पर देखें 📺',
    Hinglish: 'Full Screen 📺',
    Marathi: 'पूर्ण स्क्रीनवर पहा 📺',
    Tamil: 'முழுத் திரை 📺',
    Bengali: 'ফুল স্ক্রিন 📺',
    Spanish: 'Pantalla completa 📺',
    French: 'Plein écran 📺',
    German: 'Vollbild 📺'
  };
  return lbls[lang] || 'Fullscreen';
};

const getListeningLabel = (lang: AppLanguage) => {
  const labels: Record<AppLanguage, string> = {
    English: 'Listening...',
    Hindi: 'सुन रहा हूँ...',
    Hinglish: 'Listening...',
    Marathi: 'ऐकत आहे...',
    Tamil: 'கேட்கிறது...',
    Bengali: 'শুনছি...',
    Spanish: 'Escuchando...',
    French: 'Écoute...',
    German: 'Zuhören...'
  };
  return labels[lang] || 'Listening...';
};

const getClearChatsLabel = (lang: AppLanguage) => {
  const translations: Record<AppLanguage, string> = {
    English: 'Clear Chats 🧹',
    Hindi: 'चैट साफ करें 🧹',
    Hinglish: 'Clear Chats 🧹',
    Marathi: 'चॅट साफ करा 🧹',
    Tamil: 'அழி 🧹',
    Bengali: 'মুছে ফেলো 🧹',
    Spanish: 'Limpiar chats 🧹',
    French: 'Effacer chats 🧹',
    German: 'Chats leeren 🧹'
  };
  return translations[lang] || 'Clear Chats';
};

const getChatIntroDesc = (lang: AppLanguage) => {
  const intro: Record<AppLanguage, string> = {
    English: 'Solve Homework, explain science, draft diagrams inside direct threads!',
    Hindi: 'होमवर्क के उत्तर पाएँ, विज्ञान को चित्र सहित समझें और शानदार आलेख बनाएँ!',
    Hinglish: 'Homework solve karein, drawings ke sath science samjhein aur diagrams banayein!',
    Marathi: 'गृहपाठ सोडवा, चित्रांसह विज्ञान समजावून घ्या आणि आकृत्या काढा!',
    Tamil: 'வீட்டுப்பாடம் செய்ய, அறிவியல் விளக்கங்கள் மற்றும் வரைபடங்களைப் பெறலாம்!',
    Bengali: 'হোমওয়ার্ক সমাধান ও ছবি এঁকে সাহায্য করে!',
    Spanish: 'Resuelve tareas y genera diagramas educativos!',
    French: 'Résout vos exercices et crée des illustrations !',
    German: 'Löst Aufgaben und erstellt Zeichnungen !'
  };
  return intro[lang] || 'Solve Homework...';
};

const parseBoldWordsInChalk = (text: string) => {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <strong key={i} className="font-black text-yellow-250 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded-md">
          {part}
        </strong>
      );
    }
    return part;
  });
};

const renderChatMessageInChalk = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-4 font-mono text-sm md:text-base leading-relaxed text-slate-100">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 
              key={idx} 
              className="font-black tracking-tight text-teal-300 border-b-2 border-dashed border-slate-700 pb-2 text-base md:text-lg mt-6 mb-3 flex items-center gap-1.5"
            >
              <span>🌟</span>
              <span>{headingText}</span>
            </h4>
          );
        }
        
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          const content = trimmed.replace(/^[\*\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start space-x-2.5 pl-2 my-1.5">
              <span className="text-yellow-400 shrink-0 select-none text-[12px] pt-1.5">★</span>
              <span className="text-slate-200 font-bold">{parseBoldWordsInChalk(content)}</span>
            </div>
          );
        }
        
        if (/^\d+\.\s/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s*/, '');
          const match = trimmed.match(/^(\d+)\.\s*/);
          const num = match ? match[1] : "•";
          return (
            <div key={idx} className="flex items-start space-x-2.5 pl-1.5 my-2">
              <span className="bg-slate-800 text-yellow-300 rounded-lg w-6 h-6 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-slate-700 shadow-2xs">
                {num}
              </span>
              <span className="text-slate-200 font-bold pt-0.5">{parseBoldWordsInChalk(content)}</span>
            </div>
          );
        }
        
        if (!trimmed) {
          return <div key={idx} className="h-2.5" />;
        }
        
        return (
          <p key={idx} className="text-slate-250 leading-relaxed font-bold">
            {parseBoldWordsInChalk(line)}
          </p>
        );
      })}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const [notebookTab, setNotebookTab] = useState<'notes' | 'planner'>('notes');
  const [waveToast, setWaveToast] = useState<{ name: string; response: string; points: number } | null>(null);

  // Retro Audio effects
  const playAudioChime = (type: 'coin' | 'levelUp' | 'success' | 'draw' | 'quest') => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'coin') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } else if (type === 'levelUp') {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.06);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + index * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.06 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + index * 0.06);
          osc.stop(ctx.currentTime + index * 0.06 + 0.25);
        });
      } else if (type === 'quest' || type === 'success') {
        const freqs = [329.63, 392.00, 523.25];
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        });
      } else if (type === 'draw') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Virtual study pet state
  const [pet, setPet] = useState<{
    name: string;
    happiness: number;
    fullness: number;
    accessory: string;
    petCount: number;
  }>(() => {
    const stored = localStorage.getItem('studybuddy_pet');
    return stored ? JSON.parse(stored) : {
      name: 'Chimpu 🐼',
      happiness: 85,
      fullness: 80,
      accessory: 'none',
      petCount: 0
    };
  });

  // Daily quests state
  const [quests, setQuests] = useState<{
    id: string;
    text: string;
    textHi: string;
    xp: number;
    completed: boolean;
  }[]>(() => {
    const stored = localStorage.getItem('studybuddy_quests');
    const lastReset = localStorage.getItem('studybuddy_quest_reset');
    const todayStr = new Date().toDateString();
    
    if (stored && lastReset === todayStr) {
      return JSON.parse(stored);
    }
    return [
      { id: 'ask_ai', text: 'Ask AI Tutor a homework question', textHi: 'एआई टीचर से एक सवाल पूछें 🤖', xp: 15, completed: false },
      { id: 'quiz_hero', text: 'Earn 3+ score in any Practice Quiz', textHi: 'क्विज़ में 3 या उससे ज़्यादा अंक लाएं 🏆', xp: 25, completed: false },
      { id: 'pet_care', text: 'Feed or Pet your virtual study companion', textHi: 'अपने स्टडी पार्टनर चिम्पू को खाना खिलाएं या सहलाएं 🎋', xp: 10, completed: false },
    ];
  });

  const [brushColor, setBrushColor] = useState('#1e293b');
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Registration local state fields
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regClass, setRegClass] = useState('6');
  const [regAvatar, setRegAvatar] = useState('🐼');

  // Core local states
  const [user, setUser] = useState<UserType | null>(() => {
    const stored = localStorage.getItem(KEYS.USER);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.name && parsed.school && parsed.className) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem(KEYS.USER);
    return null;
  });
  const [notes, setNotes] = useState<Note[]>(() => {
    const stored = localStorage.getItem(KEYS.NOTES);
    return stored ? JSON.parse(stored) : DEFAULT_NOTES;
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const stored = localStorage.getItem(KEYS.SCHEDULE);
    return stored ? JSON.parse(stored) : DEFAULT_SCHEDULE;
  });
  const [progress, setProgress] = useState<Progress[]>(() => {
    const stored = localStorage.getItem(KEYS.PROGRESS);
    return stored ? JSON.parse(stored) : DEFAULT_PROGRESS;
  });
  const [groups, setGroups] = useState<Group[]>(() => {
    const stored = localStorage.getItem(KEYS.GROUPS);
    return stored ? JSON.parse(stored) : DEFAULT_GROUPS;
  });

  // Chat & interactive history states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem(KEYS.CHAT_HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
    return [];
  });
  const [fullScreenMessage, setFullScreenMessage] = useState<ChatMessage | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group views helper states
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [groupTab, setGroupTab] = useState<'chat' | 'notes'>('chat');
  const [groupChatInput, setGroupChatInput] = useState('');
  const [groupMessages, setGroupMessages] = useState<Record<number, GroupMessage[]>>(() => {
    const stored = localStorage.getItem(KEYS.GROUP_MESSAGES);
    return stored ? JSON.parse(stored) : {
      1: [{ id: 1, group_id: 1, user_id: 2, user_name: 'Alice Johnson', text: 'Hey guys! Anyone ready to review Bio Chapter 5?', created_at: new Date().toISOString() }],
      2: [{ id: 1, group_id: 2, user_id: 3, user_name: 'Bob Smith', text: 'Integral calculus questions are tricky!', created_at: new Date().toISOString() }]
    };
  });
  const [groupNotes, setGroupNotes] = useState<Record<number, GroupNote[]>>(() => {
    const stored = localStorage.getItem(KEYS.GROUP_NOTES);
    return stored ? JSON.parse(stored) : {
      1: [{ id: 1, group_id: 1, title: 'Mitosis Recap', content: 'Prophase, Metaphase, Anaphase, Telophase. Easy to remember with PMAT!', updated_by: 2, updated_by_name: 'Alice Johnson', updated_at: new Date().toISOString() }]
    };
  });

  // Modal helpers
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', subject: 'Mathematics' as Subject });
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ task: '', time: '', day: 'Monday' });
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [isAddingGroupNote, setIsAddingGroupNote] = useState(false);
  const [newGroupNote, setNewGroupNote] = useState({ title: '', content: '' });

  // Quiz helper states
  const [quizSubject, setQuizSubject] = useState<Subject | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizLanguage, setQuizLanguage] = useState<AppLanguage>('English');
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('studybuddy_appLanguage') as AppLanguage) || 'English';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleRegister = (e: any) => {
    e.preventDefault();
    if (!regName.trim() || !regSchool.trim() || !regClass.trim()) {
      alert("कृपया अपनी सारी जानकारी भरें!\nPlease fill out all dynamic information fields!");
      return;
    }
    const newUser: UserType = {
      id: Date.now(),
      name: regName.trim(),
      school: regSchool.trim(),
      className: regClass,
      points: 100,
      level: 1,
      avatar: regAvatar,
      badges: [{ id: Date.now(), badge_name: 'Quick Start', icon: '🚀', date_earned: new Date().toLocaleDateString() }]
    };
    setUser(newUser);
  };

  // Persists states in localStorage
  useEffect(() => { 
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user)); 
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  }, [user]);
  useEffect(() => { localStorage.setItem(KEYS.NOTES, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem(KEYS.GROUP_MESSAGES, JSON.stringify(groupMessages)); }, [groupMessages]);
  useEffect(() => { localStorage.setItem(KEYS.GROUP_NOTES, JSON.stringify(groupNotes)); }, [groupNotes]);
  useEffect(() => { localStorage.setItem('studybuddy_appLanguage', appLanguage); }, [appLanguage]);

  // Translate or initialize welcome greeting dynamically when language is changed
  useEffect(() => {
    if (chatMessages.length <= 1) {
      setChatMessages([
        {
          role: 'model',
          text: translate('welcome_ai_chat', appLanguage, "Hello student! 👋 Ask any homework question or ask me to draw a diagram! Let's read together! 🚀")
        }
      ]);
    }
  }, [appLanguage, user]);

  // Handle companion pet & quest checklist persistence
  useEffect(() => {
    localStorage.setItem('studybuddy_pet', JSON.stringify(pet));
  }, [pet]);

  useEffect(() => {
    localStorage.setItem('studybuddy_quests', JSON.stringify(quests));
    localStorage.setItem('studybuddy_quest_reset', new Date().toDateString());
  }, [quests]);

  // Points tracking for chimes
  const prevPointsRef = useRef<number>(user?.points || 0);
  const prevLevelRef = useRef<number>(user?.level || 1);
  useEffect(() => {
    if (!user) return;
    const prevPoints = prevPointsRef.current;
    const prevLevel = prevLevelRef.current;
    
    if (user.points > prevPoints) {
      if (user.level > prevLevel) {
        playAudioChime('levelUp');
      } else {
        playAudioChime('coin');
      }
    }
    prevPointsRef.current = user.points;
    prevLevelRef.current = user.level;
  }, [user?.points, user?.level]);

  // Support quest tracking updates
  const completeQuest = (questId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.completed) {
        setTimeout(() => awardPoints(q.xp), 50);
        setTimeout(() => playAudioChime('quest'), 150);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  const handlePetFeed = () => {
    if (!user) return;
    if (user.points < 15) {
      alert("Oops! You need at least 15 XP points to feed Bamboo 🎋 to Chimpu!");
      return;
    }
    awardPoints(-15);
    setPet(prev => ({ 
      ...prev, 
      fullness: Math.min(100, prev.fullness + 25), 
      happiness: Math.min(100, prev.happiness + 10) 
    }));
    playAudioChime('success');
    completeQuest('pet_care');
  };

  const handleBuyAccessory = (item: { id: string, label: string, cost: number }) => {
    if (!user) return;
    if (user.points < item.cost) {
      alert(`Oops! You need ${item.cost} points, but you have ${item.cost} points. Complete more activities or study quizzes to earn points!`);
      return;
    }
    awardPoints(-item.cost);
    setPet(prev => ({ ...prev, accessory: item.id, happiness: Math.min(100, prev.happiness + 15) }));
    playAudioChime('success');
  };

  const handlePetCompanionClick = () => {
    setPet(prev => ({ 
      ...prev, 
      happiness: Math.min(100, prev.happiness + 5),
      petCount: prev.petCount + 1
    }));
    playAudioChime('draw');
    completeQuest('pet_care');
  };

  // Points & Badge System
  const awardPoints = (amount: number, checkBadgeType?: string) => {
    setUser(prev => {
      const newPoints = prev.points + amount;
      const newLevel = Math.floor(newPoints / 100) + 1;
      const updatedBadges = [...prev.badges];

      if (checkBadgeType === 'quiz' && !updatedBadges.some(b => b.badge_name === 'Quiz Master')) {
        updatedBadges.push({ id: Date.now(), badge_name: 'Quiz Master', icon: '🏆', date_earned: new Date().toLocaleDateString() });
      }
      if (checkBadgeType === 'note' && !updatedBadges.some(b => b.badge_name === 'Note Taker')) {
        updatedBadges.push({ id: Date.now() + 1, badge_name: 'Note Taker', icon: '📝', date_earned: new Date().toLocaleDateString() });
      }

      return { ...prev, points: newPoints, level: newLevel, badges: updatedBadges };
    });
  };

  // Interactive Buddy Waving System (Bringing People Up)
  const handleWaveToPeer = (peer: typeof PEER_PRESENCE[0]) => {
    const personalizedResponse = peer.waveResponse.replace('{name}', user?.name || 'friend');
    setWaveToast({ name: peer.name, response: personalizedResponse, points: 5 });
    awardPoints(5);
    setTimeout(() => {
      setWaveToast(null);
    }, 4500);
  };

  // AI Assistant trigger
  const handleSendMessage = async () => {
    if (!chatInput.trim() && !selectedImage) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput, image: selectedImage || undefined };
    setChatMessages(prev => [...prev, userMsg]);
    
    const inputCopy = chatInput;
    const imageCopy = selectedImage;
    setChatInput('');
    setSelectedImage(null);
    setIsChatLoading(true);

    try {
      const studentContext = user ? { name: user.name, school: user.school, className: user.className } : undefined;
      const answer = await getStudyAnswer(inputCopy || "Discuss this homework task", imageCopy || undefined, studentContext, appLanguage);
      let aiImage: string | undefined = undefined;

      if (inputCopy.toLowerCase().includes('diagram') || inputCopy.toLowerCase().includes('visualize')) {
        const diagram = await generateStudyDiagram(inputCopy);
        if (diagram) aiImage = diagram;
      }

      const newModelMsg: ChatMessage = { role: 'model', text: answer, image: aiImage };
      setChatMessages(prev => [...prev, newModelMsg]);
      setFullScreenMessage(newModelMsg);
      awardPoints(10);
      completeQuest('ask_ai');
    } catch (e) {
      console.error(e);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Voice handler
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setChatInput(prev => prev + ' ' + text);
    };
    recognition.start();
  };

  // Image Helper
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingText === text) {
        setSpeakingText(null);
        return;
      }
    }

    setSpeakingText(text);

    // Remove markdown characters so the voice reader sounds professional and seamless
    let cleanText = text
      .replace(/[\*#_`\-]/g, ' ')
      .replace(/\[.*?\]\(.*?\)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (appLanguage === 'Hindi' || appLanguage === 'Hinglish') {
      utterance.lang = 'hi-IN';
    } else if (appLanguage === 'Spanish') {
      utterance.lang = 'es-ES';
    } else if (appLanguage === 'French') {
      utterance.lang = 'fr-FR';
    } else if (appLanguage === 'German') {
      utterance.lang = 'de-DE';
    } else if (appLanguage === 'Tamil') {
      utterance.lang = 'ta-IN';
    } else if (appLanguage === 'Bengali') {
      utterance.lang = 'bn-IN';
    } else if (appLanguage === 'Marathi') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => {
      setSpeakingText(null);
    };

    utterance.onerror = () => {
      setSpeakingText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    playAudioChime('draw');
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    setIsDrawing(true);
    playAudioChime('draw');
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSendDoodleToAI = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    setSelectedImage(dataUrl);
    setChatInput(appLanguage === 'Hindi' || appLanguage === 'Hinglish'
      ? 'कृपया मेरी यह ड्राइंग/रफ कॉपी देखकर आसान शब्दों में समझाएं!' 
      : 'Look at my drawing/work here and explain if it is correct or guide me!');
    playAudioChime('success');
  };

  // Action methods
  const handleAddNote = () => {
    if (!newNote.title.trim()) return;
    const noteItem: Note = { id: Date.now(), title: newNote.title, content: newNote.content, subject: newNote.subject, updated_at: new Date().toISOString() };
    setNotes(prev => [noteItem, ...prev]);
    setIsAddingNote(false);
    setNewNote({ title: '', content: '', subject: 'Mathematics' });
    awardPoints(15, 'note');
  };

  const handleDeleteNote = (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleSchedule = (item: ScheduleItem) => {
    setSchedule(prev => prev.map(s => {
      if (s.id === item.id) {
        if (!s.completed) awardPoints(10);
        return { ...s, completed: !s.completed };
      }
      return s;
    }));
  };

  const handleAddSchedule = () => {
    if (!newSchedule.task.trim()) return;
    const item: ScheduleItem = { id: Date.now(), task: newSchedule.task, time: newSchedule.time || '12:00', day: newSchedule.day, completed: false };
    setSchedule(prev => [...prev, item]);
    setIsAddingSchedule(false);
    setNewSchedule({ task: '', time: '', day: 'Monday' });
    awardPoints(5);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  // Quiz launcher
  const startQuiz = async (subject: Subject, lang: AppLanguage = appLanguage) => {
    setQuizSubject(subject);
    setQuizLanguage(lang);
    setIsQuizLoading(true);
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);

    try {
      const studentContext = user ? { name: user.name, school: user.school, className: user.className } : undefined;
      const res = await generateQuiz(subject, studentContext, lang);
      setQuizQuestions(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizAnswer = (selectedIdx: number) => {
    const isCorrect = selectedIdx === quizQuestions[currentQuizIndex].answer;
    const gain = isCorrect ? 1 : 0;
    const nextScore = quizScore + gain;

    if (currentQuizIndex + 1 < quizQuestions.length) {
      setQuizScore(nextScore);
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizScore(nextScore);
      setQuizFinished(true);
      const quizRes: Progress = { id: Date.now(), subject: quizSubject!, score: nextScore, total: quizQuestions.length, date: new Date().toISOString() };
      setProgress(prev => [quizRes, ...prev]);
      awardPoints(nextScore * 10, 'quiz');
      if (nextScore >= 3) {
        completeQuest('quiz_hero');
      }
    }
  };

  // Group controls
  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;
    const grp: Group = { id: Date.now(), name: newGroup.name, description: newGroup.description, created_by: user.id, created_at: new Date().toISOString(), member_count: 1 };
    setGroups(prev => [grp, ...prev]);
    setGroupMessages(prev => ({ ...prev, [grp.id]: [] }));
    setGroupNotes(prev => ({ ...prev, [grp.id]: [] }));
    setIsAddingGroup(false);
    setNewGroup({ name: '', description: '' });
    awardPoints(10);
  };

  const handleSendGroupMessage = () => {
    if (!groupChatInput.trim() || !activeGroup) return;
    const msg: GroupMessage = { id: Date.now(), group_id: activeGroup.id, user_id: user.id, user_name: user.name, text: groupChatInput, created_at: new Date().toISOString() };
    const gid = activeGroup.id;
    setGroupMessages(prev => ({ ...prev, [gid]: [...(prev[gid] || []), msg] }));
    setGroupChatInput('');

    // Peer message triggers auto response
    setTimeout(() => {
      const replies = ["Fabulous study tip! Let's conquer this calculation.", "Totally agree with those points!", "Oh perfect, adding that to my review list."];
      const botResponse: GroupMessage = {
        id: Date.now() + 1,
        group_id: gid,
        user_id: 101, // Alice
        user_name: 'Alice Johnson',
        text: replies[Math.floor(Math.random() * replies.length)],
        created_at: new Date().toISOString()
      };
      setGroupMessages(prev => ({ ...prev, [gid]: [...(prev[gid] || []), botResponse] }));
    }, 1200);
  };

  const handleCreateGroupNote = () => {
    if (!newGroupNote.title.trim() || !activeGroup) return;
    const nNote: GroupNote = { id: Date.now(), group_id: activeGroup.id, title: newGroupNote.title, content: newGroupNote.content, updated_by: user.id, updated_by_name: user.name, updated_at: new Date().toISOString() };
    const gid = activeGroup.id;
    setGroupNotes(prev => ({ ...prev, [gid]: [nNote, ...(prev[gid] || [])] }));
    setIsAddingGroupNote(false);
    setNewGroupNote({ title: '', content: '' });
    awardPoints(10);
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-900 font-sans text-slate-800 flex justify-center items-center overflow-hidden py-0 md:py-6 relative" id="applet_canvas">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none z-0" />

      {/* Dynamic Student Onboarding Gatekeeper check */}
      {!user ? (
        <div className="w-full max-w-md h-screen md:h-[90vh] bg-slate-50 md:rounded-3xl shadow-2xl flex flex-col overflow-y-auto p-6 relative z-20 border border-slate-800/10 scrollbar-hide">
          
          {/* Floating Settings & Language Control (Onboarding) */}
          <div className="absolute top-4 left-4 z-50">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="p-1 rounded-full hover:bg-slate-100 transition outline-none cursor-pointer text-slate-500"
              id="onboarding_lang_btn"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showLanguageDropdown && (
              <div className="absolute left-0 top-9 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 flex flex-col divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2" id="onboarding_lang_dropdown">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setAppLanguage(lang.code);
                      localStorage.setItem('studybuddy_appLanguage', lang.code);
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-[10px] font-black flex items-center space-x-2 cursor-pointer hover:bg-slate-50 ${
                      appLanguage === lang.code ? 'text-indigo-600 bg-indigo-50/40 font-black' : 'text-slate-650'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="my-auto space-y-6 py-4">
            {/* Header/Brand Icon */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
                <GraduationCap className="w-9 h-9 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4 font-display">StudyBuddy AI</h2>
              <p className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase font-mono bg-indigo-50 px-3 py-1 rounded-full inline-block">{translate('onboarding_tagline', appLanguage, 'Your Personal AI Study Companion')}</p>
            </div>

            {/* Introductory Children Note */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50 p-5 rounded-3xl border border-indigo-100/50 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎒</span>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">{translate('onboarding_welcome_title', appLanguage, 'A Message for Students 🌟')}</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {translate('onboarding_welcome_desc', appLanguage, 'Welcome to StudyBuddy AI! This is your cute AI friend to make your school learning easy and fun. Here you can understand tough subjects in simple words with pictures, and play quiz games live.')}
              </p>
              <p className="text-xs text-indigo-700 font-bold leading-relaxed bg-indigo-100/40 p-3 rounded-2xl border border-indigo-200/20">
                {translate('onboarding_welcome_notice', appLanguage, 'To start, fill in your details below! Let\'s get started! 🚀')}
              </p>
            </div>

            {/* Registration Input Form */}
            <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b border-slate-100 pb-3 flex items-center font-display">
                <User className="w-4 h-4 mr-1.5 text-indigo-500" /> {translate('onboarding_details_header', appLanguage, 'Student Details')}
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {translate('onboarding_name_label', appLanguage, 'Student Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="अपना नाम लिखें (e.g. Rohan Yadav)"
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  id="reg_name_input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {translate('onboarding_school_label', appLanguage, 'School Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  placeholder={translate('onboarding_school_placeholder', appLanguage, 'Write school name (e.g. Model School)')}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  id="reg_school_input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {translate('onboarding_class_label', appLanguage, 'Student Class *')}
                </label>
                <select
                  required
                  value={regClass}
                  onChange={(e) => setRegClass(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  id="reg_class_select"
                >
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                    <option key={c} value={c}>{`${translate('class_num', appLanguage, 'Class')} ${c}`}</option>
                  ))}
                </select>
              </div>

              {/* Study Avatar Selector Option */}
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">
                  {translate('onboarding_avatar_label', appLanguage, 'Choose Your Avatar ✨')}
                </label>
                <div className="flex justify-center items-center gap-3 py-1">
                  {[
                    { char: '🐼', label: 'Panda' },
                    { char: '🦁', label: 'Lion' },
                    { char: '🦉', label: 'Owl' },
                    { char: '🦊', label: 'Fox' },
                    { char: '🦄', label: 'Unicorn' },
                  ].map((av) => (
                    <button
                      key={av.char}
                      type="button"
                      onClick={() => setRegAvatar(av.char)}
                      className={`w-11 h-11 text-2xl rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        regAvatar === av.char
                          ? 'bg-gradient-to-tr from-indigo-500 to-violet-600 scale-110 shadow-lg shadow-indigo-100 text-white border-2 border-white ring-2 ring-indigo-500'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                      title={av.label}
                    >
                      {av.char}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase shadow-md shadow-indigo-100 transition active:scale-95 duration-100 mt-2 cursor-pointer font-display"
                id="btn_submit_registration"
              >
                {translate('onboarding_submit_btn', appLanguage, "Let's Study! 🚀")}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Main App Container (Absolutely locked viewport) */
        <div className="w-full max-w-md h-screen md:h-[90vh] bg-slate-50 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative z-10 border border-slate-800/25">
          
          {/* Floating Settings & Language Control (Main App) */}
          <div className="absolute top-4 left-4 z-50">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="p-1 rounded-full hover:bg-slate-100 transition outline-none cursor-pointer text-slate-500"
              id="main_lang_btn"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showLanguageDropdown && (
              <div className="absolute left-0 top-9 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 flex flex-col divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2" id="main_lang_dropdown">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setAppLanguage(lang.code);
                      localStorage.setItem('studybuddy_appLanguage', lang.code);
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-[10px] font-black flex items-center space-x-2 cursor-pointer hover:bg-slate-50 ${
                      appLanguage === lang.code ? 'text-indigo-600 bg-indigo-50/40 font-black' : 'text-slate-650'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Wave Animation Interactive Toast Message */}
          <AnimatePresence>
            {waveToast && (
              <motion.div 
                initial={{ y: -60, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -60, opacity: 0, scale: 0.95 }}
                className="absolute top-3 left-3 right-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-4 shadow-xl z-50 flex items-start space-x-3 border border-indigo-400"
                id="wave_toast"
              >
                <div className="text-2xl pt-1">👋</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">Wave Received!</p>
                  <p className="text-sm font-semibold">{waveToast.name} waved back!</p>
                  <p className="text-xs text-indigo-100 italic mt-0.5">"{waveToast.response}"</p>
                </div>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 text-white">+{waveToast.points} XP</span>
              </motion.div>
            )}
          </AnimatePresence>


        {/* Dynamic Nav View Render */}
        <main className="flex-1 w-full overflow-hidden flex flex-col relative" id="main_pane">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex-1 w-full flex flex-col overflow-hidden"
              id={`tab_${activeTab}`}
            >
              
              {/* HOME SCREEN */}
              {activeTab === 'home' && (
                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
                  
                  {/* Dashboard Welcome Header */}
                  <header className="flex flex-col space-y-3.5 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-slate-50/10 p-5 rounded-3xl border border-indigo-100/45 shadow-sm" id="welcome_header">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {getTimeGreeting(appLanguage).label}
                          </span>
                          <span className="text-sm select-none">{getTimeGreeting(appLanguage).icon}</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1.5 flex items-center leading-tight" id="user_id_display">
                          Hello, {user?.name}! <span className="text-indigo-500 ml-1">🚀</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-2 flex flex-wrap items-center gap-1.5" id="student_meta_badge">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-white border border-slate-100 text-slate-705 shadow-2xs font-mono text-[9px]">
                            🏫 {user?.school || "School Not Set"}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-mono text-[9px] font-black">
                            📚 {translate('class_num', appLanguage, 'Class')} {user?.className || "Set class"}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-center shrink-0 space-y-1.5">
                        <div className="w-13 h-13 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-md relative group select-none">
                          {user?.avatar ? (
                            <span className="text-3xl">{user.avatar}</span>
                          ) : (
                            <span className="text-xs font-black text-white tracking-wider">
                              {(user?.name || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-amber-950 border border-white shadow-sm">
                            ⭐
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            if (confirm("क्या आप सच में नया छात्र प्रोफाइल सेट करना चाहते हैं?\nDo you really want to set up another student profile?")) {
                              localStorage.removeItem(KEYS.USER);
                              setUser(null);
                              setActiveTab('home');
                            }
                          }}
                          className="text-[9px] text-slate-400 hover:text-red-500 font-extrabold hover:underline select-none transition"
                          id="btn_switch_profile"
                        >
                          Switch Profile
                        </button>
                        {deferredPrompt && (
                          <button
                            type="button"
                            onClick={handleInstall}
                            className="text-[9px] text-indigo-600 font-extrabold hover:underline select-none transition ml-2"
                          >
                             Install App
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1.5 pt-3 border-t border-indigo-100/30">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 animate-spin" />
                          <span>LEVEL {user?.level || 1}</span>
                        </span>
                        <span className="text-slate-500 font-black">{(user?.points || 0) % 100}/100 XP</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500 relative animate-pulse" 
                          style={{ width: `${(user?.points || 0) % 100}%` }} 
                        />
                      </div>
                    </div>
                  </header>

                  {/* DAILY CHALLENGES & STREAK CARD */}
                  <section className="bg-white p-5 rounded-3xl border border-slate-150/70 shadow-xs space-y-4" id="daily_quests_card">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base">🔥</span>
                        <div>
                          <h2 className="text-xs font-extrabold text-slate-800 tracking-tight flex items-center uppercase">
                            {appLanguage === 'Hindi' ? 'दैनिक लक्ष्य' : 'Daily Study Quests'}
                          </h2>
                          <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">Finish missions, gain bonus XP</p>
                        </div>
                      </div>
                      <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-[10px] font-black border border-amber-100 flex items-center space-x-1">
                        <span>🔥</span>
                        <span>Streak: 5 Days</span>
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {quests.map(q => (
                        <div 
                          key={q.id} 
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                            q.completed 
                              ? 'bg-emerald-50/50 border-emerald-100 opacity-80' 
                              : 'bg-slate-50/50 border-slate-100/70 hover:bg-slate-100/40'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-black shadow-2xs ${
                              q.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {q.completed ? '✓' : '•'}
                            </span>
                            <span className={`text-[11px] font-black leading-tight ${q.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                              {appLanguage === 'Hindi' ? q.textHi : q.text}
                            </span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            q.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-650'
                          }`}>
                            +{q.xp} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* VIRTUAL STUDY COMPANION - CHIMPU'S ISLAND */}
                  <section className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/5 to-white p-5 rounded-3xl border border-emerald-100/60 shadow-sm space-y-4" id="study_pet_sanctuary">
                    <div className="flex justify-between items-center text-xs">
                      <h2 className="font-extrabold text-slate-800 tracking-tight uppercase flex items-center text-slate-500">
                        🏝️ {appLanguage === 'Hindi' ? 'पालतू साथी' : "Chimpu's Sanctuary"}
                      </h2>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Virtual Friend</span>
                    </div>

                    <div className="bg-gradient-to-br from-teal-400/15 via-emerald-100/30 to-blue-50/40 p-4 rounded-2xl border border-emerald-100/60 shadow-2xs relative overflow-hidden flex flex-col items-center justify-center space-y-3 min-h-36">
                      
                      {/* Pet Overlay Hat/Sunglasses Styling */}
                      <div className="relative flex items-center justify-center select-none cursor-pointer group py-2" onClick={handlePetCompanionClick}>
                        {/* accessory badge rendering */}
                        {pet.accessory === 'wizard_hat' && (
                          <span className="absolute -top-3 text-2xl drop-shadow-md transform rotate-12 transition group-hover:scale-110 animate-bounce">🎩</span>
                        )}
                        {pet.accessory === 'royal_crown' && (
                          <span className="absolute -top-4 text-2xl drop-shadow-md transform -rotate-6 transition group-hover:scale-110 animate-pulse">👑</span>
                        )}
                        {pet.accessory === 'backpack' && (
                          <span className="absolute -bottom-1 -left-2 text-xl drop-shadow-xs transition group-hover:-translate-x-1">🎒</span>
                        )}
                        
                        {/* The Cute Panda companion itself */}
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.05, 1],
                            y: [0, -4, 0]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2.2, 
                            ease: "easeInOut" 
                          }}
                          className="text-5xl transition-transform active:scale-95 duration-100 filter drop-shadow-xs relative"
                        >
                          🐼
                          
                          {pet.accessory === 'star_sunglasses' && (
                            <span className="absolute inset-0 top-1 text-2xl flex items-center justify-center leading-none transform translate-y-0.5">🕶️</span>
                          )}
                        </motion.div>
                        
                        {/* Sparkles element */}
                        <span className="absolute -top-1 -right-3 text-lg animate-pulse">✨</span>
                      </div>

                      {/* Pet State text balloon */}
                      <div className="bg-white px-3.5 py-1.5 rounded-2xl border border-emerald-100 shadow-2xs text-[11px] font-black text-slate-705 max-w-[220px] text-center leading-snug">
                        {pet.fullness < 40 ? (
                          <span>🎋 {appLanguage === 'Hindi' ? 'मुझे भूख लगी है! कृपया बैम्बू खिलाएं' : "I am starving, feed me tasty Bamboo!"}</span>
                        ) : pet.happiness < 50 ? (
                          <span>🥺 {appLanguage === 'Hindi' ? 'मुझे सहलाएं! खेलने का मन है' : "I feel lonely, tap me to play games!"}</span>
                        ) : (
                          <span>🥰 {appLanguage === 'Hindi' ? `चलो मिलकर पढ़ाई करें, ${user?.name}!` : `Let's study together, ${user?.name}!`}</span>
                        )}
                      </div>

                      {/* Health Stat Indicators */}
                      <div className="w-full grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-teal-700">
                            <span>❤️ {appLanguage === 'Hindi' ? 'खुशी' : 'Happiness'}</span>
                            <span>{pet.happiness}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-teal-100/40 rounded-full overflow-hidden p-0.5 border border-teal-200/20">
                            <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${pet.happiness}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-amber-700">
                            <span>🎋 {appLanguage === 'Hindi' ? 'एनर्जी' : 'Energy'}</span>
                            <span>{pet.fullness}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-amber-150/40 rounded-full overflow-hidden p-0.5 border border-amber-200/20">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${pet.fullness}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Feed & Dress Up Shops */}
                    <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100/80">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={handlePetFeed}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black rounded-xl border border-emerald-500 shadow-2xs cursor-pointer flex items-center space-x-1.5"
                        >
                          <span>🎋</span>
                          <span>{appLanguage === 'Hindi' ? 'बैम्बू खिलाएं (-15 XP)' : 'Feed Bamboo (-15 XP)'}</span>
                        </button>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{appLanguage === 'Hindi' ? 'ड्रेसिंग रूम' : 'Dressing Area'}</span>
                      </div>

                      <div className="flex justify-between gap-1.5 overflow-x-auto py-1 scrollbar-hide">
                        {[
                          { id: 'wizard_hat', char: '🎩', label: 'Wizard Hat', cost: 100 },
                          { id: 'star_sunglasses', char: '🕶️', label: 'Shades', cost: 120 },
                          { id: 'royal_crown', char: '👑', label: 'Crown', cost: 180 },
                          { id: 'backpack', char: '🎒', label: 'Backpack', cost: 80 }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleBuyAccessory(item)}
                            className={`px-2.5 py-1.5 rounded-xl border flex flex-col items-center justify-center shrink-0 min-w-[70px] cursor-pointer transition ${
                              pet.accessory === item.id
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-black'
                                : 'bg-white hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-800'
                            }`}
                            title={`Buy ${item.label} for ${item.cost} XP`}
                          >
                            <span className="text-lg">{item.char}</span>
                            <span className="text-[8px] font-black mt-0.5">{item.cost} XP</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Active Buddies Online Row (Bring People Up!) */}
                  <section className="space-y-3" id="social_feed">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-extrabold text-slate-800 tracking-tight flex items-center uppercase text-slate-500">
                        <Users className="w-4 h-4 text-indigo-500 mr-1.5" />
                        {translate('buddies_title', appLanguage, 'Online Study Buddies')} 👥
                      </h2>
                      <span className="text-[9px] font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full uppercase tracking-wider">Social Feed</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {PEER_PRESENCE.map(peer => (
                        <div key={peer.id} className="bg-white p-3 rounded-2xl border border-slate-100/80 flex justify-between items-center shadow-xs hover:border-slate-250 transition duration-150">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl flex items-center justify-center font-black border border-indigo-100/50 shadow-2xs select-none">
                                <span className="text-2xl">{peer.avatar || '👤'}</span>
                              </div>
                              <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${peer.online ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${peer.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-black text-slate-900 leading-none mb-1">{peer.name}</h3>
                              <p className="text-[10px] text-slate-400 font-bold truncate">Study Focus: <span className="text-indigo-600 font-black">{peer.subject}</span></p>
                            </div>
                          </div>
                          {peer.online ? (
                            <button 
                              onClick={() => handleWaveToPeer(peer)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all text-indigo-600 font-black rounded-xl text-[10px] flex items-center space-x-1 border border-indigo-100 shadow-2xs cursor-pointer"
                              id={`wave_btn_${peer.id}`}
                            >
                              <span className="animate-bounce">👋</span>
                              <span>Wave back</span>
                            </button>
                          ) : (
                            <span className="text-[9px] bg-slate-100 text-slate-400 font-bold px-2 py-1 rounded-lg">Offline</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* High Quality Bento Grid Panel */}
                  <section className="space-y-3" id="quick_bento_panels">
                    <h2 className="text-xs font-extrabold text-slate-500 tracking-tight uppercase flex items-center">
                      <Sparkles className="w-4 h-4 text-indigo-500 mr-1.5" />
                      {translate('playground_title', appLanguage, 'Academy Playground')} 🚀
                    </h2>
                    <div className="grid grid-cols-2 gap-3 pb-1">
                      
                      {/* AI Tutor */}
                      <button 
                        onClick={() => setActiveTab('chat')}
                        className="p-4 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white rounded-3xl text-left shadow-lg shadow-indigo-100/50 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col justify-between h-32 relative overflow-hidden group"
                      >
                        <div className="absolute top-2 right-2 bg-indigo-500/50 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-wider">
                          {translate('live_assistant', appLanguage, 'Live Assistant')}
                        </div>
                        <BrainCircuit className="w-7 h-7 stroke-[2.5] text-indigo-200 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-extrabold text-xs">{translate('ai_tutor', appLanguage, 'AI Tutor')} ⚡</h3>
                          <p className="text-[9px] text-indigo-100/90 font-bold mt-1 leading-snug">{translate('tutor_desc', appLanguage, 'Answers homework & designs custom drawings')}</p>
                        </div>
                      </button>

                      {/* Practice Quiz */}
                      <button 
                        onClick={() => setActiveTab('quiz')}
                        className="p-4 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-3xl text-left shadow-lg shadow-emerald-100/50 hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col justify-between h-32 relative overflow-hidden group"
                      >
                        <div className="absolute top-2 right-2 bg-emerald-400/50 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-wider">
                          {translate('quiz', appLanguage, 'Quiz')}
                        </div>
                        <GraduationCap className="w-7 h-7 stroke-[2.5] text-emerald-100 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-extrabold text-xs">{translate('quiz', appLanguage, 'Quiz')} 🏆</h3>
                          <p className="text-[9px] text-emerald-50/90 font-bold mt-1 leading-snug">{translate('practice_desc', appLanguage, 'Test subject skills, earn dynamic XP medals')}</p>
                        </div>
                      </button>

                      {/* Study Notes */}
                      <button 
                        onClick={() => setActiveTab('notebook')}
                        className="p-4 bg-gradient-to-b from-amber-500 to-amber-600 text-white rounded-3xl text-left shadow-lg shadow-amber-100/55 hover:shadow-amber-200 hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col justify-between h-28 relative overflow-hidden group"
                      >
                        <div className="absolute top-2 right-2 bg-amber-400/50 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-wider">
                          {notes.length} {translate('notebook', appLanguage, 'Notebook').toLowerCase()}
                        </div>
                        <BookOpen className="w-6 h-6 stroke-[2.5] text-amber-100 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-extrabold text-xs">{translate('notebook', appLanguage, 'Notebook')} 📝</h3>
                          <p className="text-[9px] text-amber-50/90 font-bold mt-0.5 leading-none">{translate('notebook_desc', appLanguage, 'Formula sheets & key facts')}</p>
                        </div>
                      </button>

                      {/* Dailies & Planner */}
                      <button 
                        onClick={() => { setActiveTab('notebook'); setNotebookTab('planner'); }}
                        className="p-4 bg-gradient-to-b from-purple-500 to-purple-600 text-white rounded-3xl text-left shadow-lg shadow-purple-100/55 hover:shadow-purple-200 hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col justify-between h-28 relative overflow-hidden group"
                      >
                        <div className="absolute top-2 right-2 bg-purple-400/50 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-wider">
                          {schedule.filter(s => !s.completed).length} pending
                        </div>
                        <Calendar className="w-6 h-6 stroke-[2.5] text-purple-100 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-extrabold text-xs">{translate('dailies_planner', appLanguage, 'Planner')} 📅</h3>
                          <p className="text-[9px] text-purple-50/90 font-bold mt-0.5 leading-none">{translate('planner_desc', appLanguage, 'Class timings & assignments')}</p>
                        </div>
                      </button>

                    </div>
                  </section>

                  {/* Badges and Progress Statistics from Profile */}
                  <section className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <h2 className="text-xs font-extrabold text-slate-800 tracking-tight flex items-center uppercase text-slate-500">
                        <Award className="w-4 h-4 text-emerald-500 mr-2 animate-bounce" />
                        {translate('badges_title', appLanguage, 'Academic Badges')} 🎖️
                      </h2>
                      <span className="text-[9px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                        {user.badges.length} EARNED
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pb-0.5">
                      {user.badges.map((b) => {
                        // Dynamic design palette based on badge title
                        let badgeColors = "from-amber-100 via-yellow-50 to-orange-50 text-amber-600 border-amber-200";
                        if (b.badge_name === 'Note Taker') {
                          badgeColors = "from-pink-100 via-rose-50 to-red-50 text-pink-600 border-pink-200";
                        } else if (b.badge_name === 'Quiz Master') {
                          badgeColors = "from-purple-100 via-indigo-50 to-violet-50 text-purple-600 border-purple-200";
                        }
                        return (
                          <div key={b.id} className="flex flex-col items-center text-center group cursor-pointer">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${badgeColors} border flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-350 relative`}>
                              <span>{b.icon}</span>
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-[7px] border border-slate-100 rounded-full flex items-center justify-center font-bold">✨</span>
                            </div>
                            <span className="text-[9px] text-slate-800 font-extrabold mt-2 leading-none line-clamp-1">{b.badge_name}</span>
                            <span className="text-[7px] text-slate-400 font-semibold mt-0.5 leading-none">{b.date_earned}</span>
                          </div>
                        );
                      })}
                      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 h-16 cursor-not-allowed">
                        <span className="text-[10px] font-black leading-none">+ more</span>
                        <span className="text-[7px] font-bold text-slate-400 mt-1 uppercase text-center leading-none">study on</span>
                      </div>
                    </div>
                  </section>

                  {/* Subject Mastery Performance */}
                  <section className="space-y-3 pb-8">
                    <h2 className="text-xs font-extrabold text-slate-500 tracking-tight uppercase flex items-center">
                      <GraduationCap className="w-4 h-4 text-violet-500 mr-1.5" />
                      {translate('progress_title', appLanguage, 'Learning Progress')} 📊
                    </h2>
                    <div className="grid grid-cols-1 gap-2.5">
                      {progress.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold self-center text-xs">
                              {item.subject.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800">{item.subject}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">Verified: {new Date(item.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                              {item.score}/{item.total} Score
                            </span>
                          </div>
                        </div>
                      ))}
                      {progress.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-4 italic">No quizzes taken yet. Complete a quiz to see metrics here!</p>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* AI CHAT SCREEN (STUCK VIEWPORT CONSTRAINED) */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  
                  {/* Chat header */}
                  <header className="p-4 border-b border-slate-100 shrink-0 flex items-center bg-white justify-between">
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h2 className="font-bold text-slate-800 text-sm">AI Study Helper</h2>
                        <span className="text-[10px] text-emerald-500 font-semibold animate-pulse flex items-center">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1" /> Gemini 3.5 Flash Connected
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={() => setShowScratchpad(!showScratchpad)}
                        className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl border flex items-center space-x-1 cursor-pointer transition shadow-2xs ${
                          showScratchpad 
                            ? 'bg-amber-100 border-amber-300 text-amber-800 font-black' 
                            : 'bg-amber-50/50 border-amber-150 text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        <span>🎨</span>
                        <span>{appLanguage === 'Hindi' ? 'रफ कॉपी' : 'Scratchpad'}</span>
                      </button>
                      <button onClick={() => setChatMessages([])} className="text-slate-400 hover:text-red-500 text-[10px] font-bold px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">Clear Chats</button>
                    </div>
                  </header>

                  {/* Doodle board container */}
                  {showScratchpad && (
                    <div className="bg-amber-50/70 border-b border-amber-150 p-3.5 space-y-2 select-none" id="doodle_scratchpad">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs">🎨</span>
                          <h3 className="text-[11px] font-black text-amber-900 tracking-tight">Interactive Doodle Board / रफ़ कॉपी</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Brush colors selector */}
                          {['#1e293b', '#dc2626', '#16a34a', '#2563eb'].map(c => (
                            <button
                              key={c}
                              onClick={() => setBrushColor(c)}
                              className={`w-4.5 h-4.5 rounded-full border transition ${brushColor === c ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <button
                            onClick={clearCanvas}
                            className="px-2.5 py-1 bg-white text-slate-650 hover:bg-slate-105 border border-slate-250 rounded-xl text-[10px] font-extrabold cursor-pointer transition active:scale-95"
                          >
                            Clear
                          </button>
                          <button
                            onClick={handleSendDoodleToAI}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-xs flex items-center space-x-1 cursor-pointer transition active:scale-95"
                          >
                            <span>Share with Tutor</span>
                            <span>⚡</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="border border-amber-250 bg-white rounded-2xl overflow-hidden shadow-inner">
                        <canvas
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawingTouch}
                          onTouchMove={drawTouch}
                          onTouchEnd={stopDrawing}
                          className="w-full h-32 touch-none cursor-crosshair bg-white"
                        />
                      </div>
                      <p className="text-[8px] md:text-[9px] text-amber-800 font-extrabold leading-none italic select-none">* Draw geometry shapes, write formulas, or sketch math issues, then click "Share with Tutor" to ask a question!</p>
                    </div>
                  )}

                  {/* Chat messages queue */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50" id="chat_scroll">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-10 max-w-[240px] mx-auto">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BrainCircuit className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">{translate('ai_tutor', appLanguage, 'AI Tutor')}</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{getChatIntroDesc(appLanguage)}</p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`} id={`chat_item_${i}`}>
                        <div 
                          onClick={() => setFullScreenMessage(msg)}
                          className={`max-w-[85%] rounded-3xl p-3.5 shadow-sm text-sm cursor-pointer hover:scale-[1.01] hover:shadow-md active:scale-98 transition duration-200 select-none ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-850 rounded-tl-none border border-slate-150/70'}`}
                        >
                          {msg.image && (
                            <img src={msg.image} alt="Uploaded problem" className="w-full rounded-2xl mb-2 max-h-40 object-cover" />
                          )}
                          <div className="leading-relaxed text-xs md:text-sm whitespace-pre-wrap select-text">
                            {renderChatMessage(msg.text)}
                          </div>
                          
                          {/* Interactive blackboard visual expand link */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100/30 flex justify-between items-center text-[10px] opacity-80" style={{ pointerEvents: 'none' }}>
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {msg.role === 'user' ? '👤 Student' : '🤖 AI Partner'}
                            </span>
                            <span className={`font-black px-2 py-0.5 rounded-lg flex items-center space-x-1 shadow-2xs ${msg.role === 'user' ? 'bg-indigo-700/80 text-indigo-100' : 'bg-indigo-50 text-indigo-650'}`}>
                              <span>{getFullscreenLabel(appLanguage)}</span>
                              <Maximize2 className="w-2.5 h-2.5 ml-0.5" />
                            </span>
                          </div>
                        </div>
                        {msg.role === 'model' && (
                          <div className="flex justify-start pl-1.5 pb-2">
                            <button
                              onClick={() => handleSpeakMessage(msg.text)}
                              className={`px-2.5 py-1 text-[9px] font-black rounded-xl border flex items-center space-x-1 cursor-pointer transition shadow-2xs ${
                                speakingText === msg.text 
                                  ? 'bg-rose-50 border-rose-250 text-rose-600 animate-pulse font-black'
                                  : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500 hover:text-indigo-600'
                              }`}
                            >
                              {speakingText === msg.text ? (
                                <>
                                  <span className="text-[10px]">⏹️</span>
                                  <span>Stop Reading</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[10px]">🔊</span>
                                  <span>{appLanguage === 'Hindi' ? 'सुनें (Read Out)' : 'Read Out'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start animate-pulse">
                        <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-3xl rounded-tl-none flex items-center space-x-2 shadow-sm text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span className="font-bold text-slate-600">{getSolvingText(appLanguage)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Absolute pinned and locked bottom entry area */}
                  <div className="p-3 border-t border-slate-100 bg-white shrink-0 space-y-2">
                    {selectedImage && (
                      <div className="relative inline-block" id="image_preview">
                        <img src={selectedImage} alt="Problem sketch" className="w-16 h-16 rounded-xl object-cover border border-indigo-500" />
                        <button onClick={() => setSelectedImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center px-3 py-1 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 relative overflow-hidden">
                        {isListening && (
                          <div className="absolute inset-0 bg-red-100/90 flex items-center px-3 space-x-2 z-10 transition">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mr-1" />
                            <span className="text-xs font-black text-red-700 animate-pulse">{getListeningLabel(appLanguage)}</span>
                          </div>
                        )}
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder={getChatPlaceholder(appLanguage)}
                          className="flex-1 p-2 bg-transparent focus:outline-none text-xs text-slate-800"
                        />
                        <button onClick={handleVoiceInput} className="text-slate-400 hover:text-red-500 p-1 cursor-pointer">
                          <Mic className="w-4 h-4" />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer">
                          <Camera className="w-4 h-4" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      </div>
                      <button 
                        onClick={handleSendMessage}
                        disabled={isChatLoading}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl disabled:opacity-50 transition active:scale-95 cursor-pointer"
                        id="send_btn"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* GROUPS SCREEN & TEAMS */}
              {activeTab === 'groups' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  {!activeGroup ? (
                    <div className="flex-1 flex flex-col overflow-hidden p-5">
                      <header className="flex justify-between items-center shrink-0 mb-4">
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">Study Groups</h2>
                          <p className="text-xs text-slate-400">Classrooms & team shared chats</p>
                        </div>
                        <button onClick={() => setIsAddingGroup(true)} className="p-2 bg-indigo-600 text-white rounded-full shadow-md">
                          <Plus className="w-5 h-5" />
                        </button>
                      </header>

                      {/* Scrollable list of cooperative study groups */}
                      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-hide">
                        {groups.map(group => (
                          <div key={group.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-stretch justify-between">
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-bold text-slate-800 text-sm leading-tight">{group.name}</h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 pr-4">{group.description}</p>
                              </div>
                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 self-start px-2 py-0.5 rounded-lg mt-3">
                                {group.member_count || 1} members active
                              </span>
                            </div>
                            <button 
                              onClick={() => setActiveGroup(group)}
                              className="px-4 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition active:scale-95 self-end py-2"
                            >
                              Enter
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden h-full">
                      
                      {/* Active group inside header */}
                      <header className="p-4 border-b border-slate-100 flex items-center bg-white space-x-3 shrink-0">
                        <button onClick={() => setActiveGroup(null)} className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm leading-none truncate">{activeGroup.name}</h3>
                          <div className="flex space-x-4 mt-2">
                            <button onClick={() => setGroupTab('chat')} className={`text-xs font-bold leading-none pb-1 ${groupTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Chat</button>
                            <button onClick={() => setGroupTab('notes')} className={`text-xs font-bold leading-none pb-1 ${groupTab === 'notes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Shared Notes</button>
                          </div>
                        </div>
                      </header>

                      {/* Inner Group View Tabs */}
                      <div className="flex-1 overflow-y-auto p-4 bg-slate-50" id="group_tab_pane">
                        {groupTab === 'chat' ? (
                          <div className="space-y-3.5">
                            {(groupMessages[activeGroup.id] || []).map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[85%]">
                                  <p className="text-[10px] text-slate-400 font-semibold mb-1 px-1">{msg.user_name}</p>
                                  <div className={`p-3 rounded-2xl ${msg.user_id === user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'}`}>
                                    <p className="text-xs leading-relaxed">{msg.text}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Lecture Library</h4>
                              <button onClick={() => setIsAddingGroupNote(true)} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-[10px] font-bold flex items-center">
                                <Plus className="w-3 h-3 mr-1" /> New Note
                              </button>
                            </div>
                            {(groupNotes[activeGroup.id] || []).map(note => (
                              <div key={note.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative">
                                <h4 className="font-bold text-slate-800 text-xs mb-1">{note.title}</h4>
                                <p className="text-xs text-slate-500 whitespace-pre-wrap">{note.content}</p>
                                <div className="flex justify-between items-center border-t border-slate-50 pt-2.5 mt-3 text-[9px] text-slate-400">
                                  <span>Contributor: {note.updated_by_name}</span>
                                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Group Bottom Chat Controls */}
                      {groupTab === 'chat' && (
                        <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2 shrink-0">
                          <input 
                            type="text" 
                            value={groupChatInput}
                            onChange={(e) => setGroupChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendGroupMessage()}
                            placeholder="Message study mates..."
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none"
                          />
                          <button onClick={handleSendGroupMessage} className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow active:scale-95">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CONSOLIDATED STUDY NOTEBOOK TAB (NOTES & PLANNER TOGETHER IN ITS PLACE) */}
              {activeTab === 'notebook' && (
                <div className="flex-1 flex flex-col overflow-hidden p-5">
                  <header className="flex justify-between items-center shrink-0 mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Study Notebook</h2>
                      <p className="text-xs text-slate-400">Class notes & study agenda</p>
                    </div>
                    {notebookTab === 'notes' ? (
                      <button onClick={() => setIsAddingNote(true)} className="p-2 bg-indigo-600 text-white rounded-full shadow">
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <button onClick={() => setIsAddingSchedule(true)} className="p-2 bg-indigo-600 text-white rounded-full shadow">
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </header>

                  {/* Sub-tab Switcher Header Controls */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-4 shrink-0">
                    <button 
                      onClick={() => setNotebookTab('notes')} 
                      className={`py-2 text-xs font-bold rounded-xl transition ${notebookTab === 'notes' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Sticky Notes
                    </button>
                    <button 
                      onClick={() => setNotebookTab('planner')} 
                      className={`py-2 text-xs font-bold rounded-xl transition ${notebookTab === 'planner' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Dailies & Planner
                    </button>
                  </div>

                  {/* Scrollable workspace core */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide pr-1" id="notebook_content">
                    {notebookTab === 'notes' ? (
                      <div className="space-y-4 pt-1 pb-4">
                        {notes.map((note, idx) => {
                          const palettes = [
                            { bg: 'bg-amber-100/80', border: 'border-amber-200/50', labelBg: 'bg-amber-200/60', text: 'text-amber-900', labelText: 'text-amber-800', shadow: 'shadow-amber-100/40', rotate: '-rotate-1' },
                            { bg: 'bg-sky-100/85', border: 'border-sky-200/50', labelBg: 'bg-sky-200/60', text: 'text-sky-900', labelText: 'text-sky-800', shadow: 'shadow-sky-100/40', rotate: 'rotate-1' },
                            { bg: 'bg-rose-100/80', border: 'border-rose-200/50', labelBg: 'bg-rose-200/60', text: 'text-rose-900', labelText: 'text-rose-800', shadow: 'shadow-rose-100/40', rotate: '-rotate-2' },
                            { bg: 'bg-emerald-100/85', border: 'border-emerald-200/50', labelBg: 'bg-emerald-200/60', text: 'text-emerald-950', labelText: 'text-emerald-800', shadow: 'shadow-emerald-100/40', rotate: 'rotate-2' },
                            { bg: 'bg-purple-100/80', border: 'border-purple-200/50', labelBg: 'bg-purple-200/60', text: 'text-purple-900', labelText: 'text-purple-800', shadow: 'shadow-purple-100/40', rotate: '-rotate-1' }
                          ];
                          const design = palettes[idx % palettes.length];
                          return (
                            <div 
                              key={note.id} 
                              className={`${design.bg} ${design.rotate} p-5 rounded-3xl border ${design.border} ${design.shadow} relative group hover:-translate-y-1 hover:rotate-0 transition-all duration-200 shadow-md`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-1 ${design.labelBg} ${design.labelText} rounded-full`}>
                                  📌 {note.subject}
                                </span>
                                <button 
                                  onClick={() => handleDeleteNote(note.id)} 
                                  className="text-slate-400 hover:text-red-650 transition-colors p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <h3 className={`font-black ${design.text} text-sm mt-3.5 tracking-tight`}>{note.title}</h3>
                              <p className={`text-xs ${design.text} opacity-90 mt-1 line-clamp-4 leading-relaxed whitespace-pre-wrap font-medium`}>{note.content}</p>
                            </div>
                          );
                        })}
                        {notes.length === 0 && <p className="text-center text-xs text-slate-400 py-10 italic">Create some study cards!</p>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {schedule.map(item => (
                          <div key={item.id} className="p-3.5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center space-x-3.5">
                              <button onClick={() => handleToggleSchedule(item)}>
                                {item.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                              </button>
                              <div>
                                <p className={`text-xs font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.task}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{item.day} • {item.time}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteSchedule(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        {schedule.length === 0 && <p className="text-center text-xs text-slate-400 py-10 italic">Schedule assignments today.</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRACTICE & SUBJECT QUIZZES */}
              {activeTab === 'quiz' && (
                <div className="flex-1 flex flex-col overflow-hidden p-5">
                  <header className="mb-4 shrink-0 flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight">Practice Academy</h2>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Dynamically Generated via Gemini AI</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black uppercase">
                      CLASS {user?.className || "6"}
                    </span>
                  </header>

                  <div className="flex-1 overflow-y-auto scrollbar-hide" id="quiz_feed">
                    {!quizSubject ? (
                      <div className="grid grid-cols-2 gap-3.5 pb-2">
                        {SUBJECTS.map(sub => {
                          const details = SUBJECT_DETAILS[sub];
                          const IconComponent = details.icon;
                          return (
                            <div
                              key={sub}
                              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between h-52 hover:shadow-md transition-all duration-250 hover:border-slate-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className={`p-2 rounded-2xl bg-gradient-to-tr ${details.color} text-white shadow-xs`}>
                                  <IconComponent className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100">
                                  {sub}
                                </span>
                              </div>
                              <div className="mt-2">
                                <h3 className="font-extrabold text-slate-900 text-xs tracking-tight leading-tight">{details.text}</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-none">{details.textHi}</p>
                              </div>
                              <div className="space-y-1 mt-1.5 pt-2 border-t border-slate-50">
                                <button
                                  onClick={() => startQuiz(sub, appLanguage)}
                                  className="w-full py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 transition rounded-xl text-[9px] font-black text-white flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
                                  id={`quiz_selected_${sub.toLowerCase()}`}
                                >
                                  <span>{LANGUAGES.find(l => l.code === appLanguage)?.flag || '✨'}</span>
                                  <span>{translate('start_quiz', appLanguage, 'Start quiz')} ({LANGUAGES.find(l => l.code === appLanguage)?.label.split(' ')[0]})</span>
                                </button>
                                {appLanguage !== 'English' && (
                                  <button
                                    onClick={() => startQuiz(sub, 'English')}
                                    className="w-full py-1 bg-slate-50 hover:bg-slate-100 active:scale-95 transition rounded-xl text-[9px] font-bold text-slate-650 flex items-center justify-center space-x-1 border border-slate-200/50 cursor-pointer"
                                    id={`quiz_en_alt_${sub.toLowerCase()}`}
                                  >
                                    <span>🇬🇧</span>
                                    <span>English Practice</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white p-5 rounded-3xl border border-slate-150/80 shadow-md space-y-4">
                        {isQuizLoading ? (
                          <div className="py-12 text-center space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                            <p className="text-xs text-slate-700 font-extrabold">Formulating your {quizSubject} {quizLanguage === 'Hindi' ? 'हिंदी' : 'English'} challenge...</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase animate-pulse">Wait a moment while Gemini writes questions</p>
                          </div>
                        ) : quizFinished ? (
                          <div className="text-center py-6 space-y-5">
                            <span className="text-4xl">🎓</span>
                            <div>
                              <h3 className="text-base font-black text-slate-900">{translate('quiz_completed_title', appLanguage, 'Quiz Completed!')}</h3>
                              <p className="text-xs text-slate-600 font-bold mt-1">{translate('quiz_completed_score', appLanguage, 'Excellent Effort! You scored')} {quizScore} / {quizQuestions.length}</p>
                              <p className="text-indigo-600 font-black text-xs mt-2.5 flex items-center justify-center space-x-1">
                                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                                <span>+{quizScore * 10} XP Reward Added to Profile!</span>
                              </p>
                            </div>
                            <button onClick={() => setQuizSubject(null)} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase shadow-md shadow-indigo-150 cursor-pointer">{translate('back_to_topics', appLanguage, 'Back to Topics')}</button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                              <span className="inline-flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span>{quizSubject} ({quizLanguage}) Practice</span>
                              </span>
                              <span>{currentQuizIndex + 1} / {quizQuestions.length}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }} />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-xs md:text-sm leading-relaxed">{quizQuestions[currentQuizIndex]?.question}</h3>
                            <div className="space-y-2.5 pt-2">
                              {quizQuestions[currentQuizIndex]?.options.map((option: string, opIdx: number) => (
                                <button
                                  key={opIdx}
                                  onClick={() => handleQuizAnswer(opIdx)}
                                  className="w-full p-4 bg-slate-50/70 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 hover:border-indigo-400 text-slate-800 text-xs font-bold text-left transition duration-150 flex items-center justify-between cursor-pointer"
                                >
                                  <span>{option}</span>
                                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>

        {/* Dynamic Mobile Standard App Bottom Tab Bar (ALIGNED PINNED NO CLIP) */}
        <nav className="bg-white border-t border-slate-150 py-2.5 px-2 shrink-0 flex justify-around items-center z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]" id="tab_bar">
          <button 
            onClick={() => { setActiveTab('home'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'home' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title={translate('home', appLanguage, 'Home')}
            id="tab_btn_home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">{translate('home', appLanguage, 'Home')}</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('chat'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'chat' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title={translate('ai_tutor', appLanguage, 'AI Tutor')}
            id="tab_btn_chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">{translate('ai_tutor', appLanguage, 'AI Tutor')}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('groups'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'groups' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title={translate('groups', appLanguage, 'Groups')}
            id="tab_btn_groups"
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">{translate('groups', appLanguage, 'Groups')}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('notebook'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'notebook' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title={translate('notebook', appLanguage, 'Notebook')}
            id="tab_btn_notebook"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">{translate('notebook', appLanguage, 'Notebook')}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('quiz'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'quiz' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title={translate('quiz', appLanguage, 'Quiz')}
            id="tab_btn_quiz"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">{translate('quiz', appLanguage, 'Quiz')}</span>
          </button>
        </nav>

        {/* MODAL SYSTEM (LIGHTWEIGHT CONTEXT DIALOG BACKDROPS) */}
        <AnimatePresence>
          {isAddingNote && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center" id="new_note_modal">
              <motion.div initial={{ y: "15%" }} animate={{ y: 0 }} exit={{ y: "15%" }} className="bg-white w-full rounded-t-3xl p-5 space-y-4 shadow-xl border-t border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Add Sticky Note</h3>
                  <button onClick={() => setIsAddingNote(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Cancel</button>
                </div>
                <input type="text" placeholder="Note Title" value={newNote.title} onChange={(e) => setNewNote({...newNote, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none" />
                <select value={newNote.subject} onChange={(e) => setNewNote({...newNote, subject: e.target.value as Subject})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none text-slate-700">
                  {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <textarea placeholder="Write subject content here..." value={newNote.content} onChange={(e) => setNewNote({...newNote, content: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs h-28 resize-none outline-none text-slate-700" />
                <button onClick={handleAddNote} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold active:scale-95 transition">Save Note</button>
              </motion.div>
            </motion.div>
          )}

          {isAddingSchedule && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center" id="new_planner_modal">
              <motion.div initial={{ y: "15%" }} animate={{ y: 0 }} exit={{ y: "15%" }} className="bg-white w-full rounded-t-3xl p-5 space-y-4 shadow-xl border-t border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Add Assignment Task</h3>
                  <button onClick={() => setIsAddingSchedule(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold">Cancel</button>
                </div>
                <input type="text" placeholder="Task description..." value={newSchedule.task} onChange={(e) => setNewSchedule({...newSchedule, task: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="time" value={newSchedule.time} onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none" />
                  <select value={newSchedule.day} onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none text-slate-700">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <button onClick={handleAddSchedule} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold active:scale-95 transition">Add Session</button>
              </motion.div>
            </motion.div>
          )}

          {isAddingGroup && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center" id="new_group_modal">
              <motion.div initial={{ y: "15%" }} animate={{ y: 0 }} exit={{ y: "15%" }} className="bg-white w-full rounded-t-3xl p-5 space-y-4 shadow-xl border-t border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Create New Classroom</h3>
                  <button onClick={() => setIsAddingGroup(false)} className="text-slate-400 text-xs font-semibold">Cancel</button>
                </div>
                <input type="text" placeholder="Classroom Title" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none" />
                <textarea placeholder="Classroom description..." value={newGroup.description} onChange={(e) => setNewGroup({...newGroup, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs h-20 resize-none outline-none text-slate-700" />
                <button onClick={handleCreateGroup} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold active:scale-95 transition">Create Team</button>
              </motion.div>
            </motion.div>
          )}

          {isAddingGroupNote && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center" id="new_team_note_modal">
              <motion.div initial={{ y: "15%" }} animate={{ y: 0 }} exit={{ y: "15%" }} className="bg-white w-full rounded-t-3xl p-5 space-y-4 shadow-xl border-t border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Share Lecture Note</h3>
                  <button onClick={() => setIsAddingGroupNote(false)} className="text-slate-400 text-xs font-semibold">Cancel</button>
                </div>
                <input type="text" placeholder="Topic Title" value={newGroupNote.title} onChange={(e) => setNewGroupNote({...newGroupNote, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none" />
                <textarea placeholder="Write note content..." value={newGroupNote.content} onChange={(e) => setNewGroupNote({...newGroupNote, content: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs h-24 resize-none outline-none text-slate-700" />
                <button onClick={handleCreateGroupNote} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold active:scale-95 transition">Share with Team</button>
              </motion.div>
            </motion.div>
          )}

          {/* FULL SCREEN MAGICAL BLACKBOARD MODAL OVERLAY */}
          {fullScreenMessage && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-3 md:p-5" 
              id="full_blackboard_container"
            >
              {/* Wooden chalk frame around the blackboard */}
              <div 
                className="flex-1 bg-teal-950 rounded-3xl border-8 border-amber-900 shadow-2xl p-4 md:p-6 flex flex-col relative overflow-hidden" 
                style={{ backgroundImage: "radial-gradient(ellipse at center, #142a27 0%, #081312 100%)" }}
              >
                {/* Board Heading */}
                <div className="flex justify-between items-center border-b border-dashed border-teal-600/30 pb-3 shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <h2 className="text-white text-xs md:text-sm font-black tracking-widest uppercase ml-1 font-mono">
                      {translate('blackboard_title', appLanguage, ' ✨ जादुई शिक्षा बोर्ड ✨')}
                    </h2>
                  </div>
                  
                  {/* Language Switcher moved here */}
                  <div className="relative flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFullScreenMessage(null)}
                      className="p-1 rounded-full hover:bg-slate-700 transition outline-none cursor-pointer text-slate-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      className="p-1 rounded-full hover:bg-slate-700 transition outline-none cursor-pointer text-slate-300"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showLanguageDropdown && (
                      <div className="absolute left-0 top-full mt-2 w-32 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 flex flex-col divide-y divide-slate-100 max-h-40 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setAppLanguage(lang.code);
                              localStorage.setItem('studybuddy_appLanguage', lang.code);
                              setShowLanguageDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-[9px] font-black flex items-center space-x-2 cursor-pointer hover:bg-slate-50 ${
                              appLanguage === lang.code ? 'text-indigo-600 bg-indigo-50/40 font-black' : 'text-slate-650'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span className="truncate">{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chalk board contents scroll view */}
                <div className="flex-1 overflow-y-auto my-4 pr-1 scrollbar-hide text-white space-y-4 select-text">
                  {fullScreenMessage.image && (
                    <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-md">
                      <img src={fullScreenMessage.image} alt="study drawing" className="w-full max-h-48 object-cover" />
                    </div>
                  )}
                  <div className="text-slate-100 font-mono leading-relaxed p-1">
                    {renderChatMessageInChalk(fullScreenMessage.text)}
                  </div>
                </div>

                {/* Lower chalk shelf holding eraser and board controls */}
                <div className="mt-auto pt-3 border-t border-dashed border-teal-600/30 flex flex-wrap gap-2 items-center justify-between shrink-0">
                  {/* Animating Study Buddy Pet Greeting */}
                  <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/50 max-w-[190px]">
                    <span className="text-2xl animate-bounce">🐼</span>
                    <div className="leading-tight">
                      <p className="text-[8px] text-amber-400 font-black tracking-widest font-mono">STUDY PET</p>
                      <p className="text-[10px] text-slate-300 font-bold truncate">Keep it up, {user?.name || "learner"}!</p>
                    </div>
                  </div>

                  {/* Operational Blackboard chalk style buttons */}
                  <div className="flex items-center justify-end gap-2 flex-wrap w-full">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Speak Description (Tts) */}
                      {speakingText === fullScreenMessage.text ? (
                        <button 
                          onClick={() => handleSpeakMessage(fullScreenMessage.text)}
                          className="px-3 py-2 bg-red-655 hover:bg-red-750 text-white rounded-xl text-[10px] font-black flex items-center space-x-1 shadow border border-red-500 transition transform active:scale-95 cursor-pointer"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{translate('tts_stop', appLanguage, 'Stop 🤫')}</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSpeakMessage(fullScreenMessage.text)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black flex items-center space-x-1 shadow border border-emerald-500 transition transform active:scale-95 cursor-pointer animate-pulse"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{translate('tts_speak', appLanguage, 'Speak 🔊')}</span>
                        </button>
                      )}

                      {/* Copy to Notebook (notesCopy) */}
                      {fullScreenMessage.role === 'model' && (
                        <button 
                          onClick={() => {
                            const noteItem: Note = { 
                              id: Date.now(), 
                              title: `AI Note - ${new Date().toLocaleDateString()}`, 
                              content: fullScreenMessage.text, 
                              subject: 'Science', 
                              updated_at: new Date().toISOString() 
                            };
                            setNotes(prev => [noteItem, ...prev]);
                            awardPoints(15, 'note');
                            alert(appLanguage === 'Hindi' 
                              ? "सफलतापूर्वक नोटबुक में सहेज लिया गया है! 📝" 
                              : "Successfully saved to your Notebook! 📝");
                          }}
                          className="px-3 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-[10px] font-black flex items-center space-x-1 shadow border border-indigo-550 transition transform active:scale-95 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{translate('save_to_notebook', appLanguage, 'Notebook 📝')}</span>
                        </button>
                      )}

                      {/* Done Studying Return Back button */}
                      <button 
                        onClick={() => {
                          if (speakingText === fullScreenMessage.text) {
                            handleSpeakMessage(fullScreenMessage.text);
                          }
                          setFullScreenMessage(null);
                        }}
                        className="px-4.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-[10px] transition transform active:scale-95 border border-amber-300 shadow cursor-pointer"
                      >
                        {translate('close_blackboard', appLanguage, 'Close 🌟')}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

    </div>
  );
}
