import { useState, useEffect, useRef, ChangeEvent } from 'react';
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
  X,
  Users,
  ArrowLeft,
  Percent,
  Atom,
  Heart,
  Zap,
  FlaskConical,
  Sparkles,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStudyAnswer, generateQuiz, generateStudyDiagram } from './services/geminiService';
import type { Note, ScheduleItem, Progress, ChatMessage, Subject, User as UserType, Group, GroupMessage, GroupNote } from './types';

const SUBJECTS: Subject[] = ['Mathematics', 'Science', 'Biology', 'Physics', 'Chemistry', 'English'];

const getTimeGreeting = () => {
  const hr = new Date().getHours();
  if (hr < 5) return { label: "Good night / शुभ रात्रि", icon: "🌙" };
  if (hr < 12) return { label: "Good Morning / शुभ प्रभात", icon: "☀️" };
  if (hr < 16) return { label: "Good Afternoon / शुभ दोपहर", icon: "🌤️" };
  if (hr < 21) return { label: "Good Evening / शुभ संध्या", icon: "🌇" };
  return { label: "Good Night / शुभ रात्रि", icon: "🌙" };
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

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const [notebookTab, setNotebookTab] = useState<'notes' | 'planner'>('notes');
  const [waveToast, setWaveToast] = useState<{ name: string; response: string; points: number } | null>(null);

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
    return stored ? JSON.parse(stored) : [];
  });
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
  const [quizLanguage, setQuizLanguage] = useState<'English' | 'Hindi'>('English');

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
      const answer = await getStudyAnswer(inputCopy || "Discuss this homework task", imageCopy || undefined, studentContext);
      let aiImage: string | undefined = undefined;

      if (inputCopy.toLowerCase().includes('diagram') || inputCopy.toLowerCase().includes('visualize')) {
        const diagram = await generateStudyDiagram(inputCopy);
        if (diagram) aiImage = diagram;
      }

      setChatMessages(prev => [...prev, { role: 'model', text: answer, image: aiImage }]);
      awardPoints(10);
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
  const startQuiz = async (subject: Subject, lang: 'English' | 'Hindi' = 'English') => {
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
          <div className="my-auto space-y-6 py-4">
            {/* Header/Brand Icon */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
                <GraduationCap className="w-9 h-9 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4 font-display">StudyBuddy AI</h2>
              <p className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase font-mono bg-indigo-50 px-3 py-1 rounded-full inline-block">आपका पर्सनल पढ़ाई दोस्त ✨</p>
            </div>

            {/* Introductory Children Note */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50 p-5 rounded-3xl border border-indigo-100/50 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎒</span>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">प्यारे बच्चों के लिए एक प्यारा संदेश 🌟</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                स्टडी बडी AI में आपका स्वागत है! यह आपकी स्कूल की पढ़ाई को आसान और मजेदार बनाने वाला आपका प्यारा AI दोस्त है। यहाँ आप कठिन से कठिन विषयों (जैसे: Maths, Science, English, Physics) को आसान शब्दों में चित्र के साथ समझ सकते हैं और लाइव मजेदार क्विज़ खेल सकते हैं।
              </p>
              <p className="text-xs text-indigo-700 font-bold leading-relaxed bg-indigo-100/40 p-3 rounded-2xl border border-indigo-200/20">
                📢 शुरू करने के लिए नीचे अपनी जानकारी (नाम, स्कूल और क्लास) भरें! इसके बाद AI बिलकुल आपके स्कूल और क्लास के अनुसार ही आपसे बात करेगा और पढ़ाएगा! चलो अपनी जानकारी भरें! 🚀
              </p>
            </div>

            {/* Registration Input Form */}
            <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b border-slate-100 pb-3 flex items-center font-display">
                <User className="w-4 h-4 mr-1.5 text-indigo-500" /> अपनी जानकारी भरें (Student Details)
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  बच्चे का नाम (Student Name) *
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
                  बच्चे का स्कूल (School Name) *
                </label>
                <input
                  type="text"
                  required
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  placeholder="स्कूल का नाम लिखें (e.g. Model DAV school)"
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  id="reg_school_input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  बच्चे की क्लास (Student Class) *
                </label>
                <select
                  required
                  value={regClass}
                  onChange={(e) => setRegClass(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  id="reg_class_select"
                >
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                    <option key={c} value={c}>{`Class ${c} / कक्षा ${c}`}</option>
                  ))}
                </select>
              </div>

              {/* Study Avatar Selector Option */}
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">
                  चुनें अपना स्टडी अवतार (Choose Your Avatar) ✨
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
                चलो पढ़ाई शुरू करें! (Let's Study!) 🚀
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Main App Container (Absolutely locked viewport) */
        <div className="w-full max-w-md h-screen md:h-[90vh] bg-slate-50 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative z-10 border border-slate-800/25">
          
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
                            {getTimeGreeting().label}
                          </span>
                          <span className="text-sm select-none">{getTimeGreeting().icon}</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1.5 flex items-center leading-tight" id="user_id_display">
                          Hello, {user?.name}! <span className="text-indigo-500 ml-1">🚀</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-2 flex flex-wrap items-center gap-1.5" id="student_meta_badge">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-white border border-slate-100 text-slate-705 shadow-2xs font-mono text-[9px]">
                            🏫 {user?.school || "School Not Set"}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-mono text-[9px] font-black">
                            📚 Class {user?.className || "Set class"}
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

                  {/* Active Buddies Online Row (Bring People Up!) */}
                  <section className="space-y-3" id="social_feed">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-extrabold text-slate-800 tracking-tight flex items-center uppercase text-slate-500">
                        <Users className="w-4 h-4 text-indigo-500 mr-1.5" />
                        Online Study Buddies / सहपाठी 👥
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
                      Academy Playground / पढ़ाई के साधन 🚀
                    </h2>
                    <div className="grid grid-cols-2 gap-3 pb-1">
                      
                      {/* AI Tutor */}
                      <button 
                        onClick={() => setActiveTab('chat')}
                        className="p-4 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white rounded-3xl text-left shadow-lg shadow-indigo-100/50 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col justify-between h-32 relative overflow-hidden group"
                      >
                        <div className="absolute top-2 right-2 bg-indigo-500/50 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-wider">
                          Live Assistant
                        </div>
                        <BrainCircuit className="w-7 h-7 stroke-[2.5] text-indigo-200 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-extrabold text-xs">AI Tutor / एआई टीचर ⚡</h3>
                          <p className="text-[9px] text-indigo-100/90 font-bold mt-1 leading-snug">Answers homework & designs custom drawings</p>
                        </div>
                      </button>

                      {/* Practice Quiz */}
                      <button 
                        onClick={() => setActiveTab('quiz')}
                        className="p-4 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-3xl text-left shadow-lg shadow-emerald-100/50 hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col justify-between h-32 relative overflow-hidden group"
                      >
                        <div className="absolute top-2 right-2 bg-emerald-400/50 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-wider">
                          Practice
                        </div>
                        <GraduationCap className="w-7 h-7 stroke-[2.5] text-emerald-100 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-extrabold text-xs">Play Quiz / क्विज़ खेलें 🏆</h3>
                          <p className="text-[9px] text-emerald-50/90 font-bold mt-1 leading-snug">Test subject skills, earn dynamic XP medals</p>
                        </div>
                      </button>

                      {/* Study Notes */}
                      <button 
                        onClick={() => setActiveTab('notebook')}
                        className="p-4 bg-gradient-to-b from-amber-500 to-amber-600 text-white rounded-3xl text-left shadow-lg shadow-amber-100/55 hover:shadow-amber-200 hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col justify-between h-28 relative overflow-hidden group"
                      >
                        <div className="absolute top-2 right-2 bg-amber-400/50 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-wider">
                          {notes.length} notes
                        </div>
                        <BookOpen className="w-6 h-6 stroke-[2.5] text-amber-100 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-extrabold text-xs">Notebook / कॉपियां 📝</h3>
                          <p className="text-[9px] text-amber-50/90 font-bold mt-0.5 leading-none">Formula sheets & key facts</p>
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
                          <h3 className="font-extrabold text-xs">Planner / आज का काम 📅</h3>
                          <p className="text-[9px] text-purple-50/90 font-bold mt-0.5 leading-none">Class timings & assignments</p>
                        </div>
                      </button>

                    </div>
                  </section>

                  {/* Badges and Progress Statistics from Profile */}
                  <section className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <h2 className="text-xs font-extrabold text-slate-800 tracking-tight flex items-center uppercase text-slate-500">
                        <Award className="w-4 h-4 text-emerald-500 mr-2 animate-bounce" />
                        Academic Badges / पुरस्कार 🎖️
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
                      Learning Progress / प्रगति 📊
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
                    <button onClick={() => setChatMessages([])} className="text-slate-400 hover:text-red-500 text-xs font-bold px-2 py-1 bg-slate-50 rounded-lg">Clear Chats</button>
                  </header>

                  {/* Chat messages queue */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50" id="chat_scroll">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-10 max-w-[240px] mx-auto">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BrainCircuit className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">Ask Gemini Assistant</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">Solve Homework, explain science, draft diagrams inside direct threads!</p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} id={`chat_item_${i}`}>
                        <div className={`max-w-[85%] rounded-3xl p-3.5 shadow-sm text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-850 rounded-tl-none border border-slate-150/70'}`}>
                          {msg.image && (
                            <img src={msg.image} alt="Uploaded problem" className="w-full rounded-2xl mb-2 max-h-40 object-cover" />
                          )}
                          <div className="leading-relaxed text-xs md:text-sm whitespace-pre-wrap select-text">
                            {renderChatMessage(msg.text)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-3xl rounded-tl-none flex items-center space-x-2 shadow-sm text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span className="font-medium animate-pulse">Gemini is solving...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Absolute pinned and locked bottom entry area */}
                  <div className="p-3 border-t border-slate-100 bg-white shrink-0 space-y-2">
                    {selectedImage && (
                      <div className="relative inline-block" id="image_preview">
                        <img src={selectedImage} alt="Problem sketch" className="w-16 h-16 rounded-xl object-cover border border-indigo-500" />
                        <button onClick={() => setSelectedImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-center px-3 py-1 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 relative overflow-hidden">
                        {isListening && (
                          <div className="absolute inset-0 bg-red-50 flex items-center px-3 space-x-2 z-10">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-xs font-bold text-red-600 animate-pulse">Listening...</span>
                          </div>
                        )}
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask a question or request a diagram..."
                          className="flex-1 p-2 bg-transparent focus:outline-none text-xs text-slate-800"
                        />
                        <button onClick={handleVoiceInput} className="text-slate-400 hover:text-red-500 p-1">
                          <Mic className="w-4 h-4" />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600 p-1">
                          <Camera className="w-4 h-4" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      </div>
                      <button 
                        onClick={handleSendMessage}
                        disabled={isChatLoading}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl disabled:opacity-50 transition active:scale-95"
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
                              <div className="space-y-1.5 pt-2 border-t border-slate-55">
                                <button
                                  onClick={() => startQuiz(sub, 'English')}
                                  className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition rounded-xl text-[9px] font-black text-indigo-600 flex items-center justify-center space-x-1 border border-indigo-100/50 cursor-pointer"
                                  id={`quiz_eng_${sub.toLowerCase()}`}
                                >
                                  <span>🇬🇧</span>
                                  <span>Start quiz English</span>
                                </button>
                                <button
                                  onClick={() => startQuiz(sub, 'Hindi')}
                                  className="w-full py-1.5 bg-orange-50 hover:bg-orange-100 active:scale-95 transition rounded-xl text-[9px] font-black text-orange-600 flex items-center justify-center space-x-1 border border-orange-100/50 cursor-pointer"
                                  id={`quiz_hin_${sub.toLowerCase()}`}
                                >
                                  <span>🇮🇳</span>
                                  <span>Start quiz Hindi</span>
                                </button>
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
                              <h3 className="text-base font-black text-slate-900">Quiz Completed! / अभ्यास समाप्त!</h3>
                              <p className="text-xs text-slate-600 font-bold mt-1">Excellent Effort! You scored {quizScore} / {quizQuestions.length}</p>
                              <p className="text-indigo-600 font-black text-xs mt-2.5 flex items-center justify-center space-x-1">
                                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                                <span>+{quizScore * 10} XP Reward Added to Profile!</span>
                              </p>
                            </div>
                            <button onClick={() => setQuizSubject(null)} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase shadow-md shadow-indigo-150 cursor-pointer">Back to Topics / वापस जाएं</button>
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
            title="Dashboard"
            id="tab_btn_home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">Home</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('chat'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'chat' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title="AI Helper"
            id="tab_btn_chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">AI Tutor</span>
          </button>

          <button 
            onClick={() => { setActiveTab('groups'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'groups' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title="Classrooms"
            id="tab_btn_groups"
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">Groups</span>
          </button>

          <button 
            onClick={() => { setActiveTab('notebook'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'notebook' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title="Notes"
            id="tab_btn_notebook"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">Notebook</span>
          </button>

          <button 
            onClick={() => { setActiveTab('quiz'); setActiveGroup(null); }}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-200 ${activeTab === 'quiz' ? 'text-indigo-600 bg-indigo-50/70 font-black scale-105' : 'text-slate-400 hover:text-slate-650'}`}
            title="Lessons"
            id="tab_btn_quiz"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">Quiz</span>
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
        </AnimatePresence>
      </div>
      )}

    </div>
  );
}
