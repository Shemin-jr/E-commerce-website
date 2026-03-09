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
      <div className="text-center p-8 text-indigo-400 font-bold animate-pulse">
        Loading Users...
      </div>
    );

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">User Management</h1>

        {/* Search */}
        <div className="relative mb-8 group">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl pl-12 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 shadow-md"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <span className="absolute left-4 top-4 text-xl text-gray-500 group-focus-within:text-indigo-400 transition-colors">🔍</span>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-100">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                      ${user.blocked
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleBlockUser(user._id || user.id, user.blocked)}
                      className={user.blocked
                        ? 'text-green-400 hover:text-green-300 transition'
                        : 'text-amber-400 hover:text-amber-300 transition'}
                    >
                      {user.blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id || user.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-800/40 border-t border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-white">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                    ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white text-xl transition">✕</button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Name', value: selectedUser.name },
                { label: 'Email', value: selectedUser.email },
                ...(selectedUser.number ? [{ label: 'Phone', value: selectedUser.number }] : []),
                { label: 'Status', value: selectedUser.blocked ? 'Blocked' : 'Active', colored: true, blocked: selectedUser.blocked },
                ...(selectedUser.createdAt ? [{ label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString() }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center p-4 bg-gray-800 rounded-2xl border border-gray-700">
                  <span className="text-gray-400">{row.label}</span>
                  <span className={`font-semibold ${row.colored ? (row.blocked ? 'text-red-400' : 'text-green-400') : 'text-white'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl transition-all duration-300 font-bold shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
