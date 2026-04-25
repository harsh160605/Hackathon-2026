import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiZap } from 'react-icons/fi';

const RESPONSES = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'help', 'start'],
    response: "👋 Hello! I'm VolunteerAI Assistant. I can help you with:\n\n• 📝 Registration & profile\n• 📋 Finding tasks\n• 🏢 NGO information\n• 🤖 How matching works\n• ❓ General FAQ\n\nWhat would you like to know?"
  },
  register: {
    patterns: ['register', 'signup', 'sign up', 'join', 'create account'],
    response: "📝 **How to Register:**\n\n1. Click 'Sign Up' on the navigation bar\n2. Fill in your name, email, and password\n3. Select your role (Volunteer or NGO Admin)\n4. Choose your city and skills\n5. Click 'Create Account'\n\nOnce registered, you'll be redirected to your dashboard!"
  },
  tasks: {
    patterns: ['task', 'tasks', 'find task', 'available', 'work', 'help', 'volunteer'],
    response: "📋 **Finding Tasks:**\n\n• Go to your **Volunteer Dashboard**\n• Browse **Open Tasks** or check **Recommended** ones (matched to your skills!)\n• Each task shows required skills, urgency, and location\n• Green-highlighted skills are ones you match!\n\nTasks are sorted by priority — critical ones appear first."
  },
  matching: {
    patterns: ['match', 'matching', 'how match', 'algorithm', 'score'],
    response: "🤖 **How Matching Works:**\n\nOur AI uses a composite score:\n• **50%** Skill Match — Jaccard similarity between your skills and task requirements\n• **30%** Location — Haversine distance (closer = higher score)\n• **20%** Availability — Full-time > Part-time > Weekends\n\nThe system ranks all volunteers and suggests the best matches to NGOs!"
  },
  ngo: {
    patterns: ['ngo', 'organization', 'join ngo', 'create ngo'],
    response: "🏢 **NGO Operations:**\n\n• **Create NGO:** Login as NGO role → Fill in NGO details\n• **Create Tasks:** Use the task form on your NGO dashboard\n• **Find Matches:** Click '⚡ Find Match' on any open task\n• **Assign Volunteers:** Review match scores and assign the best fit"
  },
  skills: {
    patterns: ['skill', 'skills', 'what skills'],
    response: "🎯 **Available Skills:**\n\n• Medical • Teaching • Logistics\n• Cooking • Counseling • Driving\n• Construction • Tech • Translation\n• First Aid\n\nYou can update your skills anytime from your profile!"
  },
  urgency: {
    patterns: ['urgency', 'priority', 'critical', 'emergency'],
    response: "⚠️ **Urgency Levels:**\n\n• 🟢 **Low** — Can be completed at any time\n• 🟡 **Medium** — Should be done within a week\n• 🟠 **High** — Needs attention within 48 hours\n• 🔴 **Critical** — Emergency! Immediate action needed\n\nTasks with approaching deadlines get auto-boosted in priority."
  },
  about: {
    patterns: ['about', 'what is', 'platform', 'system'],
    response: "🚀 **About VolunteerAI:**\n\nA smart, data-driven platform that intelligently connects volunteers with community needs using:\n\n• Skill-based matching\n• Urgency prioritization\n• Real-time data analysis\n• Map visualization\n\nThink of it as **Uber for volunteering** — but smarter! 🧠"
  }
};

const DEFAULT_RESPONSE = "🤔 I'm not sure about that. Try asking about:\n• Registration\n• Tasks & matching\n• NGO operations\n• Skills\n• Priority system\n\nOr type **'help'** for a full guide!";

function getResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const category of Object.values(RESPONSES)) {
    if (category.patterns.some(p => lower.includes(p))) {
      return category.response;
    }
  }
  return DEFAULT_RESPONSE;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "👋 Hi! I'm VolunteerAI Assistant. How can I help you today?", time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      const botMsg = { from: 'bot', text: getResponse(input), time: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
    
    setInput('');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4">
        {/* Chat Panel */}
        {isOpen && (
          <div className="w-[380px] h-[520px] bg-slate-900/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_40px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-[40px]"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg overflow-hidden relative group">
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FiZap className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">VolunteerAI</h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Systems Online
                  </div>
                </div>
              </div>

              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all relative z-10 shrink-0">
                <FiX />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <div key={i} className={`flex max-w-[85%] ${msg.from === 'user' ? 'self-end' : 'self-start'}`}>
                  {msg.from === 'bot' && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-2 mt-auto">
                      <FiZap className="text-cyan-400 text-xs" />
                    </div>
                  )}
                  
                  <div className={`px-4 py-3 text-[0.9rem] leading-relaxed shadow-sm whitespace-pre-line ${
                    msg.from === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-br-sm' 
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm font-medium"
                  placeholder="Ask for assistance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim()}
                  className="absolute right-1.5 p-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-all disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  <FiSend className={input.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white text-2xl shadow-[0_10px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_10px_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 animate-ping opacity-30 rounded-3xl bg-cyan-500 pointer-events-none"></div>
            <FiMessageCircle className="relative z-10 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
    </>
  );
};

export default ChatbotWidget;
