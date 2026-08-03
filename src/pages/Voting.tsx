import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Vote } from 'lucide-react';

const candidates = [
  { id: '1', name: 'Alice Johnson', position: 'SGA President', image: 'https://i.pravatar.cc/150?u=a' },
  { id: '2', name: 'Bob Smith', position: 'SGA President', image: 'https://i.pravatar.cc/150?u=b' },
  { id: '3', name: 'Charlie Davis', position: 'Vice President', image: 'https://i.pravatar.cc/150?u=c' },
  { id: '4', name: 'Diana Prince', position: 'Vice President', image: 'https://i.pravatar.cc/150?u=d' },
];

const Voting = () => {
  const { user } = useAuth();
  
  // Use local storage specifically for voting to persist individual user state easily
  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    if (!user || user.role !== 'student') return false;
    return !!localStorage.getItem(`voted_${user.matricule}`);
  });

  const handleVote = (candidateName: string) => {
    if (!user || user.role !== 'student') return alert("Only students can vote.");
    if (window.confirm(`Confirm your vote for ${candidateName}?`)) {
      localStorage.setItem(`voted_${user.matricule}`, 'true');
      setHasVoted(true);
    }
  };

  if (!user) return <div className="text-center py-20 text-slate-500">Please login to access the voting portal.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <Vote size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Student Government Elections</h1>
        <p className="text-slate-500">Cast your vote for the upcoming academic year.</p>
      </div>

      {hasVoted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-12 text-center max-w-2xl mx-auto animate-in zoom-in duration-500">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Vote Recorded!</h2>
          <p className="text-emerald-700 mb-6">Thank you for participating. Your vote has been securely recorded under matricule <strong>{user.matricule}</strong>.</p>
          <div className="inline-block bg-white px-6 py-3 rounded-full text-sm font-mono text-emerald-800 shadow-sm">
            Receipt: {Math.random().toString(36).substring(2, 15).toUpperCase()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {candidates.map(candidate => (
            <div key={candidate.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-32 bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/20 transition-colors"></div>
                <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
              </div>
              <div className="p-5 text-center">
                <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1 block">{candidate.position}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{candidate.name}</h3>
                <button 
                  onClick={() => handleVote(candidate.name)}
                  disabled={user.role !== 'student'}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Voting;
