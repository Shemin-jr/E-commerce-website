import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData(currentPage);
  }, [navigate, currentPage, filterStatus]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const ordersRes = await API.get("/orders", {
        params: { page, limit: itemsPerPage, status: filterStatus },
      });

      const { orders: rawOrders, totalPages: pages, totalOrders: total } = ordersRes.data;

      let cleanedOrders = (rawOrders || []).filter((order) => {
        if (!order.items || order.items.length === 0) return false;
        const validItems = order.items.every((i) => i.price && i.quantity);
        if (!validItems) return false;
        if (!order.status || order.status.trim() === "") return false;
        return true;
      });

      setOrders(cleanedOrders);
      setTotalPages(pages || 1);
      setTotalOrders(total || 0);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Data Error:", error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.patch(`/orders/${orderId}`, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      if (res.data) {
        const currentOrder = orders.find((o) => o._id === orderId || o.id === orderId);
        const updatedOrder = {
          ...currentOrder,
          ...res.data,
          user: res.data.user && typeof res.data.user === 'object' ? res.data.user : currentOrder?.user,
        };
        setOrders((prev) => prev.map((o) => (o._id === orderId || o.id === orderId ? updatedOrder : o)));
        setSelectedOrder(updatedOrder);
        toast.success(`Order status updated to ${newStatus}`);
      }
      fetchData();
    } catch (error) {
      console.error("Update Status Error:", error);
      toast.error("Something went wrong");
    }
  };

  const formatName = (str) => {
    if (!str) return "";
    return str.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/).filter((w) => w.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const getCustomerName = (order) => {
    const userName = formatName(order.user?.name);
    const shippingName = formatName(order.name);
    return userName || shippingName || "Guest User";
  };

  const getCustomerEmail = (order) => order.user?.email || order.email || "No Email";
  const getEmail = (order) => order.email || order.user?.email || "N/A";
  const calculateTotal = (items) => items?.reduce((total, item) => total + item.price * (item.quantity || 1), 0) || 0;

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      shipped: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      delivered: "bg-green-500/20 text-green-400 border-green-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
      "cancellation requested": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return styles[status?.toLowerCase()] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading)
    return (
      <div className="text-center p-8 text-indigo-400 font-bold animate-pulse">
        Loading Orders...
      </div>
    );

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Order Management</h1>
          <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 shadow-sm">
            <label className="text-sm font-medium text-gray-400 mr-2">Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-gray-900">All</option>
              <option value="pending" className="bg-gray-900">Ordered</option>
              <option value="processing" className="bg-gray-900">Processing</option>
              <option value="shipped" className="bg-gray-900">Shipped</option>
              <option value="delivered" className="bg-gray-900">Delivered</option>
              <option value="cancellation requested" className="bg-gray-900">Cancellation Requested</option>
              <option value="cancelled" className="bg-gray-900">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map((order) => (
                <tr key={order._id || order.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{order._id || order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-100">{getCustomerName(order)}</span>
                      <span className="text-sm text-gray-500">{getCustomerEmail(order)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">₹{calculateTotal(order.items).toFixed(0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(order.status)}`}>
                      {order.status === 'pending' ? 'Ordered' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Order Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-lg p-6 rounded-2xl shadow-2xl overflow-hidden">

              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white">Order #{selectedOrder._id || selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-white transition text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer Info</h3>
                  <div className="bg-gray-800 px-4 py-3 rounded-xl border border-gray-700">
                    <p className="text-sm font-medium text-white">{getCustomerName(selectedOrder)}</p>
                    <p className="text-sm text-gray-400">{getEmail(selectedOrder)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Order Date</h3>
                  <div className="bg-gray-800 px-4 py-3 rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-200">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {(selectedOrder.status === 'Cancellation Requested' || selectedOrder.status === 'Cancelled') && (
                  <div className="col-span-full bg-red-500/10 p-4 rounded-xl border border-red-500/30">
                    <h3 className="text-sm font-bold text-red-400 mb-2">Cancellation Request</h3>
                    <p className="text-sm text-red-300"><strong>Reason:</strong> {selectedOrder.cancelReason || "No reason provided"}</p>
                    {selectedOrder.cancelledAt && (
                      <p className="text-xs text-red-500 mt-1">Date: {new Date(selectedOrder.cancelledAt).toLocaleString()}</p>
                    )}
                  </div>
                )}

                <div className="col-span-full">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Update Status</h3>
                  <select
                    value={selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1).toLowerCase()}
                    onChange={(e) => updateOrderStatus(selectedOrder._id || selectedOrder.id, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-sm rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Pending">Ordered</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancellation Requested">Cancellation Requested</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Order Items</h3>
                <div className="border border-gray-700 rounded-xl overflow-hidden">
                  <ul className="divide-y divide-gray-800 max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((item, i) => (
                      <li key={i} className="px-4 py-3 flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 transition">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || item.product?.image || "https://via.placeholder.com/40"}
                            alt={item.team}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-700"
                          />
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-700 text-xs font-medium text-gray-300">
                            {item.size}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-100">{item.team}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-200">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-t border-gray-700">
                    <span className="text-sm font-medium text-gray-300">Total</span>
                    <span className="text-lg font-bold text-white">₹{calculateTotal(selectedOrder.items).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
