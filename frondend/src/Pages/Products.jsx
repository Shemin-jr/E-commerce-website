// import React, { useEffect, useState, useCallback, useRef } from "react";
// import API from "../api/api";
// import { FaHeart, FaRegHeart } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// // Simple debounce function without lodash
// function debounce(func, wait) {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }

// function Products() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [wishlist, setWishlist] = useState(() => {
//     const saved = localStorage.getItem("wishlist");
//     return saved ? JSON.parse(saved) : [];
//   });

//   // Search & Filter State
//   const [searchTerm, setSearchTerm] = useState(localStorage.getItem("searchTerm") || "");
//   const [category, setCategory] = useState(localStorage.getItem("category") || "All");
//   const [sortOrder, setSortOrder] = useState(localStorage.getItem("sortOrder") || "none");

//   // Pagination (Server-side pagination)
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const productsPerPage = 12; // Adjusted to match limit if needed

//   const navigate = useNavigate();

//   // ===============================
//   // Fetch Products from Backend
//   // ===============================
//   const fetchProducts = async (search, cat, sort, page = 1) => {
//     setLoading(true);
//     try {
//       const params = {
//         page,
//         limit: productsPerPage
//       };
//       if (search) params.search = search;
//       if (cat && cat !== "All") params.category = cat;

//       if (sort === "lowToHigh") params.sort = "price_low";
//       if (sort === "highToLow") params.sort = "price_high";

//       console.log('🔍 Fetching products with params:', params);
//       const res = await API.get("/products", { params });
//       console.log('✅ Products fetched:', res.data.products.length);

//       setProducts(res.data.products);
//       setTotalPages(res.data.totalPages);
//       setCurrentPage(res.data.currentPage);
//     } catch (err) {
//       console.error('❌ Error:', err);
//       toast.error("Failed to load products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create debounced function using useRef to persist it across renders
//   const debouncedFetchRef = useRef(
//     debounce((s, c, o, p) => fetchProducts(s, c, o, p), 500)
//   );

//   // Trigger fetch when filters change
//   useEffect(() => {
//     // Persist to local storage
//     localStorage.setItem("searchTerm", searchTerm);
//     localStorage.setItem("category", category);
//     localStorage.setItem("sortOrder", sortOrder);

//     // Call API (reset to page 1 when filters change)
//     debouncedFetchRef.current(searchTerm, category, sortOrder, 1);
//   }, [searchTerm, category, sortOrder]);

//   const handlePageChange = (newPage) => {
//     fetchProducts(searchTerm, category, sortOrder, newPage);
//   };


//   // Wishlist Effect
//   useEffect(() => {
//     localStorage.setItem("wishlist", JSON.stringify(wishlist));
//     window.dispatchEvent(new Event("wishlistUpdated"));
//   }, [wishlist]);




//   // ===============================
//   // Handlers
//   // ===============================
//   const toggleWishlist = (product) => {
//     const productId = product._id || product.id;
//     const exists = wishlist.some((w) => (w._id || w.id) === productId);
//     if (exists) {
//       setWishlist(wishlist.filter((w) => (w._id || w.id) !== productId));
//       toast.info("Removed from wishlist");
//     } else {
//       setWishlist([...wishlist, product]);
//       toast.success("Added to wishlist!");
//     }
//   };

//   const handleAddToCart = async (product) => {
//     const productId = product._id || product.id;
//     const size = "";

//     // Determine active price
//     const isActiveOffer = product.salePrice && new Date(product.offerExpiry) > new Date();
//     const finalPrice = isActiveOffer ? Number(product.salePrice) : Number(product.price);

//     const cartLocal = JSON.parse(localStorage.getItem("cart")) || [];
//     const existingItem = cartLocal.find(
//       (item) => (item._id || item.id) === productId && item.size === size
//     );

//     if (existingItem) {
//       existingItem.quantity = (existingItem.quantity || 1) + 1;
//       existingItem.price = finalPrice; // Update price in case it changed
//     } else {
//       cartLocal.push({ ...product, price: finalPrice, quantity: 1, size });
//     }

//     localStorage.setItem("cart", JSON.stringify(cartLocal));

//     try {
//       const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("currentUser"));
//       if (storedUser) {
//         const userId = storedUser._id || storedUser.id;
//         await API.patch(`/cart/${userId}`, {
//           items: cartLocal,
//           updatedAt: new Date().toISOString(),
//         });
//       }
//     } catch (err) {
//       console.error("Failed to sync cart", err);
//     }
//     toast.success(`${product.team} added to cart!`);
//     window.dispatchEvent(new Event("cartUpdated"));
//   };

//   if (loading && products.length === 0) {
//     return (
//       <div className="min-h-screen flex justify-center items-center text-blue-600 font-bold text-2xl">
//         Loading products...
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-20">

//       {/* Filter Bar */}
//       <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
//         <input
//           type="text"
//           placeholder="Search by team..."
//           className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <select
//           className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         >
//           <option value="All">All Categories</option>
//           <option value="home">Home Kit</option>
//           <option value="away">Away Kit</option>
//           <option value="special edition">Special Edition</option>
//         </select>
//         <select
//           className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//           value={sortOrder}
//           onChange={(e) => setSortOrder(e.target.value)}
//         >
//           <option value="none">Sort by</option>
//           <option value="lowToHigh">Price: Low → High</option>
//           <option value="highToLow">Price: High → Low</option>
//         </select>
//       </div>


//       {/* Product Grid */}
//       {products.length === 0 && !loading ? (
//         <div className="text-center text-gray-500 text-xl mt-10">No products found.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
//           {products.map((item) => {
//             const productId = item._id || item.id;
//             const isInWishlist = wishlist.some((w) => (w._id || w.id) === productId);

//             return (
//               <div
//                 key={productId}
//                 className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
//               >
//                 <div
//                   onClick={() => toggleWishlist(item)}
//                   className="absolute top-3 right-3 text-2xl cursor-pointer z-10"
//                 >
//                   {isInWishlist ? (
//                     <FaHeart className="text-red-600" />
//                   ) : (
//                     <FaRegHeart className="text-gray-400 hover:text-red-600" />
//                   )}
//                 </div>

//                 <img
//                   src={item.image}
//                   alt={item.team}
//                   className="w-full h-80 object-cover cursor-pointer"
//                   onClick={() => navigate(`/product/${productId}`)}
//                 />

//                 <div className="p-6 text-center">
//                   <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.team}</h3>
//                   <p className="text-gray-600 mb-1">Category: {item.category}</p>
//                   <div className="mb-4">
//                     {item.salePrice && new Date(item.offerExpiry) > new Date() ? (
//                       <div className="flex flex-col items-center">
//                         <span className="text-gray-400 line-through text-sm">₹ {item.price?.toFixed(2)}</span>
//                         <span className="text-red-600 font-bold text-xl leading-none">₹ {Number(item.salePrice).toFixed(2)}</span>
//                         <span className="text-[10px] text-red-500 font-bold uppercase mt-1 animate-pulse">Limited Offer!</span>
//                       </div>
//                     ) : (
//                       <p className="text-green-600 font-semibold text-lg">₹ {item.price?.toFixed(2)}</p>
//                     )}
//                   </div>

//                   <div className="flex justify-center">
//                     <button
//                       onClick={() => handleAddToCart(item)}
//                       className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-transform hover:scale-105"
//                     >
//                       Add to Cart
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Pagination Controls */}
//       {totalPages > 1 && (
//         <div className="flex justify-center mt-10 gap-3">
//           <button
//             onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
//             disabled={currentPage === 1}
//           >
//             Prev
//           </button>

//           {Array.from({ length: totalPages }, (_, idx) => (
//             <button
//               key={idx + 1}
//               onClick={() => handlePageChange(idx + 1)}
//               className={`px-4 py-2 rounded-lg ${currentPage === idx + 1
//                 ? "bg-green-700 text-white"
//                 : "bg-green-200 text-green-800 hover:bg-green-400"
//                 }`}
//             >
//               {idx + 1}
//             </button>
//           ))}

//           <button
//             onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Products;
import React, { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState(localStorage.getItem("searchTerm") || "");
  const [category, setCategory] = useState(localStorage.getItem("category") || "All");
  const [sortOrder, setSortOrder] = useState(localStorage.getItem("sortOrder") || "none");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12;

  const navigate = useNavigate();

  const fetchProducts = async (search, cat, sort, page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: productsPerPage
      };

      if (search) params.search = search;
      if (cat && cat !== "All") params.category = cat;

      if (sort === "lowToHigh") params.sort = "price_low";
      if (sort === "highToLow") params.sort = "price_high";

      const res = await API.get("/products", { params });

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);

    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchRef = useRef(
    debounce((s, c, o, p) => fetchProducts(s, c, o, p), 500)
  );

  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
    localStorage.setItem("category", category);
    localStorage.setItem("sortOrder", sortOrder);

    debouncedFetchRef.current(searchTerm, category, sortOrder, 1);
  }, [searchTerm, category, sortOrder]);

  const handlePageChange = (newPage) => {
    fetchProducts(searchTerm, category, sortOrder, newPage);
  };

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    const productId = product._id || product.id;
    const exists = wishlist.some((w) => (w._id || w.id) === productId);

    if (exists) {
      setWishlist(wishlist.filter((w) => (w._id || w.id) !== productId));
      toast.info("Removed from wishlist");
    } else {
      setWishlist([...wishlist, product]);
      toast.success("Added to wishlist!");
    }
  };

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id;

    const isActiveOffer = product.salePrice && new Date(product.offerExpiry) > new Date();
    const finalPrice = isActiveOffer ? Number(product.salePrice) : Number(product.price);

    const cartLocal = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cartLocal.find(
      (item) => (item._id || item.id) === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.price = finalPrice;
    } else {
      cartLocal.push({ ...product, price: finalPrice, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cartLocal));

    toast.success(`${product.team} added to cart!`);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-2xl font-bold bg-black">
        Loading products...
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen py-16 px-6 md:px-20">

      {/* Filter Bar */}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">

        <input
          type="text"
          placeholder="Search by team..."
          className="w-full md:w-1/3 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="w-full md:w-1/4 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="home">Home Kit</option>
          <option value="away">Away Kit</option>
          <option value="special edition">Special Edition</option>
        </select>

        <select
          className="w-full md:w-1/4 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="none">Sort by</option>
          <option value="lowToHigh">Price: Low → High</option>
          <option value="highToLow">Price: High → Low</option>
        </select>

      </div>

      {/* Products Grid */}

      {products.length === 0 && !loading ? (
        <div className="text-center text-gray-400 text-xl mt-10">
          No products found.
        </div>
      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {products.map((item) => {

            const productId = item._id || item.id;

            const isInWishlist = wishlist.some(
              (w) => (w._id || w.id) === productId
            );

            return (

              <div
                key={productId}
                className="relative bg-gray-900 text-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >

                {/* Wishlist */}

                <div
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-3 right-3 text-2xl cursor-pointer z-10"
                >
                  {isInWishlist ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-400 hover:text-red-500" />
                  )}
                </div>

                {/* Image */}

                <img
                  src={item.image}
                  alt={item.team}
                  className="w-full h-80 object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${productId}`)}
                />

                {/* Product Info */}

                <div className="p-6 text-center">

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {item.team}
                  </h3>

                  <p className="text-gray-400 mb-2">
                    Category: {item.category}
                  </p>

                  {/* Price */}

                  <div className="mb-4">

                    {item.salePrice && new Date(item.offerExpiry) > new Date() ? (

                      <div className="flex flex-col items-center">

                        <span className="text-gray-500 line-through text-sm">
                          ₹ {item.price?.toFixed(2)}
                        </span>

                        <span className="text-red-500 font-bold text-xl">
                          ₹ {Number(item.salePrice).toFixed(2)}
                        </span>

                        <span className="text-[10px] text-red-400 uppercase animate-pulse">
                          Limited Offer!
                        </span>

                      </div>

                    ) : (

                      <p className="text-green-400 font-semibold text-lg">
                        ₹ {item.price?.toFixed(2)}
                      </p>

                    )}

                  </div>

                  {/* Button */}

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-transform hover:scale-105"
                  >
                    Add to Cart
                  </button>

                </div>

              </div>

            );

          })}

        </div>

      )}

      {/* Pagination */}

      {totalPages > 1 && (

        <div className="flex justify-center mt-10 gap-3">

          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-600"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, idx) => (

            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === idx + 1
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {idx + 1}
            </button>

          ))}

          <button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-600"
            disabled={currentPage === totalPages}
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
}

export default Products;
