

import React, { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser =
      JSON.parse(localStorage.getItem("currentUser")) 
      JSON.parse(localStorage.getItem("user"));
    setUser(loggedInUser);

    if (!loggedInUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        
        const res = await axios.get(
          `http://localhost:5000/orders?userId=${loggedInUser.id}`
        );

        
        const userOrders = (res.data || []).filter(
          (order) => order.userId === loggedInUser.id
        );

        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your orders...
      </div>
    );
  }

  
  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <h2 className="text-2xl font-bold mb-3">No Orders Yet 🛍️</h2>
        <a
          href="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Start Shopping
        </a>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
        My Orders
      </h1>

      <div className="space-y-8 max-w-4xl mx-auto">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 transition hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Order #{order.id}
              </h2>
              <span className="text-gray-500 text-sm">
                {order.date
                  ? new Date(order.date).toLocaleString()
                  : "Unknown Date"}
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.image ||
                          item.img ||
                          "https://via.placeholder.com/80?text=No+Image"
                        }
                        alt={item.name || item.team || "Product"}
                        className="w-16 h-16 rounded-md border object-contain bg-gray-50"
                      />
                      <div>
                        <h3 className="font-medium">
                          {item.team || item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.size || "N/A"} | Qty:{" "}
                          {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ₹
                      {item.price && item.quantity
                        ? (item.price * item.quantity).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 py-4 text-center">
                  No items found in this order.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="text-gray-600">
                Payment:{" "}
                <span className="font-semibold text-gray-800">
                  {order.payment || "N/A"}
                </span>
              </div>
              <div className="font-bold text-green-600 text-base">
                Total: ₹{order.total ? order.total.toFixed(2) : "0.00"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
