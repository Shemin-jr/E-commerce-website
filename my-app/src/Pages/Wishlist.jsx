
import React, { useEffect, useState } from "react";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});

  
  const parsePrice = (p) => {
    if (typeof p === "number") return p;
    if (typeof p === "string") {
      const cleaned = p.replace(/[^0-9.\-]/g, "");
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  
  const loadWishlist = () => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  };

  useEffect(() => {
    loadWishlist();

    
    const handleWishlistChange = () => loadWishlist();

    window.addEventListener("wishlistUpdated", handleWishlistChange);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistChange);
    };
  }, []);

  
  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  
  const handleSizeSelect = (id, size) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  };

  
  const addToCart = (item) => {
    const selectedSize = selectedSizes[item.id];
    if (!selectedSize) {
      alert("Please select a size before adding to cart!");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find(
      (i) => i.id === item.id && i.size === selectedSize
    );

    if (exists) {
      alert("This item (same size) is already in your cart!");
      return;
    }

    const newCartItem = {
      ...item,
      size: selectedSize,
      quantity: 1,
      price: parsePrice(item.price),
    };

    const updatedCart = [...cart, newCartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));

   
    window.dispatchEvent(new Event("cartUpdated"));
    removeFromWishlist(item.id); 
  };

  
  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <h2 className="text-2xl font-bold mb-3"></h2>
        <a
          href="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Browse Products
        </a>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20">
      <h2 className="text-3xl font-bold text-center mb-10 text-pink-600">
        
      </h2>

      
      <div className="max-w-4xl mx-auto mb-6 flex justify-end">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm text-gray-600">Total:</span>
          <div className="text-xl font-bold text-green-600">
            ₹{" "}
            {wishlist
              .reduce(
                (s, it) => s + parsePrice(it.price) * (it.quantity || 1),
                0
              )
              .toFixed(2)}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all"
          >
            <img
              src={
                item.image ||
                "https://via.placeholder.com/400x400?text=No+Image"
              }
              alt={item.team || item.name || "Product"}
              className="w-full h-80 object-cover"
            />

            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {item.team || item.name}
              </h3>
              <p className="text-green-600 font-semibold text-lg mb-4">
                ₹{item.price || "0.00"}
              </p>

              
              <div className="mb-4">
                <p className="font-semibold text-gray-700 mb-2">Select Size:</p>
                <div className="flex justify-center space-x-2">
                  {["S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(item.id, size)}
                      className={`px-3 py-1 rounded-md border ${
                        selectedSizes[item.id] === size
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              
              <button
                onClick={() => addToCart(item)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg mr-2 transition"
              >
                Add to Cart
              </button>

            
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
