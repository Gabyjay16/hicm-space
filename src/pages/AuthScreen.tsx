import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isStaffReg, setIsStaffReg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login Form State
  const [loginMatricule, setLoginMatricule] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regMatricule, setRegMatricule] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [staffCode, setStaffCode] = useState('');
  
  // Registration triggers Staff Mode if a valid-looking staff code is entered in the Matricule field on the Reg page
  const handleRegMatriculeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegMatricule(val);
    
    // Simple heuristic to detect a staff code: e.g. starts with "STAFF-" or similar
    // The requirement says: "Entering a valid code in the Matricule field on the registration page should securely open Staff Registration without displaying a staff hint."
    if (val.startsWith('SC-') && val.length > 5) {
      setIsStaffReg(true);
      setStaffCode(val);
    } else {
      setIsStaffReg(false);
      setStaffCode('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule: loginMatricule, password: loginPassword, rememberMe })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // If staff, we don't map Name to Matricule. We just use the matricule they provided or generate one?
    // Wait, the user typed the staff code in the Matricule field to trigger this mode.
    // They don't have a real matricule. Let's use the staff code as their matricule, or let them pick one.
    // The instructions say "Entering a valid code in the Matricule field on the registration page should securely open Staff Registration without displaying a staff hint."
    // So the staff code IS the matricule they typed.
    const finalMatricule = regMatricule;
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          matricule: finalMatricule,
          department: regDepartment,
          phone: regPhone,
          password: regPassword,
          confirmPassword: regConfirm,
          staffCode: staffCode
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setIsLogin(true);
      setLoginMatricule(finalMatricule);
      setRegPassword('');
      setRegConfirm('');
      setError('Registration successful! Please login.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded shadow-sm border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">HICM Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? 'Sign in to access your dashboard' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Matricule</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                value={loginMatricule}
                onChange={e => setLoginMatricule(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="mr-2 rounded text-accent focus:ring-accent"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm text-gray-600">Remember Me</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white p-2 rounded hover:bg-primary-light transition disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Please wait a little...</> : 'Login'}
            </button>
            <div className="text-center mt-4 text-sm text-gray-600">
              <button type="button" onClick={() => setIsLogin(false)} className="text-accent hover:underline">
                Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Matricule / Staff Code</label>
              <input
                type="text"
                required
                placeholder={isStaffReg ? '' : 'e.g. Uba23C001'}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                value={regMatricule}
                onChange={handleRegMatriculeChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                value={regName}
                onChange={e => setRegName(e.target.value)}
              />
            </div>
            
            {!isStaffReg && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                <select
                  required
                  className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent bg-white"
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value)}
                >
                  <option value="">Select Department</option>
                  <option value="Accounting and Finance">Accounting and Finance</option>
                  <option value="Money and Banking">Money and Banking</option>
                  <option value="Management">Management</option>
                  <option value="ORGS">ORGS</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Insurance and Security">Insurance and Security</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                value={regConfirm}
                onChange={e => setRegConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white p-2 rounded hover:bg-accent-light transition disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Please wait a little...</> : 'Register'}
            </button>
            <div className="text-center mt-4 text-sm text-gray-600">
              <button type="button" onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
