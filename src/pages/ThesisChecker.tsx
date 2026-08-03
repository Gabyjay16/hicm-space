import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileSearch, Upload, CheckCircle, X, Loader2 } from 'lucide-react';

const ThesisChecker = () => {
  const { user } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    plagiarismScore: number;
    aiScore: number;
    highlights: string[];
  } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please upload a thesis document (PDF/Word/TXT)');

    setIsChecking(true);
    setResult(null);
    try {
      // In a real app we would use Cloudflare Queues + AI for background processing
      // For now, we simulate sending the file to our AI endpoints by reading the file 
      // or passing a mock abstract if file parsing isn't available
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/ai/thesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: "Mock abstract text of the thesis goes here..."
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        alert('Failed to analyze document. Please try again.');
      }
    } catch (e: any) {
      alert(e.message || 'Network error');
    } finally {
      setIsChecking(false);
    }
  };

  if (!user) {
    return <div className="text-center py-20 text-slate-500">Please login to access the Thesis Checker.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <FileSearch size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Thesis & Plagiarism Checker</h1>
          <p className="text-slate-500">Upload your research paper for AI-driven structure, grammar, and originality analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Column */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Submit Document</h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}>
              {!file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload size={28} />
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">Click to upload or drag and drop</p>
                    <p className="text-slate-500 text-sm mt-1">PDF, DOCX, or TXT (Max 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="thesis-upload"
                  />
                  <label htmlFor="thesis-upload" className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors font-medium text-sm">
                    Browse Files
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium break-all">{file.name}</p>
                    <p className="text-slate-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    <X size={16} /> Remove File
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={!file || isChecking}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {isChecking ? (
                <><Loader2 size={20} className="animate-spin" /> Analyzing Document...</>
              ) : (
                <>Run AI Analysis</>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
          {!result && !isChecking ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10 opacity-60">
              <FileSearch size={48} className="text-slate-400" />
              <div>
                <p className="text-lg font-medium text-slate-700">Awaiting Document</p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">Upload a file on the left to view detailed AI analysis, structure grading, and plagiarism risk.</p>
              </div>
            </div>
          ) : isChecking ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileSearch size={24} className="text-blue-600 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">AI is reviewing your work</h3>
                <p className="text-slate-500 mt-2">Checking grammar, structure, and running cross-references for originality...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-semibold text-slate-800">Analysis Results</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Plagiarism Score</p>
                  <div className="flex items-end gap-2 text-rose-500">
                    <span className="text-4xl font-bold">{result.plagiarismScore}</span>
                    <span className="text-xl font-bold mb-1">%</span>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">AI Generated</p>
                  <div className="flex items-end gap-2 text-amber-500">
                    <span className="text-4xl font-bold">{result.aiScore}</span>
                    <span className="text-xl font-bold mb-1">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Suspicious Highlighted Findings</h3>
                <ul className="space-y-3">
                  {result.highlights && result.highlights.map((highlight: string, idx: number) => (
                    <li key={idx} className="p-4 bg-rose-50/50 border-l-4 border-rose-400 rounded-r-lg text-sm text-slate-700 italic">
                      "{highlight}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default ThesisChecker;
