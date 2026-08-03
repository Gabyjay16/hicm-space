import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [tab, setTab] = useState<'student' | 'staff'>('student');
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [matricule, setMatricule] = useState('');
  const [position, setPosition] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'student') {
      login({ role: 'student', name, phone, matricule });
    } else {
      login({ role: 'staff', name, phone, position });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Welcome to HICM SPACE</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'student' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setTab('student')}
          >
            Student Login
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'staff' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setTab('staff')}
          >
            Staff / Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              required
              type="tel" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 681234567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {tab === 'student' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matricule</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. HICM2023001"
                value={matricule}
                onChange={e => setMatricule(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Position / Title</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Lecturer, Admin"
                value={position}
                onChange={e => setPosition(e.target.value)}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Access Dashboard
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthModal;
