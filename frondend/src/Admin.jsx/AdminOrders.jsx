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
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
      delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      "cancellation requested": "bg-orange-100 text-orange-700 border-orange-200",
    };
    return styles[status?.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 text-blue-600 font-black animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <span className="uppercase tracking-[0.3em] text-xs">Syncing Live Orders...</span>
      </div>
    );

  return (
    <div className="p-0">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col">
             <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">0rders</h1>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1"></p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 shadow-inner flex items-center gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">View Category:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-900 font-bold uppercase text-[10px] tracking-widest focus:outline-none cursor-pointer"
            >
              <option value="all">Every Order</option>
              <option value="pending">New Orders</option>
              <option value="processing">In Process</option>
              <option value="shipped">On Route</option>
              <option value="delivered">Completed</option>
              <option value="cancellation requested">Requests</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table Workspace */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client Profile</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenue</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current State</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => (
                <tr key={order._id || order.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                  <td className="px-8 py-6 whitespace-nowrap text-xs font-mono font-bold text-slate-400">#{ (order._id || order.id).slice(-8).toUpperCase() }</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">{getCustomerName(order)}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{getCustomerEmail(order)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                     <span className="text-sm font-black italic text-slate-900">₹{calculateTotal(order.items).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-xl border-2 transition-all ${getStatusStyle(order.status)}`}>
                      {order.status === 'pending' ? 'New' : order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-100 transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Global Modal Overlay */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-6">
            <div className="bg-white border border-slate-100 w-full max-w-2xl p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in duration-300">

              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Detailed Record</span>
                  <p className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Order #{selectedOrder._id || selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all hover:rotate-90"
                >
                  <span className="text-2xl font-black">✕</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Client Logistics</h3>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-md font-black italic uppercase tracking-tighter text-slate-900">{getCustomerName(selectedOrder)}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{getEmail(selectedOrder)}</p>
                    <p className="text-xs font-medium text-slate-600 mt-3 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                       Ordered: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status Update</h3>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <select
                      value={selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1).toLowerCase()}
                      onChange={(e) => updateOrderStatus(selectedOrder._id || selectedOrder.id, e.target.value)}
                      className="w-full bg-white px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 outline-none border-2 border-slate-100 focus:border-blue-600 transition-all appearance-none cursor-pointer"
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

                {/* Conflict/Cancellation Alert */}
                {(selectedOrder.status === 'Cancellation Requested' || selectedOrder.status === 'Cancelled') && (
                  <div className="col-span-full bg-red-50 p-6 rounded-[2rem] border-2 border-red-100/50">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 mb-2">Cancellation Alert</h3>
                    <p className="text-sm font-bold text-slate-700 italic">"{selectedOrder.cancelReason || "System priority cancellation"}"</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Inventory Items</h3>
                <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                  <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((item, i) => (
                      <li key={i} className="px-6 py-4 flex justify-between items-center hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image || item.product?.image || "https://via.placeholder.com/40"}
                            alt={item.team}
                            className="h-16 w-16 rounded-xl object-contain bg-white border border-slate-100 p-1"
                          />
                          <div>
                            <p className="text-sm font-black italic uppercase tracking-tighter text-slate-900">{item.team}</p>
                            <div className="flex gap-3 items-center mt-1">
                               <span className="text-[10px] font-black border border-slate-200 px-2 py-0.5 rounded text-blue-600">SIZE {item.size}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-black italic text-slate-900">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Gross Total</span>
                    <span className="text-2xl font-black italic">₹{calculateTotal(selectedOrder.items).toLocaleString()}</span>
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
