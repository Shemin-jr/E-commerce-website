
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));

    const loadCart = async () => {
      try {
        if (user) {
          const res = await axios.get(`http://localhost:5000/carts?userId=${user.id}`);
          setCart(res.data[0]?.items || []);
        } else {
          setCart(JSON.parse(localStorage.getItem("cart")) || []);
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };

    loadCart();
  }, []);

 
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));

    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));

    if (user) {
      axios
        .get(`http://localhost:5000/carts?userId=${user.id}`)
        .then((res) => {
          if (res.data.length > 0) {
            axios.patch(`http://localhost:5000/carts/${res.data[0].id}`, {
              items: newCart,
              updatedAt: new Date().toISOString(),
            });
          } else {
            axios.post(`http://localhost:5000/carts`, {
              userId: user.id,
              items: newCart,
              updatedAt: new Date().toISOString(),
            });
          }
        })
        .catch((err) => console.error("Cart sync failed:", err));
    }
  };


  
  const increaseQty = (id, size) => {
    updateCart(
      cart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id, size) => {
    updateCart(
      cart
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) } 
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSizeSelect = (id, sizeValue) => {
    updateCart(cart.map((item) => (item.id === id ? { ...item, size: sizeValue } : item)));
  };

  const removeItem = (id, size) => {
    updateCart(cart.filter((item) => !(item.id === id && item.size === size)));
    setSelectedItems((prev) => prev.filter((s) => !(s.id === id && s.size === size)));
  };

  
  const toggleSelectItem = (item) => {
    const exists = selectedItems.find(
      (sel) => sel.id === item.id && sel.size === item.size
    );
    if (exists) {
      setSelectedItems(selectedItems.filter((sel) => !(sel.id === item.id && sel.size === item.size)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one product to proceed to checkout!");
      return; 
    }
    navigate("/checkout", { state: { products: selectedItems } });
  };

  
  if (cart.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="Empty cart"
          className="w-32 mb-6 opacity-80"
        />
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Add some products to get started!</p>
      </div>
    );


  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">
        🛍️ Your Shopping Cart
      </h1>

      
      <div className="space-y-6">
        {cart.map((item, index) => {
          const isSelected = selectedItems.some(
            (sel) => sel.id === item.id && sel.size === item.size
          );
          return (
            <div
              key={`${item.id}-${item.size || index}`}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-white rounded-2xl p-6 shadow-md border transition-all ${
                isSelected ? "border-blue-500 shadow-blue-200" : "border-gray-100"
              }`}
            >
             
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectItem(item)}
                className="mb-3 md:mb-0 accent-blue-600 scale-125 cursor-pointer"
              />

             
              <div className="flex items-center gap-5 w-full md:w-auto">
                <img
                  src={item.image}
                  alt={item.team || item.name}
                  className="w-28 h-28 object-contain rounded-xl bg-gray-50 border"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {item.team || item.name}
                  </h2>
                  <p className="text-gray-600 text-sm capitalize mt-1">
                    Category:{" "}
                    <span className="font-medium text-gray-700">
                      {item.category || "N/A"}
                    </span>
                  </p>
                  {item.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-gray-800 font-medium mt-2">
                    Price: ₹ {Number(item.price).toFixed(2)}
                  </p>

                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Select Size:
                    </p>
                    <div className="flex gap-2">
                      {["S", "M", "L", "XL"].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(item.id, size)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                            item.size === size
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="flex flex-col items-end justify-between mt-4 md:mt-0 gap-4">
                <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full">
                  <button
                    onClick={() => decreaseQty(item.id, item.size)}
                    className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseQty(item.id, item.size)}
                    className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    +
                  </button>
                </div>

                <p className="text-gray-700 font-semibold">
                  Total: ₹ {(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeItem(item.id, item.size)}
                  className="text-red-500 hover:text-red-600 font-medium text-sm"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-10">
        <button
          onClick={handleProceedToCheckout}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-md"
        >
          🧾 Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
