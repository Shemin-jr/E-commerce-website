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
      toast.error(" something went wrong ");
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      await API.patch(`/auth/users/${userId}`, {
        blocked: !currentStatus 
      });
      toast.success(currentStatus ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error(" something went wrong ");
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
        toast.error(" something went wrong ");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  if (loading) return <div className="text-center p-8 text-blue-600 font-bold animate-pulse">Loading Users...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-gray-800">User Management</h1>
        <div className="relative mb-8 group">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full p-4 bg-white border border-gray-300 rounded-2xl pl-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-md"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <span className="absolute left-4 top-4 text-xl text-gray-400 opacity-50 group-focus-within:opacity-100 transition-opacity">🔍</span>
        </div>


        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                      ${user.blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleBlockUser(user._id || user.id, user.blocked)}
                      className={user.blocked ? 'text-green-600 hover:text-green-800 transition' : 'text-orange-500 hover:text-orange-700 transition'}
                    >
                      {user.blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id || user.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>


      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-800 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-800">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold text-gray-800">{selectedUser.email}</span>
              </div>
              {selectedUser.number && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-semibold text-gray-800">{selectedUser.number}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold ${selectedUser.blocked ? "text-red-600" : "text-green-600"}`}>
                  {selectedUser.blocked ? "Blocked" : "Active"}
                </span>
              </div>
              {selectedUser.createdAt && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-semibold text-gray-800">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl transition-all duration-300 font-bold shadow-md"
            >

              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
