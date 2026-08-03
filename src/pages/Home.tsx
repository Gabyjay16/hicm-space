import { Link } from 'react-router-dom';
import { GraduationCap, LifeBuoy, MessageSquare } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Welcome to the future of campus life
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Your Digital Campus, <br className="hidden sm:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">All in One Place.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Access course materials, generate AI quizzes, submit complaints, and connect with your peers seamlessly on HICM SPACE.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/academics/quiz" className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <GraduationCap className="text-indigo-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Quiz Generator</h3>
          <p className="text-slate-500 text-sm">Upload notes and let AI generate practice MCQs for your upcoming exams.</p>
        </Link>
        
        <Link to="/services/complaints" className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LifeBuoy className="text-rose-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Complaints Desk</h3>
          <p className="text-slate-500 text-sm">Submit and track official complaints confidentially with real-time status updates.</p>
        </Link>

        <Link to="/campus/forums" className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="text-emerald-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Campus Forums</h3>
          <p className="text-slate-500 text-sm">Join level-specific chat rooms and connect with other students.</p>
        </Link>
      </section>
    </div>
  );
};

export default Home;
