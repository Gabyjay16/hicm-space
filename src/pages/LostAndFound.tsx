import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, SearchCheck, Plus, X, Upload, CheckCircle, Loader2 } from 'lucide-react';

interface LostFoundItem {
  id: string;
  type: 'Lost' | 'Found';
  item_name: string;
  description: string;
  contact_info: string;
  image_url?: string;
  reporter_id: string;
  status: 'Active' | 'Resolved';
  created_at: string;
}

const LostAndFound = () => {
  const { user } = useAuth();
  
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Lost' | 'Found'>('All');
  
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState<'Lost' | 'Found'>('Lost');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/lost-and-found');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fileToUpload: File) => {
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const res = await fetch('/api/storage', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !description || !contactInfo) return;
    setIsSubmitting(true);
    
    try {
      let imageUrl = null;
      if (file) {
        imageUrl = await handleFileUpload(file);
      }

      const res = await fetch('/api/lost-and-found', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: reportType,
          itemName,
          description,
          contactInfo,
          imageUrl
        })
      });

      if (!res.ok) throw new Error('Failed to submit report');
      
      setItemName('');
      setDescription('');
      setContactInfo('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsReporting(false);
      fetchItems();
    } catch (e: any) {
      alert(e.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveItem = async (id: string) => {
    if (!window.confirm("Mark this item as resolved?")) return;
    try {
      const res = await fetch('/api/lost-and-found', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: 'Resolved' })
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <div className="text-center py-20 text-slate-500">Please login to access Lost & Found.</div>;

  const filteredItems = filter === 'All' ? items : items.filter(i => i.type === filter);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <SearchCheck className="text-indigo-600" size={32} />
            Lost & Found
          </h1>
          <p className="text-slate-500 mt-2">Report missing items or help reunite found items with their owners.</p>
        </div>
        
        {!isReporting && (
          <button 
            onClick={() => setIsReporting(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2 self-start md:self-auto"
          >
            <Plus size={20} />
            Report Item
          </button>
        )}
      </div>

      {/* Report Form */}
      {isReporting && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/20 mb-12 animate-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
          <button 
            onClick={() => setIsReporting(false)}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Create Report</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Report Type</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input type="radio" name="type" className="peer sr-only" checked={reportType === 'Lost'} onChange={() => setReportType('Lost')} />
                    <div className="p-4 border-2 border-slate-200 rounded-xl text-center cursor-pointer peer-checked:border-amber-500 peer-checked:bg-amber-50 font-medium transition-all">
                      I lost something
                    </div>
                  </label>
                  <label className="flex-1">
                    <input type="radio" name="type" className="peer sr-only" checked={reportType === 'Found'} onChange={() => setReportType('Found')} />
                    <div className="p-4 border-2 border-slate-200 rounded-xl text-center cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 font-medium transition-all">
                      I found something
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Item Name</label>
                <input 
                  type="text" required
                  value={itemName} onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. Blue Hydroflask, Student ID"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Info</label>
                <input 
                  type="text" required
                  value={contactInfo} onChange={e => setContactInfo(e.target.value)}
                  placeholder="Phone number or campus location"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image (Optional)</label>
                {!file ? (
                  <div className="relative border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 text-center hover:bg-slate-100 transition-colors">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 font-medium block">Upload Image</span>
                    <span className="text-xs text-slate-400 mt-1 block">PNG, JPG up to 5MB</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                    <div className="flex items-center gap-3 truncate">
                      <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <span className="text-sm text-indigo-900 font-medium truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => setFile(null)} className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Location Details</label>
                <textarea 
                  required
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Where was it seen? Any identifying marks?"
                  className="w-full flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none min-h-[120px]"
                />
              </div>
            </div>
            
            <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl w-fit">
        {['All', 'Lost', 'Found'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {tab} Items
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
          <Search className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No items found</h3>
          <p className="text-slate-500 mt-1">There are no {filter !== 'All' ? filter.toLowerCase() : ''} items currently reported.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
              {item.image_url ? (
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                      item.type === 'Lost' ? 'bg-amber-500/90 text-white' : 'bg-emerald-500/90 text-white'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`h-32 flex items-center justify-center relative ${
                  item.type === 'Lost' ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                  <Search size={40} className={item.type === 'Lost' ? 'text-amber-200' : 'text-emerald-200'} />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      item.type === 'Lost' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.item_name}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="font-medium">{item.contact_info}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Reported {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    
                    {item.status === 'Resolved' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                        <CheckCircle size={12} /> Resolved
                      </span>
                    ) : (
                      (user.role === 'staff' || user.role === 'admin' || user.matricule === item.reporter_id || user.id === item.reporter_id) && (
                        <button 
                          onClick={() => resolveItem(item.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LostAndFound;
