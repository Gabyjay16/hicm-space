import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Info, Upload, CheckCircle, Loader2, X } from 'lucide-react';

interface Complaint {
  id: string;
  matricule: string;
  category: string;
  description: string;
  proof_url?: string;
  status: 'Pending' | 'Reviewing' | 'Resolved';
  created_at: string;
}

const ComplaintsDesk = () => {
  const { user } = useAuth();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [category, setCategory] = useState('Mark Complaint');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateComplaintStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (fileToUpload: File) => {
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const res = await fetch('/api/storage', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Failed to upload evidence');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    setIsSubmitting(true);
    
    try {
      let proofUrl = null;
      if (file && category === 'Sexual Harassment') {
        proofUrl = await handleFileUpload(file);
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, description, proofUrl })
      });

      if (!res.ok) throw new Error('Failed to submit complaint');
      
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchComplaints();
      alert('Complaint submitted successfully.');
    } catch (e: any) {
      alert(e.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-slate-500">Please login to submit or view complaints.</div>;

  const isStaff = user.role === 'staff' || user.role === 'admin';
  const myComplaints = complaints; // Backend filters for students automatically

  if (isStaff) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Complaints Management</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-medium">Matricule</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Proof</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {complaints.map(c => (
                <tr key={c.id}>
                  <td className="p-4 text-slate-900">{c.matricule}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.category === 'Sexual Harassment' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>
                      {c.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 max-w-md truncate">{c.description}</td>
                  <td className="p-4">
                    {c.proof_url ? (
                      <a href={c.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Evidence</a>
                    ) : '-'}
                  </td>
                  <td className="p-4 font-medium text-slate-700">{c.status}</td>
                  <td className="p-4">
                    <select 
                      value={c.status}
                      onChange={(e) => updateComplaintStatus(c.id, e.target.value)}
                      className="text-sm border border-slate-200 rounded p-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Form Section */}
      <div>
        <h1 className="text-2xl font-bold mb-6 text-slate-900">Submit a Complaint</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
            >
              <option>Mark Complaint</option>
              <option>Bio-Data Correction</option>
              <option>Sexual Harassment</option>
            </select>
          </div>

          {category === 'Sexual Harassment' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="text-rose-600 flex-shrink-0" />
              <div className="w-full">
                <h4 className="text-sm font-bold text-rose-900">Strictly Confidential</h4>
                <p className="text-xs text-rose-700 mt-1">This report goes directly to the disciplinary committee and remains anonymous to general staff.</p>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-rose-800 mb-2">Upload Evidence (Optional)</label>
                  {!file ? (
                     <div className="relative border-2 border-dashed border-rose-300 bg-white rounded-lg p-4 text-center hover:bg-rose-50 transition-colors">
                       <input 
                         ref={fileInputRef}
                         type="file" 
                         accept="image/*,.pdf"
                         onChange={(e) => setFile(e.target.files?.[0] || null)}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                       />
                       <Upload className="mx-auto h-6 w-6 text-rose-400 mb-1" />
                       <span className="text-xs text-rose-600 font-medium">Click to upload or drag & drop</span>
                     </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white border border-rose-200 p-2 rounded-lg">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-rose-700 truncate">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-rose-100 rounded text-rose-500">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Description</label>
            <textarea 
              required
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 resize-none"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : 'Submit Ticket'}
          </button>
        </form>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
          Your Tickets <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">{myComplaints.length}</span>
        </h2>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>
          ) : myComplaints.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-500 flex flex-col items-center">
              <Info size={32} className="mb-2 text-slate-400" />
              You have not submitted any complaints yet.
            </div>
          ) : (
            myComplaints.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">{c.category}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'Reviewing' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{c.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Submitted on {new Date(c.created_at).toLocaleDateString()}</span>
                  {c.proof_url && <a href={c.proof_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Evidence Attached</a>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsDesk;
