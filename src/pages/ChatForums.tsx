import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { Hash, Send } from 'lucide-react';

const CHANNELS = ['General', 'Level-200', 'Level-300', 'Level-400'];

const ChatForums = () => {
  const { user } = useAuth();
  const { messages, addMessage } = useDatabase();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages.filter(m => m.channel === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;
    
    addMessage({
      channel: activeChannel,
      senderName: user.name,
      content: inputValue
    });
    setInputValue('');
  };

  if (!user) return <div className="text-center py-20 text-slate-500">Please login to access chat forums.</div>;

  return (
    <div className="max-w-6xl mx-auto h-[80vh] min-h-[600px] flex bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Forums</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {CHANNELS.map(ch => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeChannel === ch 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Hash size={16} className={activeChannel === ch ? 'text-indigo-500' : 'text-slate-400'} />
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Header */}
        <div className="h-20 border-b border-slate-100 flex items-center px-8">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Hash className="text-slate-400" />
            {activeChannel}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {channelMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No messages here yet. Break the ice!
            </div>
          ) : (
            channelMessages.map(msg => {
              const isMe = msg.senderName === user.name;
              return (
                <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1 px-1">
                    <span className="text-sm font-bold text-slate-700">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`px-5 py-3 rounded-2xl text-[15px] shadow-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Message #${activeChannel}`}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default ChatForums;
