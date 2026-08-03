import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { ShieldCheck, FileCheck, UploadCloud, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { analyzeThesis } from '../utils/aiService';

const ThesisChecker = () => {
  const { user } = useAuth();
  const { thesisSubmissions, addThesisSubmission, updateThesisStatus } = useDatabase();
  
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Analysis State
  const [thesisFile, setThesisFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (!user) return <div className="text-center py-20">Please login to access Premium features.</div>;

  const isStaff = user.role === 'staff' || user.role === 'admin';
  
  // For Student: Find their submission
  const mySubmission = thesisSubmissions.find(s => s.matricule === user.matricule);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) return alert('Please upload a screenshot');
    
    setIsSubmitting(true);
    setTimeout(() => {
      addThesisSubmission({
        matricule: user.matricule || 'UNKNOWN',
        studentName: user.name,
        paymentScreenshotUrl: screenshot,
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSimulateScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mocking file upload with a local data URL
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setScreenshot(e.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!thesisFile) return alert('Upload a document');
    setIsAnalyzing(true);
    try {
      const result = await analyzeThesis("Mock abstract text of the thesis goes here...");
      setAnalysisResult(result);
    } catch (error: any) {
      console.error(error);
      alert(`Error analyzing thesis: ${error.message || 'Check API connection.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Admin View
  if (isStaff) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Thesis Checker Admin</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Matricule</th>
                <th className="p-4 font-medium">Screenshot</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {thesisSubmissions.map(sub => (
                <tr key={sub.id}>
                  <td className="p-4 font-medium text-slate-900">{sub.studentName}</td>
                  <td className="p-4 text-slate-500">{sub.matricule}</td>
                  <td className="p-4">
                    <img src={sub.paymentScreenshotUrl} alt="payment" className="h-12 w-12 object-cover rounded shadow-sm" />
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      sub.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {sub.status === 'Pending' && (
                      <>
                        <button onClick={() => updateThesisStatus(sub.id, 'Approved')} className="text-emerald-600 hover:text-emerald-800"><CheckCircle size={20}/></button>
                        <button onClick={() => updateThesisStatus(sub.id, 'Rejected')} className="text-rose-600 hover:text-rose-800"><XCircle size={20}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {thesisSubmissions.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No pending payments.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Student View: Locked
  if (!mySubmission || mySubmission.status === 'Rejected') {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} />
          </div>
          <ShieldCheck size={48} className="mx-auto mb-4 text-indigo-300" />
          <h2 className="text-2xl font-bold mb-2">Premium Feature Locked</h2>
          <p className="text-indigo-200 mb-8">
            To access the AI Plagiarism & Writing Analysis tool, please pay <strong className="text-white">3,500 Frs</strong> to the number <strong className="text-white">681597837 (Name: Brandon Judmi)</strong>.
          </p>
          
          <form onSubmit={handlePaymentSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-left border border-white/20">
            <label className="block text-sm font-medium text-indigo-100 mb-2">Upload Payment Screenshot</label>
            <input 
              type="file" 
              accept="image/*" 
              required
              onChange={handleSimulateScreenshot}
              className="block w-full text-sm text-indigo-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4 cursor-pointer"
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Student View: Pending
  if (mySubmission.status === 'Pending') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 size={40} className="text-amber-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Review in Progress</h2>
        <p className="text-slate-600">
          Your payment screenshot is under review by Admin using your Matricule <strong>{user.matricule}</strong>. Please check back later.
        </p>
      </div>
    );
  }

  // Student View: Unlocked
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-full"><CheckCircle size={20} className="text-white"/></div>
          <span className="font-semibold text-emerald-800">Premium Access Unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Upload Document</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors mb-6">
              <input 
                type="file" 
                accept=".pdf,.docx,.txt"
                className="hidden" 
                id="thesis-upload"
                onChange={(e) => setThesisFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="thesis-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud size={32} className="text-indigo-400 mb-3" />
                <span className="text-sm text-slate-600 font-medium text-center">{thesisFile ? thesisFile.name : 'Drag & drop your thesis here'}</span>
              </label>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={!thesisFile || isAnalyzing}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {analysisResult ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <FileCheck className="text-indigo-600"/> Analysis Report
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Circular Progress Bars (Simplified as cards for tailwind) */}
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl font-extrabold text-rose-500 mb-2">{analysisResult.plagiarismScore}%</div>
                  <div className="text-sm font-medium text-slate-500">Plagiarism Detected</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl font-extrabold text-amber-500 mb-2">{analysisResult.aiScore}%</div>
                  <div className="text-sm font-medium text-slate-500">AI Generated Content</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Highlighted Findings</h3>
                <div className="space-y-3">
                  {analysisResult.highlights.map((h: string, i: number) => (
                    <div key={i} className="p-4 bg-rose-50/50 border-l-4 border-rose-400 rounded-r-lg text-sm text-slate-700 italic">
                      "{h}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] bg-slate-50 rounded-2xl border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
              Analysis results will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThesisChecker;
