import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Key, Activity, Settings, MessageSquare, BookOpen, AlertCircle, Volume2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [users, setUsers] = useState<any[]>([]);
  const [staffCodes, setStaffCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'staff_codes') fetchStaffCodes();
    }
  }, [activeTab, user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchStaffCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff-codes');
      const data = await res.json();
      if (data.success) setStaffCodes(data.codes);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const generateStaffCode = async () => {
    try {
      const res = await fetch('/api/admin/staff-codes', { method: 'POST' });
      const data = await res.json();
      if (data.success) fetchStaffCodes();
    } catch (e) { console.error(e); }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Access Denied. Admin Portal only.
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'staff_codes', name: 'Staff Codes', icon: Key },
    { id: 'permissions', name: 'Permissions', icon: Shield },
    { id: 'audit', name: 'Audit Log', icon: Settings },
    // Other tabs will be implemented in subsequent stages
    { id: 'announcements', name: 'Announcements', icon: Volume2 },
    { id: 'forums', name: 'Forums', icon: MessageSquare },
    { id: 'notes', name: 'Notes & MCQs', icon: BookOpen },
    { id: 'complaints', name: 'Complaints', icon: AlertCircle },
  ];

  return (
    <div className="flex h-full flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-border p-4">
        <h2 className="text-xl font-bold text-primary mb-6 pl-2">Admin Portal</h2>
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <tab.icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Overview</h3>
            <p className="text-gray-600">Welcome to the HICM Admin Portal. Select a module from the sidebar to manage.</p>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">User Management</h3>
            <div className="bg-white p-4 border border-border rounded shadow-sm overflow-x-auto">
              {loading ? <p>Loading...</p> : (
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Matricule</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-border">
                        <td className="px-4 py-2">{u.name}</td>
                        <td className="px-4 py-2">{u.matricule}</td>
                        <td className="px-4 py-2 capitalize">{u.role}</td>
                        <td className="px-4 py-2">{u.department || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'staff_codes' && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Staff Codes</h3>
            <div className="bg-white p-4 border border-border rounded shadow-sm">
              <button onClick={generateStaffCode} className="bg-primary text-white px-4 py-2 rounded text-sm mb-4 hover:bg-primary-light">
                Generate New Code
              </button>
              {loading ? <p>Loading...</p> : (
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-4 py-2">Code</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffCodes.map(code => (
                      <tr key={code.code} className="border-b border-border">
                        <td className="px-4 py-2 font-mono">{code.code}</td>
                        <td className="px-4 py-2">
                          {code.used ? <span className="text-red-500">Used</span> : <span className="text-green-500">Available</span>}
                        </td>
                        <td className="px-4 py-2">{new Date(code.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Permissions</h3>
            <div className="bg-white p-4 border border-border rounded shadow-sm">
              <p className="text-sm text-gray-500">Manage granular permissions (e.g. Announcement publishing) here.</p>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Audit Log</h3>
            <div className="bg-white p-4 border border-border rounded shadow-sm">
              <p className="text-sm text-gray-500">System-wide audit trail will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
