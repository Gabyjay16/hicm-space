import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Complaint {
  id: string;
  matricule: string;
  category: 'Mark Complaint' | 'Bio-Data Correction' | 'Sexual Harassment';
  description: string;
  proofUrl?: string; // Mock upload
  status: 'Pending' | 'Reviewing' | 'Resolved';
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface LostFoundItem {
  id: string;
  title: string;
  location: string;
  type: 'LOST' | 'FOUND';
  contact: string;
  date: string;
}

export interface Message {
  id: string;
  channel: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface ThesisSubmission {
  id: string;
  matricule: string;
  studentName: string;
  paymentScreenshotUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

interface DatabaseContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'date'>) => void;
  updateComplaintStatus: (id: string, status: Complaint['status']) => void;
  
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;

  lostFoundItems: LostFoundItem[];
  addLostFoundItem: (item: Omit<LostFoundItem, 'id' | 'date'>) => void;

  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;

  thesisSubmissions: ThesisSubmission[];
  addThesisSubmission: (submission: Omit<ThesisSubmission, 'id' | 'status' | 'date'>) => void;
  updateThesisStatus: (id: string, status: ThesisSubmission['status']) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Initial Mock Data
const initialAnnouncements: Announcement[] = [
  { id: '1', title: 'Welcome to HICM SPACE', content: 'Explore the new campus digital platform!', date: new Date().toISOString(), author: 'Admin' }
];

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => JSON.parse(localStorage.getItem('hicm_complaints') || '[]'));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => JSON.parse(localStorage.getItem('hicm_announcements') || JSON.stringify(initialAnnouncements)));
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(() => JSON.parse(localStorage.getItem('hicm_lostfound') || '[]'));
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('hicm_messages') || '[]'));
  const [thesisSubmissions, setThesisSubmissions] = useState<ThesisSubmission[]>(() => JSON.parse(localStorage.getItem('hicm_thesis') || '[]'));

  // Persist effects
  useEffect(() => localStorage.setItem('hicm_complaints', JSON.stringify(complaints)), [complaints]);
  useEffect(() => localStorage.setItem('hicm_announcements', JSON.stringify(announcements)), [announcements]);
  useEffect(() => localStorage.setItem('hicm_lostfound', JSON.stringify(lostFoundItems)), [lostFoundItems]);
  useEffect(() => localStorage.setItem('hicm_messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('hicm_thesis', JSON.stringify(thesisSubmissions)), [thesisSubmissions]);

  const addComplaint = (data: Omit<Complaint, 'id' | 'status' | 'date'>) => {
    const newComplaint: Complaint = { ...data, id: Date.now().toString(), status: 'Pending', date: new Date().toISOString() };
    setComplaints(prev => [newComplaint, ...prev]);
  };
  const updateComplaintStatus = (id: string, status: Complaint['status']) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const addAnnouncement = (data: Omit<Announcement, 'id' | 'date'>) => {
    setAnnouncements(prev => [{ ...data, id: Date.now().toString(), date: new Date().toISOString() }, ...prev]);
  };

  const addLostFoundItem = (data: Omit<LostFoundItem, 'id' | 'date'>) => {
    setLostFoundItems(prev => [{ ...data, id: Date.now().toString(), date: new Date().toISOString() }, ...prev]);
  };

  const addMessage = (data: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...data, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
  };

  const addThesisSubmission = (data: Omit<ThesisSubmission, 'id' | 'status' | 'date'>) => {
    setThesisSubmissions(prev => [{ ...data, id: Date.now().toString(), status: 'Pending', date: new Date().toISOString() }, ...prev]);
  };
  const updateThesisStatus = (id: string, status: ThesisSubmission['status']) => {
    setThesisSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <DatabaseContext.Provider value={{
      complaints, addComplaint, updateComplaintStatus,
      announcements, addAnnouncement,
      lostFoundItems, addLostFoundItem,
      messages, addMessage,
      thesisSubmissions, addThesisSubmission, updateThesisStatus
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
