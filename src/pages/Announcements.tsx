import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Calendar, AlertCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

const Announcements = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    setSubmitLoading(true);
    setError('');

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post announcement');
      }

      setTitle('');
      setContent('');
      fetchAnnouncements(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
          <Megaphone size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Official Announcements</h1>
          <p className="text-slate-500">Stay updated with the latest campus news.</p>
        </div>
      </div>

      {isStaff && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-12">
          <h3 className="font-semibold text-slate-800 mb-4">Post New Announcement</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <input 
            type="text" 
            placeholder="Announcement Title" 
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={submitLoading}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <textarea 
            placeholder="Content..." 
            required
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={submitLoading}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={submitLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitLoading ? 'Posting...' : 'Post Notice'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <Megaphone className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No Announcements</h3>
          <p className="text-slate-500">Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {announcements.map((item, idx) => (
            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Calendar size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{item.author}</span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
