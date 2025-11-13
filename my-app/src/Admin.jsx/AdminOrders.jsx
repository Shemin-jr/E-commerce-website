
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
 
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/orders"),
        axios.get("http://localhost:5000/users")
      ]);

      setUsers(usersRes.data);

      
      let cleanedOrders = ordersRes.data.filter(order => {
        if (!order.items || order.items.length === 0) return false;
        const validItems = order.items.every(i => i.price && i.quantity);
        if (!validItems) return false;
        if (!order.status || order.status.trim() === "") return false;
        return true;
      });

      setOrders(cleanedOrders.reverse());
      setLoading(false);
    } catch (err) {
      setError("Failed to load orders");
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/orders/${orderId}`, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchData();
    } catch {
      setError('Failed to update order status');
    }
  };


  const getCustomerName = (order) => {
    const userMatch = users.find(u => u.id === order.userId);
    return order.userName || userMatch?.name || "Unknown User";
  };

 
  const getEmail = (order) => {
    const userMatch = users.find(u => u.id === order.userId);
    return order.userEmail || userMatch?.email || "No Email Found";
  };

  const filteredOrders = orders.filter(order =>
    filterStatus === 'all' ? true : (order.status || '').toLowerCase() === filterStatus
  );

  const calculateTotal = (items) =>
    items?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="text-center p-8 text-lg font-medium">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600 text-lg">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Order Management</h1>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-lg bg-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

  
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-medium">Order ID</th>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Total</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">#{order.id}</td>
                  <td className="p-3">
                    <div className="font-medium">{getCustomerName(order)}</div>
                    <div className="text-gray-500">{getEmail(order)}</div>
                  </td>
                  <td className="p-3 font-semibold">${calculateTotal(order.items).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg space-y-4 relative">

              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold">Order #{selectedOrder.id}</h2>

              <div className="text-sm">
                <p><strong>Customer:</strong> {getCustomerName(selectedOrder)}</p>
                <p><strong>Email:</strong> {getEmail(selectedOrder)}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <label className="block font-medium mb-1">Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="border-t pt-3 space-y-2">
                <strong>Items:</strong>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.team} ({item.size})</span>
                    <span>{item.quantity} × ${item.price}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-semibold text-lg border-t">
                  <span>Total</span>
                  <span>${calculateTotal(selectedOrder.items).toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
