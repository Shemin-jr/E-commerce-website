import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Orders() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🟢 Get new or saved orders
  const newOrder = location.state?.order;
  const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const ordersToShow = newOrder ? [newOrder] : savedOrders;

  if (ordersToShow.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-700">
        <h2 className="text-2xl font-bold mb-4">No Orders Found 🛒</h2>
        <button
          onClick={() => navigate("/products")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold mb-10 text-center text-gray-900">
        My Orders
      </h1>

      <div className="max-w-5xl mx-auto space-y-8">
        {ordersToShow.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-md rounded-xl border border-gray-200 p-6"
          >
            {/* Order Info */}
            <div className="mb-6 border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Order ID: #{order.id}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Date: {order.date}</p>
              <p className="text-sm text-gray-600 mt-1">
                Payment Method: <span className="font-medium">{order.payment}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Total Amount:{" "}
                <span className="font-semibold text-green-700">
                  ₹ {order.total?.toFixed(2)}
                </span>
              </p>
            </div>

            {/* Ordered Products */}
            <div className="space-y-4">
              {order.products.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-none"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.team || item.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.team || item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Category: {item.category || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size: {item.size || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹ {item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="text-green-700 font-semibold mt-2 sm:mt-0">
                    ₹ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Shop More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
