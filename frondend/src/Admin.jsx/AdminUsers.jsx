import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(7);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [navigate, currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/auth/users?page=${currentPage}&limit=${limit}&search=${searchTerm}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      await API.patch(`/auth/users/${userId}`, { blocked: !currentStatus });
      toast.success(currentStatus ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error("Something went wrong");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/auth/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error("Something went wrong");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 text-blue-600 font-black animate-pulse">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <span className="uppercase tracking-[0.3em] text-xs">Accessing User Database...</span>
      </div>
    );

  return (
    <div className="p-0">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col">
             <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Client Directory</h1>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Global Access Management</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <input
              type="text"
              placeholder="Search by profile or email..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold uppercase text-[10px] tracking-widest shadow-inner"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">🔍</span>
          </div>
        </div>

        {/* Registry Workspace */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Identity</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Level</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 font-black italic shadow-sm group-hover:scale-110 transition-transform">
                          {user.name.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-slate-400 uppercase tracking-widest">{user.email}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full border-2 
                      ${user.blocked
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {user.blocked ? 'Restricted' : 'Authenticated'}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-medium space-x-6">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-slate-900 hover:text-blue-600 font-black italic uppercase text-[10px] tracking-widest transition-all"
                    >
                      view
                    </button>
                    <button
                      onClick={() => handleBlockUser(user._id || user.id, user.blocked)}
                      className={`font-black italic uppercase text-[10px] tracking-widest transition-all ${user.blocked
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-amber-500 hover:text-amber-600'}`}
                    >
                      {user.blocked ? 'Restore' : 'block'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id || user.id)}
                      className="text-red-500 hover:text-red-700 font-black italic uppercase text-[10px] tracking-widest transition-all"
                    >
                     Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Registry Stats */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] w-full max-w-md animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Detailed Record</span>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">User Profile</h2>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">✕</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Display Name', value: selectedUser.name },
                { label: 'Email Identity', value: selectedUser.email },
                ...(selectedUser.number ? [{ label: 'Contact Sequence', value: selectedUser.number }] : []),
                { label: 'Access Status', value: selectedUser.blocked ? 'SUSPENDED' : 'AUTHORIZED', colored: true, blocked: selectedUser.blocked },
                ...(selectedUser.createdAt ? [{ label: 'Record Created', value: new Date(selectedUser.createdAt).toLocaleDateString() }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
                  <span className={`text-xs font-black italic uppercase tracking-tighter ${row.colored ? (row.blocked ? 'text-red-600' : 'text-emerald-600') : 'text-slate-900'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-10 w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black italic uppercase tracking-widest transition-all duration-300 shadow-xl shadow-slate-100 hover:shadow-blue-100"
            >
              Dismiss Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
