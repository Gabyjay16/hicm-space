import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, CheckCircle2, Clock, BrainCircuit, Upload, Download, Trash2, X, BookOpen } from 'lucide-react';
import { generateQuiz } from '../utils/aiService';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Note {
  id: string;
  title: string;
  description: string;
  file_key: string;
  created_at: string;
  uploader_name: string;
}

const NotesAndMCQs = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  
  // Upload State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Generator State
  const [selectedNoteForQuiz, setSelectedNoteForQuiz] = useState<Note | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Quiz State
  const [quizData, setQuizData] = useState<Question[] | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/storage');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return alert('Title and file are required');
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('description', uploadDesc);
      formData.append('file', uploadFile);

      const res = await fetch('/api/storage', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setUploadTitle('');
        setUploadDesc('');
        setUploadFile(null);
        fetchNotes();
        alert('Note uploaded successfully!');
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/storage/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNotes();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer: number;
    if (hasStarted && !isSubmitted && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isSubmitted, timeLeft]);

  const handleGenerate = async () => {
    if (!selectedNoteForQuiz) return alert('Please select a note first.');
    setIsGenerating(true);
    try {
      // In a real app we'd extract text from the file via a backend worker
      // For mock purposes, we just pass some dummy text to the AI.
      const mockTextContext = `This is a lecture on Software Engineering covering Agile methodologies, Scrum, React development, and Database design. Based on ${selectedNoteForQuiz.title}`;
      
      const generatedQuestions = await generateQuiz(mockTextContext, numQuestions);
      
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuizData(generatedQuestions);
        setHasStarted(false);
        setIsSubmitted(false);
        setCurrentAnswers({});
      } else {
        alert("Failed to parse AI response. Please try again.");
      }
    } catch (error: any) {
      console.error(error);
      alert(`Error generating quiz: ${error.message || 'Check API key or connection.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = () => {
    if (!quizData) return;
    setTimeLeft(quizData.length * 60); // 1 minute per question
    setHasStarted(true);
  };

  const handleAutoSubmit = () => {
    if (isSubmitted || !quizData) return;
    calculateScore();
  };

  const calculateScore = () => {
    if (!quizData) return;
    let s = 0;
    quizData.forEach((q, idx) => {
      if (currentAnswers[idx] === q.answer) {
        s += 1;
      }
    });
    setScore(s);
    setIsSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return <div className="text-center py-20 text-slate-500">Please login to access Notes & MCQs.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lecture Notes & AI Quiz Generator</h1>
          <p className="text-slate-500">Access class materials and generate practice tests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Notes List & Upload */}
        <div className="lg:col-span-1 space-y-6">
          {isStaff && (
            <form onSubmit={handleUpload} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Upload size={18} className="text-indigo-500" />
                Upload Notes
              </h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Lecture Title" 
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <textarea 
                  placeholder="Description (optional)" 
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                />
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
              Available Notes
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {loadingNotes ? (
                <p className="text-sm text-slate-500 text-center py-4">Loading notes...</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No lecture notes available.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group">
                    <h3 className="font-medium text-slate-800 text-sm">{note.title}</h3>
                    {note.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <a 
                        href={`/api/storage/${note.id}`}
                        target="_blank"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Download size={14} /> Download
                      </a>
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => setSelectedNoteForQuiz(note)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                          title="Generate Quiz"
                        >
                          <BrainCircuit size={14} /> Quiz
                        </button>
                        {isStaff && (
                          <button 
                            onClick={() => handleDelete(note.id)}
                            className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quiz Generator & Taking Area */}
        <div className="lg:col-span-2">
          {!quizData && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col justify-center items-center text-center">
              {!selectedNoteForQuiz ? (
                <>
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <BrainCircuit size={32} className="text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Generate an AI Practice Test</h3>
                  <p className="text-slate-500 text-sm max-w-md">Select a lecture note from the list on the left and click "Quiz" to generate custom multiple choice questions based on the material.</p>
                </>
              ) : (
                <div className="w-full max-w-md mx-auto">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Selected Note</p>
                      <h3 className="font-semibold text-slate-800 line-clamp-1">{selectedNoteForQuiz.title}</h3>
                    </div>
                    <button onClick={() => setSelectedNoteForQuiz(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="text-left mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Questions</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="20" 
                      value={numQuestions}
                      onChange={e => setNumQuestions(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
                  >
                    {isGenerating ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</>
                    ) : (
                      <>Generate Quiz Now</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {quizData && !hasStarted && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center">
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">Quiz Ready!</h3>
              <p className="text-indigo-700 mb-8 max-w-md mx-auto">We've generated {quizData.length} questions based on "{selectedNoteForQuiz?.title}". You have {quizData.length} minutes to complete it.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setQuizData(null); setSelectedNoteForQuiz(null); }}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-6 py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={startQuiz}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Play size={20} /> Start Practice Test
                </button>
              </div>
            </div>
          )}

          {hasStarted && quizData && (
            <div className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200">
              {/* Sticky Timer */}
              {!isSubmitted && (
                <div className={`sticky top-20 z-30 flex items-center justify-center gap-2 p-3 rounded-full shadow-lg mx-auto w-fit mb-8 border ${timeLeft < 60 ? 'bg-rose-100 border-rose-200 text-rose-700 animate-pulse' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <Clock size={20} />
                  <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
                </div>
              )}

              {isSubmitted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-900 mb-2">Score: {score} / {quizData.length}</h2>
                  <p className="text-emerald-700 mb-6">({Math.round((score/quizData.length)*100)}%)</p>
                  
                  <button 
                    onClick={() => { setQuizData(null); setSelectedNoteForQuiz(null); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                  >
                    Back to Notes
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {quizData.map((q, qIdx) => (
                  <div key={qIdx} className={`bg-white rounded-xl p-6 border ${isSubmitted && currentAnswers[qIdx] !== q.answer ? 'border-rose-200' : 'border-slate-200'} shadow-sm`}>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">{qIdx + 1}. {q.question}</h3>
                    <div className="space-y-3">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = currentAnswers[qIdx] === opt;
                        const isCorrect = opt === q.answer;
                        
                        let bgClass = "bg-slate-50 hover:bg-slate-100 border-slate-200";
                        if (isSelected && !isSubmitted) bgClass = "bg-indigo-50 border-indigo-300 text-indigo-700";
                        if (isSubmitted && isCorrect) bgClass = "bg-emerald-50 border-emerald-300 text-emerald-700";
                        if (isSubmitted && isSelected && !isCorrect) bgClass = "bg-rose-50 border-rose-300 text-rose-700";

                        return (
                          <label 
                            key={oIdx} 
                            className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${bgClass}`}
                          >
                            <input 
                              type="radio" 
                              name={`q-${qIdx}`} 
                              value={opt}
                              disabled={isSubmitted}
                              checked={isSelected}
                              onChange={(e) => setCurrentAnswers(prev => ({...prev, [qIdx]: e.target.value}))}
                              className="mr-3 w-4 h-4 text-indigo-600"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {isSubmitted && currentAnswers[qIdx] !== q.answer && (
                      <p className="mt-4 text-sm text-emerald-600 font-medium">Correct Answer: {q.answer}</p>
                    )}
                  </div>
                ))}
              </div>

              {!isSubmitted && (
                <button 
                  onClick={calculateScore}
                  className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 rounded-xl transition-colors shadow-md"
                >
                  Submit Answers
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesAndMCQs;
