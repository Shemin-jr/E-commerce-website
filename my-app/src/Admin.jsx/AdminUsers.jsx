import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      await axios.patch(`http://localhost:5000/users/${userId}`, {
        blocked: !currentStatus
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
      
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full p-3 border rounded-lg pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3">🔍</span>
        </div>

       
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleBlockUser(user.id, user.blocked)}
                      className={user.blocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}
                    >
                      {user.blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}  
            </tbody>
          </table>
        </div>
      </div>

   
     {selectedUser && (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg border w-96 z-50">
    <h2 className="text-xl font-semibold mb-4">User Details</h2>

    <p><strong>Name:</strong> {selectedUser.name}</p>
    <p><strong>Email:</strong> {selectedUser.email}</p>

    {selectedUser.number && (
      <p><strong>Phone:</strong> {selectedUser.number}</p>
    )}

    <p>
      <strong>Status:</strong>{" "}
      <span className={selectedUser.blocked ? "text-red-600" : "text-green-600"}>
        {selectedUser.blocked ? "Blocked" : "Active"}
      </span>
    </p>

    {selectedUser.createdAt && (
      <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
    )}

    <button
      onClick={() => setSelectedUser(null)}
      className="mt-5 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
    >
      Close
    </button>
  </div>
)}

    </div>
  );
}
