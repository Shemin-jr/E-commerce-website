import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
        API.get("/orders"),
        API.get("/auth/users")
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
    } catch (error) {
      console.error("Fetch Data Error:", error);
      toast.error(" something went wrong ");
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.patch(`/orders/${orderId}`, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Update local state so UI reflects it immediately
      if (res.data) {
        // Merge the new data with the old data to preserve populated fields like 'user'
        // if the API returns an unpopulated object.
        const currentOrder = orders.find(o => (o._id === orderId || o.id === orderId));
        const updatedOrder = {
          ...currentOrder,
          ...res.data,
          // Ensure we keep the populated user object if the response only sends an ID or nothing
          user: (res.data.user && typeof res.data.user === 'object') ? res.data.user : currentOrder?.user
        };

        setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId) ? updatedOrder : o));
        setSelectedOrder(updatedOrder);
        toast.success(`Order status updated to ${newStatus}`);
      }

      fetchData(); // Sync everything
    } catch (error) {
      console.error("Update Status Error:", error);
      toast.error(" something went wrong ");
    }
  };


  const formatName = (str) => {
    if (!str) return "";
    // Strictly keep only letters and spaces, remove numbers and symbols
    const cleanStr = str.replace(/[^a-zA-Z\s]/g, "");
    return cleanStr
      .trim()
      .split(/\s+/) // Handle multiple spaces
      .filter(w => w.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCustomerName = (order) => {
    // Show the Registered User's name as the primary identity
    const userName = formatName(order.user?.name);
    const shippingName = formatName(order.name);

    if (userName) return userName;
    return shippingName || "Guest User";
  };

  const getCustomerEmail = (order) => {
    // Show the Registered User's email as the primary contact
    return order.user?.email || order.email || "No Email Provided";
  };



  const getEmail = (order) => {
    // Show the specific email used at checkout for this order
    return order.email || order.user?.email || "N/A";
  };

  const filteredOrders = orders.filter(order =>
    filterStatus === 'all' ? true : (order.status || '').toLowerCase() === filterStatus.toLowerCase()
  );

  const calculateTotal = (items) =>
    items?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      "cancellation requested": "bg-orange-100 text-orange-800"
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="text-center p-8 text-blue-400 font-bold animate-pulse">Loading Orders...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Order Management</h1>
          <div className="bg-white border border-gray-300 rounded px-3 py-1 shadow-sm">
            <label className="text-sm font-medium text-gray-700 mr-2">Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="pending">ordered</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancellation requested">Cancellation Requested</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>


        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{order._id || order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {getCustomerName(order)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getCustomerEmail(order)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{calculateTotal(order.items).toFixed(0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {(order.status === 'pending' ? 'Ordered' : order.status)}
                    </span>
                  </td>
                  <td className="p-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-lg p-5 rounded-lg shadow-xl overflow-hidden">

              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Order Details #{selectedOrder._id || selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-red-500 transition-colors text-2xl"
                >
                  <span className="sr-only">Close</span>
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Customer Info</h3>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{getCustomerName(selectedOrder)}</p>
                    <p className="text-sm text-gray-500">{getEmail(selectedOrder)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Order Date</h3>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <p className="text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedOrder.status === 'Cancellation Requested' || selectedOrder.status === 'Cancelled' ? (
                  <div className="col-span-full bg-red-50 p-4 rounded-md border border-red-200">
                    <h3 className="text-sm font-bold text-red-800 mb-2">Cancellation Request</h3>
                    <p className="text-sm text-red-700"><strong>Reason:</strong> {selectedOrder.cancelReason || "No reason provided"}</p>
                    {selectedOrder.cancelledAt && (
                      <p className="text-xs text-red-500 mt-1">Request Date: {new Date(selectedOrder.cancelledAt).toLocaleString()}</p>
                    )}
                  </div>
                ) : null}

                <div className="col-span-full">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Update Status</h3>
                  <select
                    value={selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1).toLowerCase()}
                    onChange={(e) => updateOrderStatus(selectedOrder._id || selectedOrder.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white shadow-sm"
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
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Order Items</h3>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <ul className="divide-y divide-gray-200 search-results max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((item, i) => (
                      <li key={i} className="px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center">
                          <img
                            src={item.image || item.product?.image || "https://via.placeholder.com/40"}
                            alt={item.team}
                            className="h-14 w-14 rounded-md object-cover mr-3 border border-gray-200"
                          />
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium text-gray-600 mr-3">
                            {item.size}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.team}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{calculateTotal(selectedOrder.items).toFixed(0)}</span>
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
