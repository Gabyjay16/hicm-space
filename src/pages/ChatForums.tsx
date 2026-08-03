import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Search, Filter } from 'lucide-react';

interface ForumPost {
  id: string;
  user_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

const ChatForums = () => {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forums');
      if (res.ok) {
        const data = await res.json();
        // Backend returns DESC, let's reverse to show oldest at top for chat view
        setPosts(data.reverse());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id || user.matricule,
          authorName: user.name,
          authorRole: user.role,
          content: newPost
        })
      });

      if (res.ok) {
        setNewPost('');
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-slate-500">Please login to access forums.</div>;

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">General Discussion</h1>
            <p className="text-xs text-slate-500">Connect with students and staff</p>
          </div>
        </div>
        <div className="flex gap-2 text-slate-400">
          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><Search size={18} /></button>
          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><Filter size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {posts.map(post => {
          const isMe = post.user_id === (user.id || user.matricule);
          const isStaff = post.author_role === 'staff' || post.author_role === 'admin';
          
          return (
            <div key={post.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1 mx-1">
                <span className="text-xs font-semibold text-slate-700">{isMe ? 'You' : post.author_name}</span>
                {isStaff && !isMe && (
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Staff</span>
                )}
                <span className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                {post.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handlePost} className="flex gap-2">
          <input 
            type="text"
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
          <button 
            type="submit"
            disabled={!newPost.trim() || isSubmitting}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatForums;
