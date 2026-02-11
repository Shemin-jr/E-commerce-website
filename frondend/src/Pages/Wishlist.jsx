import React, { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});


  const parsePrice = (p) => {
    if (typeof p === "number") return p;
    if (typeof p === "string") {
      const cleaned = p.replace(/[^0-9.-]/g, "");
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
    const updatedWishlist = wishlist.filter((item) => (item._id || item.id) !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };


  const handleSizeSelect = (id, size) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  };


  const addToCart = async (item) => {
    const productId = item._id || item.id;
    const selectedSize = selectedSizes[productId];
    if (!selectedSize) {
      toast.warn("Please select a size before adding to cart!");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find(
      (i) => (i._id || i.id) === productId && i.size === selectedSize
    );

    if (exists) {
      toast.warn("This item (same size) is already in your cart!");
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

    // Sync with server if logged in
    try {
      const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("currentUser"));
      if (user && user.token) {
        const userId = user._id || user.id;
        await API.get(`/cart?userId=${userId}`);
        await API.patch(`/cart/${userId}`, {
          items: updatedCart,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Cart sync failed:", err);
      toast.error(" something went wrong ");
    }

    toast.success(`${item.team || item.name} added to cart!`);

    window.dispatchEvent(new Event("cartUpdated"));
    removeFromWishlist(productId);
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
        💖 Your Wishlist
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
        {wishlist.map((item) => {
          const productId = item._id || item.id;
          return (
            <div
              key={productId}
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
                        onClick={() => handleSizeSelect(productId, size)}
                        className={`px-3 py-1 rounded-md border ${selectedSizes[productId] === size
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
                  onClick={() => removeFromWishlist(productId)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;
