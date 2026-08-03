import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ChevronDown, GraduationCap, Users, LifeBuoy, ToggleLeft, ToggleRight, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, logout, toggleMockRole } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) setActiveDropdown(null);
    else setActiveDropdown(name);
  };

  const navLinks = [
    {
      name: 'Academics',
      icon: <GraduationCap size={18} className="mr-1" />,
      items: [
        { label: 'Notes & MCQs', path: '/academics/quiz' },
        { label: 'Thesis Checker (Premium)', path: '/academics/thesis' }
      ]
    },
    {
      name: 'Student Services',
      icon: <LifeBuoy size={18} className="mr-1" />,
      items: [
        { label: 'Complaints Desk', path: '/services/complaints' },
      ]
    },
    {
      name: 'Campus Life',
      icon: <Users size={18} className="mr-1" />,
      items: [
        { label: 'Announcements', path: '/campus/announcements' },
        { label: 'Student Voting', path: '/campus/voting' },
        { label: 'Lost & Found', path: '/campus/lost-and-found' },
        { label: 'Chat Forums', path: '/campus/forums' }
      ]
    }
  ];

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">HICM <span className="text-indigo-600">SPACE</span></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  <button 
                    onClick={() => toggleDropdown(link.name)}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {link.icon}
                    {link.name}
                    <ChevronDown size={14} className="ml-1 opacity-50" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 transition-all origin-top-left ${activeDropdown === link.name ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                    {link.items.map(item => (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        onClick={() => setActiveDropdown(null)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* User Area */}
            <div className="flex items-center gap-4">
              {!user ? (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Login / Register
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Role Toggle for Testing */}
                  <button 
                    onClick={toggleMockRole}
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors"
                    title="Toggle Role (Student <-> Staff)"
                  >
                    {user.role === 'student' ? <ToggleLeft size={16} className="text-indigo-500" /> : <ToggleRight size={16} className="text-emerald-500" />}
                    <span>{user.role === 'student' ? 'Student View' : 'Staff View'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-slate-900 leading-none">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.role === 'student' ? user.matricule : user.position}</p>
                    </div>
                  </div>
                  <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
