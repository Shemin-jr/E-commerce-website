// import React, { useEffect, useState } from "react";
// import API from "../api/api";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// function Cart() {
//   const [cart, setCart] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const navigate = useNavigate();


//   useEffect(() => {
//     const user =
//       JSON.parse(localStorage.getItem("user")) ||
//       JSON.parse(localStorage.getItem("currentUser"));

//     const loadCart = async () => {
//       try {
//         if (user) {
//           const userId = user._id || user.id;
//           const res = await API.get(`/cart?userId=${userId}`);
//           setCart(res.data[0]?.items || []);
//         } else {
//           setCart(JSON.parse(localStorage.getItem("cart")) || []);
//         }
//       } catch (err) {
//         console.error("Error loading cart:", err);
//         toast.error(" something went wrong ");
//       }
//     };

//     loadCart();
//   }, []);


//   const updateCart = (newCart) => {
//     setCart(newCart);
//     localStorage.setItem("cart", JSON.stringify(newCart));
//     window.dispatchEvent(new Event("cartUpdated"));

//     const user =
//       JSON.parse(localStorage.getItem("user")) ||
//       JSON.parse(localStorage.getItem("currentUser"));

//     if (user) {
//       const userId = user._id || user.id;
//       API
//         .patch(`/cart/${userId}`, {
//           items: newCart,
//           updatedAt: new Date().toISOString(),
//         })
//         .catch((err) => {
//           console.error("Cart sync failed:", err);
//           toast.error("oops something went wrong while clicking error information");
//         });
//     }
//   };


//   const increaseQty = (id, size) => {
//     updateCart(
//       cart.map((item) =>
//         (item._id || item.id) === id && item.size === size
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       )
//     );
//   };

//   const decreaseQty = (id, size) => {
//     updateCart(
//       cart.map((item) =>
//         (item._id || item.id) === id && item.size === size
//           ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
//           : item
//       )
//         .filter((item) => item.quantity > 0)
//     );
//   };

//   const handleSizeSelect = (id, currentSize, newSize) => {
//     const newCart = cart.map((item) =>
//       (item._id || item.id) === id && item.size === currentSize
//         ? { ...item, size: newSize }
//         : item
//     );
//     updateCart(newCart);

//     // Update selectedItems if the item being changed is selected
//     if (selectedItems.some((sel) => (sel._id || sel.id) === id && sel.size === currentSize)) {
//       setSelectedItems((prev) =>
//         prev.map((sel) =>
//           (sel._id || sel.id) === id && sel.size === currentSize
//             ? { ...sel, size: newSize }
//             : sel
//         )
//       );
//     }
//   };

//   const removeItem = (id, size) => {
//     updateCart(cart.filter((item) => !((item._id || item.id) === id && item.size === size)));
//     setSelectedItems((prev) => prev.filter((s) => !((s._id || s.id) === id && s.size === size)));
//     toast.success("Product is removed");
//   };


//   const toggleSelectItem = (item) => {
//     const itemId = item._id || item.id;
//     const exists = selectedItems.find(
//       (sel) => (sel._id || sel.id) === itemId && sel.size === item.size
//     );
//     if (exists) {
//       setSelectedItems(selectedItems.filter((sel) => !((sel._id || sel.id) === itemId && sel.size === item.size)));
//     } else {
//       setSelectedItems([...selectedItems, item]);
//     }
//   };

//   const handleProceedToCheckout = () => {
//     if (selectedItems.length === 0) {
//       toast.warn("Please select at least one product to proceed to checkout!");
//       return;
//     }

//     const missingSize = selectedItems.find((item) => !item.size);
//     if (missingSize) {
//       toast.warn(`Please select a size for ${missingSize.team || missingSize.name} before proceeding.`);
//       return;
//     }

//     navigate("/checkout", { state: { products: selectedItems } });
//   };


//   if (cart.length === 0)
//     return (
//       <div className="flex flex-col items-center justify-center py-20 text-gray-600">
//         <img
//           src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
//           alt="Empty cart"
//           className="w-32 mb-6 opacity-80"
//         />
//         <h2 className="text-2xl font-semibold">Your cart is empty</h2>
//         <p className="text-gray-500 mt-2">Add some products to get started!</p>
//       </div>
//     );


//   return (
//     <div className="max-w-5xl mx-auto py-12 px-6">
//       <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">
//         🛍️ Your Shopping Cart
//       </h1>


//       <div className="space-y-6">
//         {cart.map((item, index) => {
//           const itemId = item._id || item.id;
//           const isSelected = selectedItems.some(
//             (sel) => (sel._id || sel.id) === itemId && sel.size === item.size
//           );
//           return (
//             <div
//               key={`${itemId}-${item.size || index}`}
//               className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-white rounded-2xl p-6 shadow-md border transition-all ${isSelected ? "border-blue-500 shadow-blue-200" : "border-gray-100"
//                 }`}
//             >

//               <input
//                 type="checkbox"
//                 checked={isSelected}
//                 onChange={() => toggleSelectItem(item)}
//                 className="mb-3 md:mb-0 accent-blue-600 scale-125 cursor-pointer"
//               />


//               <div className="flex items-center gap-5 w-full md:w-auto">
//                 <img
//                   src={item.image}
//                   alt={item.team || item.name}
//                   className="w-28 h-28 object-contain rounded-xl bg-gray-50 border"
//                 />
//                 <div>
//                   <h2 className="text-xl font-semibold text-gray-800">
//                     {item.team || item.name}
//                   </h2>
//                   <p className="text-gray-600 text-sm capitalize mt-1">
//                     Category:{" "}
//                     <span className="font-medium text-white-700">
//                       {item.category || "N/A"}
//                     </span>
//                   </p>
//                   {item.description && (
//                     <p className="text-white-500 text-sm mt-1 line-clamp-2">
//                       {item.description}
//                     </p>
//                   )}
//                   <p className="text-gray-800 font-medium mt-2">
//                     Price: ₹ {Number(item.price).toFixed(2)}
//                   </p>


//                   <div className="mt-3">
//                     <p className={`text-sm font-medium mb-1 ${!item.size ? "text-red-500 animate-pulse" : "text-gray-700"}`}>
//                       {item.size ? "Selected Size:" : "Please Select Size:"}
//                     </p>
//                     <div className={`flex gap-2 p-1 rounded-lg transition-all ${!item.size ? "bg-red-50 border border-red-200" : ""}`}>
//                       {(item.sizes && item.sizes.length > 0 ? item.sizes : ["S", "M", "L", "XL"]).map((size) => (
//                         <button
//                           key={size}
//                           onClick={() => handleSizeSelect(item._id || item.id, item.size, size)}
//                           className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${item.size === size
//                             ? "bg-green-600 text-white border-green-600 shadow-sm"
//                             : "border-gray-300 hover:bg-gray-100 bg-white"
//                             }`}
//                         >
//                           {size}
//                         </button>
//                       ))}
//                     </div>
//                     {!item.size && (
//                       <p className="text-[10px] text-red-500 mt-1 font-semibold uppercase tracking-wider">
//                         Required *
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>


//               <div className="flex flex-col items-end justify-between mt-4 md:mt-0 gap-4">
//                 <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full">
//                   <button
//                     onClick={() => decreaseQty(item._id || item.id, item.size)}
//                     className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
//                   >
//                     −
//                   </button>
//                   <span className="text-lg font-semibold w-6 text-center">
//                     {item.quantity}
//                   </span>
//                   <button
//                     onClick={() => increaseQty(item._id || item.id, item.size)}
//                     className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
//                   >
//                     +
//                   </button>
//                 </div>

//                 <p className="text-gray-700 font-semibold">
//                   Total: ₹ {(item.price * item.quantity).toFixed(2)}
//                 </p>

//                 <button
//                   onClick={() => removeItem(item._id || item.id, item.size)}
//                   className="text-red-500 hover:text-red-600 font-medium text-sm"
//                 >
//                   ✕ Remove
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="flex justify-end mt-10">
//         <button
//           onClick={handleProceedToCheckout}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-md"
//         >
//           🧾 Proceed to Checkout
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Cart;
import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
          const userId = user._id || user.id;
          const res = await API.get(`/cart?userId=${userId}`);
          setCart(res.data[0]?.items || []);
        } else {
          setCart(JSON.parse(localStorage.getItem("cart")) || []);
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        toast.error(" something went wrong ");
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
      const userId = user._id || user.id;
      API.patch(`/cart/${userId}`, {
        items: newCart,
        updatedAt: new Date().toISOString(),
      }).catch((err) => {
        console.error("Cart sync failed:", err);
        toast.error("oops something went wrong while clicking error information");
      });
    }
  };

  const increaseQty = (id, size) => {
    updateCart(
      cart.map((item) =>
        (item._id || item.id) === id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id, size) => {
    updateCart(
      cart.map((item) =>
        (item._id || item.id) === id && item.size === size
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const handleSizeSelect = (id, currentSize, newSize) => {
    const newCart = cart.map((item) =>
      (item._id || item.id) === id && item.size === currentSize
        ? { ...item, size: newSize }
        : item
    );
    updateCart(newCart);

    if (selectedItems.some((sel) => (sel._id || sel.id) === id && sel.size === currentSize)) {
      setSelectedItems((prev) =>
        prev.map((sel) =>
          (sel._id || sel.id) === id && sel.size === currentSize
            ? { ...sel, size: newSize }
            : sel
        )
      );
    }
  };

  const removeItem = (id, size) => {
    updateCart(cart.filter((item) => !((item._id || item.id) === id && item.size === size)));
    setSelectedItems((prev) =>
      prev.filter((s) => !((s._id || s.id) === id && s.size === size))
    );
    toast.success("Product is removed");
  };

  const toggleSelectItem = (item) => {
    const itemId = item._id || item.id;
    const exists = selectedItems.find(
      (sel) => (sel._id || sel.id) === itemId && sel.size === item.size
    );
    if (exists) {
      setSelectedItems(selectedItems.filter((sel) => !((sel._id || sel.id) === itemId && sel.size === item.size)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warn("Please select at least one product to proceed to checkout!");
      return;
    }

    const missingSize = selectedItems.find((item) => !item.size);
    if (missingSize) {
      toast.warn(`Please select a size for ${missingSize.team || missingSize.name} before proceeding.`);
      return;
    }

    navigate("/checkout", { state: { products: selectedItems } });
  };

  if (cart.length === 0)
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-20">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="Empty cart"
          className="w-32 mb-6 opacity-80"
        />
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-gray-400 mt-2">Add some products to get started!</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">

      <div className="max-w-5xl mx-auto py-12 px-6">

        <h1 className="text-4xl font-bold text-center mb-10">
          🛍️ Your Shopping Cart
        </h1>

        <div className="space-y-6">
          {cart.map((item, index) => {
            const itemId = item._id || item.id;
            const isSelected = selectedItems.some(
              (sel) => (sel._id || sel.id) === itemId && sel.size === item.size
            );

            return (
              <div
                key={`${itemId}-${item.size || index}`}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-900 rounded-2xl p-6 shadow-md border ${
                  isSelected ? "border-blue-500" : "border-gray-700"
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
                    className="w-28 h-28 object-contain rounded-xl bg-gray-800 border border-gray-700"
                  />

                  <div>
                    <h2 className="text-xl font-semibold">
                      {item.team || item.name}
                    </h2>

                    <p className="text-gray-400 text-sm mt-1">
                      Category:
                      <span className="font-medium text-white ml-1">
                        {item.category || "N/A"}
                      </span>
                    </p>

                    {item.description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <p className="font-medium mt-2">
                      Price: ₹ {Number(item.price).toFixed(2)}
                    </p>

                    <div className="mt-3">
                      <p className={`text-sm mb-1 ${!item.size ? "text-red-500" : "text-gray-300"}`}>
                        {item.size ? "Selected Size:" : "Please Select Size:"}
                      </p>

                      <div className="flex gap-2">
                        {(item.sizes && item.sizes.length > 0 ? item.sizes : ["S", "M", "L", "XL"]).map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeSelect(item._id || item.id, item.size, size)}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              item.size === size
                                ? "bg-green-600 text-white border-green-600"
                                : "border-gray-600 hover:bg-gray-700"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 mt-4 md:mt-0">

                  <div className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded-full">
                    <button
                      onClick={() => decreaseQty(item._id || item.id, item.size)}
                      className="px-3 py-1 bg-gray-700 rounded-full"
                    >
                      −
                    </button>

                    <span className="text-lg font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQty(item._id || item.id, item.size)}
                      className="px-3 py-1 bg-gray-700 rounded-full"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-gray-300 font-semibold">
                    Total: ₹ {(item.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeItem(item._id || item.id, item.size)}
                    className="text-red-400 hover:text-red-500 text-sm"
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
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            🧾 Proceed to Checkout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Cart;