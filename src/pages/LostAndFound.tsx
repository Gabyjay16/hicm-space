import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { MapPin, Search } from 'lucide-react';

const LostAndFound = () => {
  const { user } = useAuth();
  const { lostFoundItems, addLostFoundItem } = useDatabase();
  
  const [filter, setFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  
  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'LOST' | 'FOUND'>('LOST');
  const [contact, setContact] = useState('');

  const filteredItems = lostFoundItems.filter(item => filter === 'ALL' || item.type === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLostFoundItem({ title, location, type, contact });
    setTitle(''); setLocation(''); setContact('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lost & Found</h1>
          <p className="text-slate-500">Help reunite students with their belongings.</p>
        </div>
        
        {/* Filters */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          {['ALL', 'LOST', 'FOUND'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Post Form */}
        {user && (
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <h3 className="font-semibold text-slate-800 mb-4">Report an Item</h3>
              
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setType('LOST')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${type === 'LOST' ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-500'}`}>I LOST</button>
                <button type="button" onClick={() => setType('FOUND')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${type === 'FOUND' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>I FOUND</button>
              </div>

              <input required type="text" placeholder="Item Name (e.g. Blue Notebook)" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm px-4 py-2 border border-slate-200 rounded-lg mb-3 outline-none focus:border-indigo-500" />
              <input required type="text" placeholder="Location (e.g. Library Desk 4)" value={location} onChange={e => setLocation(e.target.value)} className="w-full text-sm px-4 py-2 border border-slate-200 rounded-lg mb-3 outline-none focus:border-indigo-500" />
              <input required type="text" placeholder="Contact Info (Phone/Room)" value={contact} onChange={e => setContact(e.target.value)} className="w-full text-sm px-4 py-2 border border-slate-200 rounded-lg mb-4 outline-none focus:border-indigo-500" />
              
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                Post {type === 'LOST' ? 'Lost Item' : 'Found Item'}
              </button>
            </form>
          </div>
        )}

        {/* Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${user ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
              <div className="h-40 bg-slate-100 flex items-center justify-center border-b border-slate-100">
                <Search className="text-slate-300" size={48} />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider ${item.type === 'LOST' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                  <MapPin size={14} /> {item.location}
                </p>
                <div className="mt-auto">
                  <div className="text-xs font-semibold text-slate-400 mb-1">CONTACT</div>
                  <div className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{item.contact}</div>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              No items found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LostAndFound;
