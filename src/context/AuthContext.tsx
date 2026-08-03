import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'student' | 'staff' | 'admin' | null;

interface User {
  name: string;
  role: Role;
  matricule?: string; // Student only
  position?: string; // Staff only
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  toggleMockRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hicm_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('hicm_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hicm_auth_user');
    }
  }, [user]);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  const toggleMockRole = () => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return prev;
      if (prev.role === 'student') {
        return { ...prev, role: 'staff', position: 'Lecturer', matricule: undefined };
      } else {
        return { ...prev, role: 'student', matricule: 'HICM1234', position: undefined };
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, toggleMockRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
