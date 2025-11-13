
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 11;
  const [searchTerm, setSearchTerm] = useState(localStorage.getItem("searchTerm") || "");
  const [category, setCategory] = useState(localStorage.getItem("category") || "All");
  const [sortOrder, setSortOrder] = useState(localStorage.getItem("sortOrder") || "none");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/products");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => localStorage.setItem("searchTerm", searchTerm), [searchTerm]);
  useEffect(() => localStorage.setItem("category", category), [category]);
  useEffect(() => localStorage.setItem("sortOrder", sortOrder), [sortOrder]);
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  }, [wishlist]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-green-600 font-bold text-2xl">
        Loading products...
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const team = p.team?.toLowerCase() || "";
    const matchesSearch = team.includes(searchTerm.toLowerCase());
    const matchesCategory = category === "All" || p.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.price - b.price;
    if (sortOrder === "highToLow") return b.price - a.price;
    return 0;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const toggleWishlist = (product) => {
    const exists = wishlist.some((w) => w.id === product.id);
    if (exists) setWishlist(wishlist.filter((w) => w.id !== product.id));
    else setWishlist([...wishlist, product]);
  };

 
  const handleAddToCart = async (product) => {
    const cartLocal = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cartLocal.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cartLocal.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cartLocal));

    try {
      const storedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("currentUser"));

      if (storedUser) {
        const res = await axios.get(`http://localhost:5000/carts?userId=${storedUser.id}`);
        const items = cartLocal;
        if (res.data && res.data.length > 0) {
          const cartRecord = res.data[0];
          await axios.patch(`http://localhost:5000/carts/${cartRecord.id}`, {
            items,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await axios.post(`http://localhost:5000/carts`, {
            userId: storedUser.id,
            items,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Failed to persist cart to server:", err);
    }

    
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-20">
  
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <input
          type="text"
          placeholder="Search by team..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Categories</option>
          <option value="home">Home Kit</option>
          <option value="away">Away Kit</option>
          <option value="special edition">Special Edition</option>
        </select>
        <select
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="none">Sort by</option>
          <option value="lowToHigh">Price: Low → High</option>
          <option value="highToLow">Price: High → Low</option>
        </select>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {currentProducts.map((item) => {
          const isInWishlist = wishlist.some((w) => w.id === item.id);

          return (
            <div
              key={item.id}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              
              <div
                onClick={() => toggleWishlist(item)}
                className="absolute top-3 right-3 text-2xl cursor-pointer z-10"
              >
                {isInWishlist ? (
                  <FaHeart className="text-red-600" />
                ) : ( 
                  <FaRegHeart className="text-gray-400 hover:text-red-600" />
                )}
              </div>

              <img
                src={item.image}
                alt={item.team}
                className="w-full h-80 object-cover cursor-pointer"
                onClick={() => navigate(`/product/${item.id}`)}
              />

              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.team}</h3>
                <p className="text-gray-600 mb-1">Category: {item.category}</p>
                <p className="text-green-600 font-semibold text-lg mb-4">₹ {item.price?.toFixed(2)}</p>

                <div className="flex justify-center">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-transform hover:scale-105"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="flex justify-center mt-10 gap-3">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx + 1}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === idx + 1
                ? "bg-green-700 text-white"
                : "bg-green-200 text-green-800 hover:bg-green-400"
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          disabled={currentPage === totalPages}
        >
          Next
        </button>  
      </div>
    </div>
  );
}

export default Products;
