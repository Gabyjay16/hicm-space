import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Settings, Play, CheckCircle2, Clock, BrainCircuit } from 'lucide-react';
import { generateQuiz } from '../utils/aiService';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

const QuizGenerator = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  // Generator State
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Quiz State
  const [quizData, setQuizData] = useState<Question[] | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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
    if (!file) return alert('Please select a file first.');
    setIsGenerating(true);
    try {
      // In a real app we'd extract text from the file here.
      // For mock purposes, we just pass some dummy text to the AI.
      const mockTextContext = `This is a lecture on Software Engineering covering Agile methodologies, Scrum, React development, and Database design.`;
      
      const generatedQuestions = await generateQuiz(mockTextContext, numQuestions);
      
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuizData(generatedQuestions);
        // Reset state for new quiz
        setHasStarted(false);
        setIsSubmitted(false);
        setCurrentAnswers({});
      } else {
        alert("Failed to parse AI response. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert('Error generating quiz. Check API key or connection.');
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
    return <div className="text-center py-20 text-slate-500">Please login to access the Quiz Generator.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <BrainCircuit size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Quiz Generator</h1>
          <p className="text-slate-500">Transform lecture notes into interactive practice tests.</p>
        </div>
      </div>

      {isStaff && !hasStarted && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-slate-400" />
            Staff Control Panel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Lecture Notes (PDF/DOCX)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt"
                  className="hidden" 
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <FileText size={32} className="text-slate-400 mb-3" />
                  <span className="text-sm text-slate-600 font-medium">{file ? file.name : 'Click to browse files'}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Number of Questions</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={numQuestions}
                onChange={e => setNumQuestions(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isGenerating ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</>
                ) : (
                  <>Generate Quiz</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {quizData && !hasStarted && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Quiz Ready!</h3>
          <p className="text-indigo-700 mb-6">Generated {quizData.length} questions based on the uploaded material.</p>
          <button 
            onClick={startQuiz}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-full transition-all hover:scale-105 shadow-md flex items-center gap-2 mx-auto"
          >
            <Play size={20} /> Start Practice Test
          </button>
        </div>
      )}

      {hasStarted && quizData && (
        <div className="relative">
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
              <p className="text-emerald-700">({Math.round((score/quizData.length)*100)}%)</p>
            </div>
          )}

          <div className="space-y-6">
            {quizData.map((q, qIdx) => (
              <div key={qIdx} className={`bg-white rounded-2xl p-6 border ${isSubmitted && currentAnswers[qIdx] !== q.answer ? 'border-rose-200' : 'border-slate-200'} shadow-sm`}>
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
  );
};

export default QuizGenerator;
