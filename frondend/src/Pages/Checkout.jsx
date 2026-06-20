
// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import API from "../api/api";
// import { toast } from "react-toastify";

// function Checkout() {
//   const location = useLocation();
//   const navigate = useNavigate();


//   let selectedProducts = [];
//   if (location.state?.products) selectedProducts = location.state.products;
//   else if (location.state?.product) selectedProducts = [location.state.product];
//   else {
//     selectedProducts =
//       JSON.parse(localStorage.getItem("selectedItems")) ||
//       JSON.parse(localStorage.getItem("checkoutItems")) ||
//       [];
//   }

//   selectedProducts = selectedProducts.map((it) => ({
//     ...it,
//     quantity: it.quantity || 1,
//   }));


//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zip, setZip] = useState("");
//   const [payment, setPayment] = useState("Credit / Debit Card");
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [couponCode, setCouponCode] = useState("");
//   const [appliedOffer, setAppliedOffer] = useState(null);
//   const [discount, setDiscount] = useState(0);

//   const applyCoupon = async () => {
//     if (!couponCode.trim()) {
//       toast.error("Please enter a coupon code");
//       return;
//     }

//     try {
//       const subtotal = selectedProducts.reduce(
//         (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
//         0
//       );

//       const productIds = selectedProducts.map(p => p._id || p.id);

//       const response = await API.post("/offers/apply", {
//         code: couponCode.trim(),
//         cartTotal: subtotal,
//         productIds
//       });

//       setAppliedOffer(response.data.offer);
//       setDiscount(response.data.discount);
//       toast.success("Coupon applied successfully!");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Invalid coupon code");
//       setAppliedOffer(null);
//       setDiscount(0);
//     }
//   };

//   const removeCoupon = () => {
//     setCouponCode("");
//     setAppliedOffer(null);
//     setDiscount(0);
//     toast.info("Coupon removed");
//   };


//   const clearCartCompletely = async (user) => {
//     try {
//       localStorage.setItem("cart", "[]");
//       localStorage.removeItem("selectedItems");
//       localStorage.removeItem("checkoutItems");

//       if (user) {
//         const userId = user._id || user.id;
//         try {
//           // Sync items back to server as empty
//           await API.patch(`/cart/${userId}`, {
//             items: [],
//             updatedAt: new Date().toISOString(),
//           });
//         } catch (err) {
//           console.warn("Server cart clear failed:", err);
//         }
//       }


//       window.dispatchEvent(new Event("cartUpdated"));
//     } catch (err) {
//       console.error("Cart clearing failed:", err);
//       toast.error(" something went wrong");
//     }
//   };


//   const validate = () => {
//     let tempErrors = {};
//     if (!name.trim()) tempErrors.name = "Full name is required";
//     if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) tempErrors.email = "Valid email address is required";
//     if (!/^\d{10}$/.test(phone)) tempErrors.phone = "Valid 10-digit phone number is required";
//     if (!address.trim()) tempErrors.address = "Street address is required";
//     if (!city.trim()) tempErrors.city = "City is required";
//     if (!/^\d{6}$/.test(zip)) tempErrors.zip = "Valid 6-digit ZIP code is required";

//     setErrors(tempErrors);
//     return Object.keys(tempErrors).length === 0;
//   };



//   const handleOrderNow = async () => {
//     if (selectedProducts.length === 0) {
//       toast.error("No products to order!");
//       return;
//     }
//     if (!validate()) return;

//     setLoading(true);
//     try {
//       const user =
//         JSON.parse(localStorage.getItem("user")) ||
//         JSON.parse(localStorage.getItem("currentUser"));

//       const subtotal = selectedProducts.reduce(
//         (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
//         0
//       );
//       const finalTotal = subtotal - discount;


//       const order = {
//         userId: user?._id || user?.id || null,
//         items: selectedProducts,
//         total: finalTotal,
//         subtotal,
//         discount,
//         appliedOffer: appliedOffer ? {
//           _id: appliedOffer._id,
//           title: appliedOffer.title,
//           code: appliedOffer.code,
//           discountPercent: appliedOffer.discountPercent,
//           discountAmount: appliedOffer.discountAmount,
//           type: appliedOffer.type
//         } : null,
//         name,
//         email,
//         phone,
//         address: `${address}, ${city} - ${zip}`,
//         payment,
//         date: new Date().toISOString(),
//         status: "Pending",
//       };


//       try {
//         await API.post("/orders", order);
//         toast.success("Order placed successfully!");
//         await clearCartCompletely(user);
//         navigate("/orders");
//       } catch (err) {
//         console.error("Server save failed:", err);
//         const serverMessage = err.response?.data?.message || err.message || "Something went wrong while placing order";
//         toast.error(serverMessage);

//         // Optionally save locally if you want offline support, but don't clear cart or navigate
//         const existing = JSON.parse(localStorage.getItem("orders")) || [];
//         existing.push({ ...order, offline: true });
//         localStorage.setItem("orders", JSON.stringify(existing));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const subtotal = selectedProducts.reduce(
//     (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
//     0
//   );
//   const finalTotal = subtotal;

//   return (
//     <div className="max-w-6xl mx-auto py-12 px-6">
//       <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">
//         🧾 Checkout
//       </h1>

//       {selectedProducts.length === 0 ? (
//         <div className="text-center text-gray-500">
//           <p className="text-lg">No products selected for checkout.</p>
//           <button
//             onClick={() => navigate("/cart")}
//             className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             Back to Cart
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//           <div className="bg-white rounded-2xl shadow-md p-6">
//             <h2 className="text-2xl font-semibold mb-4 text-gray-900">
//               Shipping Details
//             </h2>
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <input
//                   value={name}
//                   onChange={(e) => {
//                     setName(e.target.value);
//                     if (errors.name) setErrors({ ...errors, name: "" });
//                   }}
//                   placeholder="Full Name"
//                   className={`border px-3 py-2 rounded-lg w-full ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
//                 />
//                 {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//               </div>

//               <div>
//                 <input
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     if (errors.email) setErrors({ ...errors, email: "" });
//                   }}
//                   placeholder="Email Address"
//                   className={`border px-3 py-2 rounded-lg w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
//                 />
//                 {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//               </div>

//               <div>
//                 <input
//                   value={phone}
//                   onChange={(e) => {
//                     setPhone(e.target.value);
//                     if (errors.phone) setErrors({ ...errors, phone: "" });
//                   }}
//                   placeholder="Phone Number (10 digits)"
//                   className={`border px-3 py-2 rounded-lg w-full ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
//                 />
//                 {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
//               </div>

//               <div>
//                 <input
//                   value={address}
//                   onChange={(e) => {
//                     setAddress(e.target.value);
//                     if (errors.address) setErrors({ ...errors, address: "" });
//                   }}
//                   placeholder="Street Address"
//                   className={`border px-3 py-2 rounded-lg w-full ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
//                 />
//                 {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <input
//                     value={city}
//                     onChange={(e) => {
//                       setCity(e.target.value);
//                       if (errors.city) setErrors({ ...errors, city: "" });
//                     }}
//                     placeholder="City"
//                     className={`border px-3 py-2 rounded-lg w-full ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
//                 </div>

//                 <div>
//                   <input
//                     value={zip}
//                     onChange={(e) => {
//                       setZip(e.target.value);
//                       if (errors.zip) setErrors({ ...errors, zip: "" });
//                     }}
//                     placeholder="ZIP / Postal Code (6 digits)"
//                     className={`border px-3 py-2 rounded-lg w-full ${errors.zip ? 'border-red-500' : 'border-gray-300'}`}
//                   />
//                   {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
//                 </div>
//               </div>
//             </div>

//             <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">
//               Payment Method
//             </h2>
//             <select
//               value={payment}
//               onChange={(e) => setPayment(e.target.value)}
//               className="border px-3 py-2 rounded-lg w-full"
//             >
//               <option>Credit / Debit Card</option>
//               <option>Cash on Delivery</option>
//               <option>UPI</option>
//             </select>


//             <div className="mt-8 border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Order Total</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   ₹ {finalTotal.toFixed(2)}
//                 </p>
//                 {discount > 0 && (
//                   <p className="text-sm text-green-600">
//                     (₹ {discount.toFixed(2)} discount applied)
//                   </p>
//                 )}
//               </div>
//               <button
//                 onClick={handleOrderNow}
//                 disabled={loading}
//                 className={`mt-4 sm:mt-0 px-8 py-3 ${loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-green-600 hover:bg-green-700"
//                   } text-white rounded-lg text-lg font-semibold transition`}
//               >
//                 {loading ? "Placing Order..." : "Place Order"}
//               </button>
//             </div>
//           </div>


//           <div className="bg-white rounded-2xl shadow-md p-6">
//             <h2 className="text-2xl font-semibold mb-4 text-gray-900">
//               Order Summary
//             </h2>

//             {/* Coupon Code Section */}
//             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//               <h3 className="text-lg font-medium mb-3 text-gray-900">Have a coupon?</h3>
//               {!appliedOffer ? (
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={couponCode}
//                     onChange={(e) => setCouponCode(e.target.value)}
//                     placeholder="Enter coupon code"
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                   <button
//                     onClick={applyCoupon}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//                   >
//                     Apply
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
//                   <div>
//                     <p className="font-medium text-green-800">{appliedOffer.title}</p>
//                     <p className="text-sm text-green-600">
//                       {appliedOffer.type === "percentage"
//                         ? `${appliedOffer.discountPercent}% off`
//                         : `$${appliedOffer.discountAmount} off`}
//                     </p>
//                   </div>
//                   <button
//                     onClick={removeCoupon}
//                     className="text-red-600 hover:text-red-800 font-medium"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-4 max-h-[500px] overflow-y-auto">
//               {selectedProducts.map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between border-b pb-3 last:border-0"
//                 >
//                   <div className="flex items-center gap-4">
//                     <img
//                       src={item.image}
//                       alt={item.team || item.name}
//                       className="w-20 h-20 object-contain rounded-lg border bg-gray-50"
//                     />
//                     <div>
//                       <p className="font-semibold text-gray-800">
//                         {item.team || item.name}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         ₹ {item.price} × {item.quantity}
//                       </p>
//                     </div>
//                   </div>
//                   <p className="text-blue-600 font-semibold">
//                     ₹ {(item.price * item.quantity).toFixed(2)}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <div className="border-t pt-4 space-y-3">
//               <div className="flex justify-between text-gray-600">
//                 <span>Subtotal</span>
//                 <span>₹ {subtotal.toFixed(2)}</span>
//               </div>
//               {discount > 0 && (
//                 <div className="flex justify-between text-green-600">
//                   <span>Discount ({appliedOffer?.title})</span>
//                   <span>-₹ {discount.toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
//                 <span>Total Amount</span>
//                 <span>₹ {finalTotal.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Checkout;
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

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

  selectedProducts = selectedProducts.map((item) => ({
    ...item,
    quantity: item.quantity || 1,
  }));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [payment, setPayment] = useState("Credit / Debit Card");
  const [loading, setLoading] = useState(false);

  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const clearCartCompletely = async (user) => {
    try {
      localStorage.setItem("cart", "[]");
      localStorage.removeItem("selectedItems");
      localStorage.removeItem("checkoutItems");

      if (user) {
        const userId = user._id || user.id;
        try {
          // Sync items back to server as empty
          await API.patch(`/cart/${userId}`, {
            items: [],
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Server cart clear failed:", err);
        }
      }

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Cart clearing failed:", err);
      toast.error("Something went wrong");
    }
  };

  const handleOrderNow = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products to order!");
      return;
    }

    setLoading(true);

    try {
      const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("currentUser"));

      const order = {
        userId: user?._id || user?.id || null,
        items: selectedProducts,
        total: subtotal,
        name,
        email,
        phone,
        address: `${address}, ${city} - ${zip}`,
        payment,
        status: "Pending",
        date: new Date().toISOString(),
      };

      await API.post("/orders", order);

      toast.success("Order placed successfully!");

      await clearCartCompletely(user);

      navigate("/orders");
    } catch (error) {
      toast.error("Something went wrong while placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-center mb-10">
          🧾 Checkout
        </h1>

        {selectedProducts.length === 0 ? (
          <div className="text-center text-slate-400 py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xl font-bold italic uppercase tracking-widest mb-6">No products selected for checkout.</p>
            <button
              onClick={() => navigate("/cart")}
              className="px-10 py-5 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all duration-300"
            >
              Back to Cart
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Shipping Details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">

              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">
                Shipping Details
              </h2>

              <div className="grid gap-5">

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Full Name</p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl w-full text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email Address</p>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl w-full text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Phone Number</p>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl w-full text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Street Address</p>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Main St"
                    className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl w-full text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">City</p>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. London"
                      className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl w-full text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">ZIP Code</p>
                    <input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="e.g. 123456"
                      className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl w-full text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>

                </div>

              </div>

              <h2 className="text-2xl font-black italic uppercase tracking-tighter mt-10 mb-5">
                Payment Method
              </h2>

              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl w-full text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer font-bold uppercase tracking-widest text-xs"
              >
                <option>Credit / Debit Card</option>
                <option>Cash on Delivery</option>
                <option>UPI</option>
              </select>

              <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-6">

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Amount</p>
                  <p className="text-3xl font-black italic text-slate-900">
                    ₹ {subtotal.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={handleOrderNow}
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order Now"}
                </button>

              </div>

            </div>

            {/* Order Summary */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm h-fit sticky top-24">

              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
                Order Summary
              </h2>

              <div className="space-y-6">

                {selectedProducts.map((item, index) => (

                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-sky-500/30 transition-all"
                  >

                    <div className="flex gap-4 items-center">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain bg-white border border-slate-100 rounded-xl p-2 group-hover:scale-110 transition-transform"
                      />

                      <div>
                        <p className="font-black italic uppercase tracking-tighter text-slate-900">
                          {item.name}
                        </p>

                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                          ₹ {item.price} × {item.quantity}
                        </p>
                      </div>

                    </div>

                    <p className="text-sky-600 font-black italic text-lg">
                      ₹ {(item.price * item.quantity).toFixed(2)}
                    </p>

                  </div>

                ))}

              </div>

              <div className="border-t border-slate-100 pt-6 mt-8 flex justify-between items-center">

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Payable</span>

                <span className="text-3xl font-black italic text-slate-900">
                  ₹ {subtotal.toFixed(2)}
                </span>

              </div>

              <p className="text-[10px] text-slate-400 text-center mt-6 font-bold uppercase tracking-widest">
                Safe & Secure Checkout
              </p>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Checkout;