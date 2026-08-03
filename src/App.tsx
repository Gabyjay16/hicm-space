import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';

// Layout
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import NotesAndMCQs from './pages/NotesAndMCQs';
import ThesisChecker from './pages/ThesisChecker';
import ComplaintsDesk from './pages/ComplaintsDesk';
import Announcements from './pages/Announcements';
import Voting from './pages/Voting';
import LostAndFound from './pages/LostAndFound';
import ChatForums from './pages/ChatForums';
import AdminDashboard from './pages/AdminDashboard';

import AuthScreen from './pages/AuthScreen';
import { useAuth } from './context/AuthContext';

const MainApp = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/academics/quiz" element={<NotesAndMCQs />} />
          <Route path="/academics/thesis" element={<ThesisChecker />} />
          <Route path="/services/complaints" element={<ComplaintsDesk />} />
          <Route path="/campus/announcements" element={<Announcements />} />
          <Route path="/campus/voting" element={<Voting />} />
          <Route path="/campus/lost-and-found" element={<LostAndFound />} />
          <Route path="/campus/forums" element={<ChatForums />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DatabaseProvider>
          <MainApp />
        </DatabaseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
