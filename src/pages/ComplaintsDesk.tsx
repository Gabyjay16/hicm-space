import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import type { Complaint } from '../context/DatabaseContext';
import { ShieldAlert, Info } from 'lucide-react';

const ComplaintsDesk = () => {
  const { user } = useAuth();
  const { complaints, addComplaint, updateComplaintStatus } = useDatabase();
  
  const [category, setCategory] = useState<Complaint['category']>('Mark Complaint');
  const [description, setDescription] = useState('');
  
  if (!user) return <div className="text-center py-20 text-slate-500">Please login to submit or view complaints.</div>;

  const isStaff = user.role === 'staff' || user.role === 'admin';
  const myComplaints = complaints.filter(c => c.matricule === user.matricule);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    
    addComplaint({
      matricule: user.matricule || 'UNKNOWN',
      category,
      description,
      proofUrl: category === 'Sexual Harassment' ? 'mock-upload.jpg' : undefined
    });
    
    setDescription('');
    alert('Complaint submitted successfully.');
  };

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
                  <td className="p-4 font-medium text-slate-700">{c.status}</td>
                  <td className="p-4">
                    <select 
                      value={c.status}
                      onChange={(e) => updateComplaintStatus(c.id, e.target.value as Complaint['status'])}
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
              onChange={(e) => setCategory(e.target.value as Complaint['category'])}
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
              <div>
                <h4 className="text-sm font-bold text-rose-900">Strictly Confidential</h4>
                <p className="text-xs text-rose-700 mt-1">This report goes directly to the disciplinary committee and remains anonymous to general staff.</p>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-rose-800 mb-1">Upload Evidence (Optional)</label>
                  <input type="file" className="text-xs text-rose-700 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer" />
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Submit Ticket
          </button>
        </form>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
          Your Tickets <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">{myComplaints.length}</span>
        </h2>
        
        <div className="space-y-4">
          {myComplaints.length === 0 ? (
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
                <div className="mt-4 text-xs text-slate-400">Submitted on {new Date(c.date).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsDesk;
