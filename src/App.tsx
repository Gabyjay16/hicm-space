import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';

// Layout
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import QuizGenerator from './pages/QuizGenerator';
import ThesisChecker from './pages/ThesisChecker';
import ComplaintsDesk from './pages/ComplaintsDesk';
import Announcements from './pages/Announcements';
import Voting from './pages/Voting';
import LostAndFound from './pages/LostAndFound';
import ChatForums from './pages/ChatForums';

function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/academics/quiz" element={<QuizGenerator />} />
                <Route path="/academics/thesis" element={<ThesisChecker />} />
                <Route path="/services/complaints" element={<ComplaintsDesk />} />
                <Route path="/campus/announcements" element={<Announcements />} />
                <Route path="/campus/voting" element={<Voting />} />
                <Route path="/campus/lost-and-found" element={<LostAndFound />} />
                <Route path="/campus/forums" element={<ChatForums />} />
              </Routes>
            </main>
          </div>
        </Router>
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;
