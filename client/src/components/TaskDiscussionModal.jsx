import { useState, useEffect } from 'react';
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi';
import { addTaskMessage } from '../services/api';

const TaskDiscussionModal = ({ task, user, onClose, onMessageAdded }) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState(task.messages || []);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessages(task.messages || []);
  }, [task]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await addTaskMessage(task._id, text);
      setMessages(res.data);
      setText('');
      if (onMessageAdded) onMessageAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-lg rounded-3xl shadow-2xl flex flex-col" style={{ background: 'rgba(15,20,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', height: '70vh' }}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 rounded-t-3xl">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <FiMessageSquare className="text-blue-400" /> Task Comms
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <FiMessageSquare className="text-4xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet. Start the discussion!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderId === user._id;
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 mb-1 px-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-black/20 border-t border-white/10 rounded-b-3xl">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
            />
            <button disabled={sending || !text.trim()} type="submit" className="px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center transition-all">
              <FiSend />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default TaskDiscussionModal;
