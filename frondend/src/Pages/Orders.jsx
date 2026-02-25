
// import React, { useEffect, useState } from "react";
// import API from "../api/api";
// import { toast } from "react-toastify";





// function Orders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);


//   useEffect(() => {
//     const rawUser = localStorage.getItem("currentUser") || localStorage.getItem("user");
//     const loggedInUser = rawUser ? JSON.parse(rawUser) : null;

//     if (loggedInUser) {
//       const token = localStorage.getItem("token");
//       if (token && !loggedInUser.token) {
//         loggedInUser.token = token;
//       }
//     }

//     if (!loggedInUser) {
//       setOrders([]);
//       setLoading(false);
//       return;
//     }

//     const fetchOrders = async () => {
//       try {
//         const userId = loggedInUser._id || loggedInUser.id;
//         const res = await API.get(
//           `/orders/user?userId=${userId}`
//         );

//         setOrders(res.data);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         toast.error(" something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);


//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         Loading your orders...
//       </div>
//     );
//   }


//   if (!orders || orders.length === 0) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
//         <h2 className="text-2xl font-bold mb-3">No Orders Yet 🛍️</h2>
//         <a
//           href="/products"
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
//         >
//           Start Shopping
//         </a>
//       </div>
//     );
//   }


//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16">
//       <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
//         My Orders
//       </h1>

//       <div className="space-y-8 max-w-4xl mx-auto">
//         {orders.map((order) => (
//           <div
//             key={order._id || order.id}
//             className="bg-white rounded-xl shadow-md p-6 border border-gray-200 transition hover:shadow-lg"
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Order #{order._id || order.id}
//               </h2>
//               <span className="text-gray-500 text-sm">
//                 {order.createdAt
//                   ? new Date(order.createdAt).toLocaleString()
//                   : "Unknown Date"}
//               </span>
//             </div>

//             <div className="divide-y divide-gray-200">
//               {order.items && order.items.length > 0 ? (
//                 order.items.map((item, index) => (
//                   <div
//                     key={index}
//                     className="flex justify-between items-center py-3"
//                   >
//                     <div className="flex items-center gap-4">
//                       <img
//                         src={
//                           item.image ||
//                           item.product?.image ||
//                           item.img ||
//                           "https://via.placeholder.com/80?text=No+Image"
//                         }
//                         alt={item.name || item.team || "Product"}
//                         className="w-16 h-16 rounded-md border object-contain bg-gray-50"
//                       />
//                       <div>
//                         <h3 className="font-medium">
//                           {item.team || item.name}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Size: {item.size || "N/A"} | Qty:{" "}
//                           {item.quantity || 1}
//                         </p>
//                       </div>
//                     </div>
//                     <p className="font-semibold text-gray-800">
//                       ₹
//                       {item.price && item.quantity
//                         ? (item.price * item.quantity).toFixed(2)
//                         : "0.00"}
//                     </p>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500 py-4 text-center">
//                   No items found in this order.
//                 </p>
//               )}
//             </div>

//             <div className="flex justify-between items-center mt-4 text-sm">
//               <div className="text-gray-600">
//                 Payment:{" "}
//                 <span className="font-semibold text-gray-800">
//                   {order.paymentMethod || order.payment || "N/A"}
//                 </span>
//               </div>
//               <div className="font-bold text-green-600 text-base">
//                 Total: ₹{order.total ? order.total.toFixed(2) : "0.00"}
//               </div>
//               <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
//                 order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
//                   'bg-blue-100 text-blue-600'
//                 }`}>
//                 {order.status === 'Pending' ? 'Ordered' :
//                   order.status === 'Shipped' ? 'Shipped' :
//                     order.status}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
import React, { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [reason, setReason] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/my");
      setOrders(res.data);
    } catch (error) {
      console.error("Fetch orders error:", error);
      const msg = error.response?.data?.message || "Failed to load orders";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async () => {
    if (!reason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    try {
      const res = await API.put(`/orders/${selectedOrderId}/cancel`, { reason });
      toast.success(res.data.message);
      setShowModal(false);
      setReason("");
      setSelectedOrderId(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Delivered": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "Cancellation Requested": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <ClockIcon className="w-4 h-4 mr-1" />;
      case "Processing": return <ShoppingBagIcon className="w-4 h-4 mr-1" />;
      case "Shipped": return <TruckIcon className="w-4 h-4 mr-1" />;
      case "Delivered": return <CheckCircleIcon className="w-4 h-4 mr-1" />;
      case "Cancelled":
      case "Cancellation Requested": return <XCircleIcon className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Orders</h1>
          <p className="mt-2 text-lg text-gray-600">Track, return, or buy things again.</p>
        </header>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">No orders yet</h3>
            <p className="mt-2 text-gray-500">Go find the product you like.</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-500">
                    <div>
                      <span className="block font-medium text-gray-900">Order ID</span>
                      <span className="font-mono text-gray-600">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-900">Date Placed</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-900">Total Amount</span>
                      <span className="font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-6">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={item.image || item.product?.image || "https://via.placeholder.com/100"}
                            alt={item.team || item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-left">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {item.team || item.name || "Product Name"}
                          </h4>
                          <div className="mt-1 flex justify-center sm:justify-start gap-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">Size: {item.size}</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                          <p className="mt-2 font-medium text-indigo-600">₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm">
                      {(order.status === "Cancelled" || order.status === "Cancellation Requested") && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
                          <p className="font-semibold flex items-center gap-2">
                            <XCircleIcon className="w-4 h-4" />
                            {order.status === "Cancellation Requested" ? "Cancellation Pending" : "Order Cancelled"}
                          </p>
                          <p className="mt-1 text-red-600">Reason: {order.cancelReason}</p>
                          {order.cancelledAt && (
                            <p className="text-xs text-red-400 mt-1">Requested: {new Date(order.cancelledAt).toLocaleString()}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {order.status !== "Delivered" &&
                      order.status !== "Cancelled" &&
                      order.status !== "Cancellation Requested" && (
                        <button
                          onClick={() => {
                            setSelectedOrderId(order._id);
                            setShowModal(true);
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                        >
                          Request Cancellation
                        </button>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to cancel?
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none appearance-none"
                  >
                    <option value="">Select a reason...</option>
                    <option>Ordered by mistake</option>
                    <option>Found cheaper elsewhere</option>
                    <option>Delivery time too long</option>
                    <option>Changed my mind</option>
                    <option>Want to change payment method</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800 flex gap-2">
                    <ClockIcon className="w-5 h-5 flex-shrink-0" />
                    Checking out? Please select valid Reason
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-md shadow-red-200 transition-colors"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
