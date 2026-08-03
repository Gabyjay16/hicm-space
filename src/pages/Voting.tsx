import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Vote, Loader2, Plus, X } from 'lucide-react';

interface PollOption {
  id: string;
  option_text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  hasVoted: boolean;
  created_at: string;
}

const Voting = () => {
  const { user } = useAuth();
  
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Staff creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPolls();
    }
  }, [user]);

  const fetchPolls = async () => {
    try {
      const res = await fetch('/api/voting');
      if (res.ok) {
        const data = await res.json();
        setPolls(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user || user.role !== 'student') return alert("Only students can vote.");
    if (!window.confirm(`Confirm your vote?`)) return;
    
    try {
      const res = await fetch('/api/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pollId, optionId })
      });

      if (res.ok) {
        fetchPolls();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to vote');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) return alert("Please fill all fields");
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: newQuestion, options: newOptions })
      });

      if (res.ok) {
        setNewQuestion('');
        setNewOptions(['', '']);
        setIsCreating(false);
        fetchPolls();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create poll');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-slate-500">Please login to access the voting portal.</div>;

  const isStaff = user.role === 'staff' || user.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <Vote size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Student Government Elections & Polls</h1>
        <p className="text-slate-500">Cast your vote securely and anonymously.</p>
        
        {isStaff && !isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="mt-6 flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} /> Create New Poll
          </button>
        )}
      </div>

      {isCreating && isStaff && (
        <div className="mb-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create Poll</h2>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleCreatePoll} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <input 
                type="text" 
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g. Who should be the next SGA President?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Options</label>
              <div className="space-y-2">
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={opt}
                      onChange={e => {
                        const newArr = [...newOptions];
                        newArr[idx] = e.target.value;
                        setNewOptions(newArr);
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg"
                      placeholder={`Option ${idx + 1}`}
                    />
                    {newOptions.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => setNewOptions(newOptions.filter((_, i) => i !== idx))}
                        className="text-red-500 p-2"
                      ><X size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setNewOptions([...newOptions, ''])}
                className="text-sm text-indigo-600 font-medium mt-2 flex items-center gap-1"
              >
                <Plus size={16} /> Add Option
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl disabled:opacity-50 mt-4"
            >
              {isSubmitting ? 'Creating...' : 'Publish Poll'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
      ) : polls.length === 0 ? (
        <div className="text-center text-slate-500 py-12">No active polls at the moment.</div>
      ) : (
        <div className="space-y-8">
          {polls.map(poll => {
            const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

            return (
              <div key={poll.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{poll.question}</h3>
                
                {poll.hasVoted || isStaff ? (
                  <div className="space-y-4">
                    {poll.hasVoted && (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium mb-6 w-fit">
                        <CheckCircle2 size={16} /> You have voted in this poll
                      </div>
                    )}
                    {poll.options.map(opt => {
                      const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} className="relative">
                          <div className="flex justify-between text-sm font-medium mb-1 z-10 relative">
                            <span>{opt.option_text}</span>
                            <span>{opt.votes} votes ({percent}%)</span>
                          </div>
                          <div className="h-10 w-full bg-slate-100 rounded-lg overflow-hidden relative">
                            <div 
                              className="absolute top-0 left-0 h-full bg-indigo-100 transition-all duration-1000"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-xs text-slate-400 text-right mt-2">{totalVotes} total votes</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {poll.options.map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => handleVote(poll.id, opt.id)}
                        className="p-4 border-2 border-slate-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-colors text-left group"
                      >
                        <div className="font-semibold text-slate-700 group-hover:text-indigo-700">{opt.option_text}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Voting;
