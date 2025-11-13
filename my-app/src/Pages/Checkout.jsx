

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

 
  let selectedProducts = [];
  if (location.state?.products) selectedProducts = location.state.products;
  else if (location.state?.product) selectedProducts = [location.state.product];
  else {
    selectedProducts =
      JSON.parse(localStorage.getItem("selectedItems")) ||
      JSON.parse(localStorage.getItem("checkoutItems")) ||
      [];
  }

  selectedProducts = selectedProducts.map((it) => ({
    ...it,
    quantity: it.quantity || 1,
  }));

  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [payment, setPayment] = useState("Credit / Debit Card");
  const [loading, setLoading] = useState(false);

  
  const clearCartCompletely = async (user) => {
    try {
      localStorage.removeItem("cart");
      localStorage.removeItem("selectedItems");
      localStorage.removeItem("checkoutItems");

      if (user?.id) {
        const res = await axios.get(`http://localhost:5000/carts?userId=${user.id}`);
        if (res.data.length > 0) {
          await axios.patch(`http://localhost:5000/carts/${res.data[0].id}`, {
            items: [],
            updatedAt: new Date().toISOString(),
          });
        }
      }

      
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Cart clearing failed:", err);
    }
  };

  
  const handleOrderNow = async () => {
    if (selectedProducts.length === 0) return alert("No products to order!");
    if (!name || !phone || !address || !city || !zip)
      return alert("Please fill all shipping details!");

    setLoading(true);
    try {
      const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("currentUser"));

      const total = selectedProducts.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );

      
      const order = {
        id: Date.now().toString(),
        userId: user?.id || null,
        items: selectedProducts, 
        total,
        name,
        phone,
        address: `${address}, ${city} - ${zip}`,
        payment, // 
        date: new Date().toISOString(), 
        status: "Pending",
      };

     
      try {
        await axios.post("http://localhost:5000/orders", order);
      } catch (err) {
        console.warn("Server save failed, saving locally:", err);
        const existing = JSON.parse(localStorage.getItem("orders")) || [];
        existing.push(order);
        localStorage.setItem("orders", JSON.stringify(existing));
      }

      await clearCartCompletely(user);

      
      navigate("/orders", { state: { order } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">
        🧾 Checkout
      </h1>

      {selectedProducts.length === 0 ? (
        <div className="text-center text-gray-500">
          <p className="text-lg">No products selected for checkout.</p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Cart
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Shipping Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="border px-3 py-2 rounded-lg w-full"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="border px-3 py-2 rounded-lg w-full"
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street Address"
                className="border px-3 py-2 rounded-lg w-full"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="border px-3 py-2 rounded-lg w-full"
              />
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="ZIP / Postal Code"
                className="border px-3 py-2 rounded-lg w-full"
              />
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">
              Payment Method
            </h2>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full"
            >
              <option>Credit / Debit Card</option>
              <option>Cash on Delivery</option>
              <option>UPI</option>
            </select>

            
            <div className="mt-8 border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {selectedProducts
                    .reduce(
                      (s, it) => s + (it.price || 0) * (it.quantity || 1),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleOrderNow}
                disabled={loading}
                className={`mt-4 sm:mt-0 px-8 py-3 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white rounded-lg text-lg font-semibold transition`}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>

         
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {selectedProducts.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.team || item.name}
                      className="w-20 h-20 object-contain rounded-lg border bg-gray-50"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.team || item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹ {item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-blue-600 font-semibold">
                    ₹ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
