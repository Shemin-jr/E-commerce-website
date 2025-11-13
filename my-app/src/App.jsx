
// import React from "react";
// import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// // User Pages
// import Home from "./Pages/Home";
// import Products from "./Pages/Products";
// import Login from "./Pages/Login";
// import Register from "./Pages/Register";
// import Cart from "./Pages/Cart";
// import ViewProduct from "./Pages/ViewProduct";
// import Checkout from "./Pages/Checkout";
// import Orders from "./Pages/Orders";
// import Wishlist from "./Pages/Wishlist";

// // Admin Pages
// import AdminLogin from "./Admin.jsx/AdminLogin";
// import AdminMainDashboard from "./Admin.jsx/AdminMainDashboard";
// import AdminUsers from "./Admin.jsx/AdminUsers";
// import AdminProducts from "./Admin.jsx/AdminProducts";
// import AdminOrders from "./Admin.jsx/AdminOrders";
// import AdminLayout from "./Admin.jsx/AdminLayout";

// // Components
// import Navbar from "./Component/Navbar";

// // ✅ Admin Protected Route
// function AdminPrivateRoute({ children }) {
//   const isAdmin = localStorage.getItem("isAdmin");
//   const adminData = localStorage.getItem("adminData");
//   return isAdmin && adminData ? children : <Navigate to="/admin/login" replace />;
// }

// function AppRouter() {
//   const location = useLocation();
//   const hideNavbar = location.pathname.startsWith("/admin");

//   return (
//     <>
//       {!hideNavbar && <Navbar />}

//       <Routes>
//         {/* ✅ USER ROUTES */}
//         <Route path="/" element={<Home />} />
//         <Route path="/products" element={<Products />} />
//         <Route path="/product/:id" element={<ViewProduct />} />
//         <Route path="/cart" element={<Cart />} />
//         <Route path="/wishlist" element={<Wishlist />} />
//         <Route path="/checkout" element={<Checkout />} />
//         <Route path="/orders" element={<Orders />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* ✅ ADMIN LOGIN (Public) */}
//         <Route path="/admin/login" element={<AdminLogin />} />

//         {/* ✅ PROTECTED ADMIN ROUTES */}
//         <Route
//           path="/admin/dashboard"
//           element={
//             <AdminPrivateRoute>
//               <AdminLayout>
//                 <AdminMainDashboard />
//               </AdminLayout>
//             </AdminPrivateRoute>
//           }
//         />
//         <Route
//           path="/admin/users"
//           element={
//             <AdminPrivateRoute>
//               <AdminLayout>
//                 <AdminUsers />
//               </AdminLayout>
//             </AdminPrivateRoute>
//           }
//         />
//         <Route
//           path="/admin/products"
//           element={
//             <AdminPrivateRoute>
//               <AdminLayout>
//                 <AdminProducts />
//               </AdminLayout>
//             </AdminPrivateRoute>
//           }
//         />
//         <Route
//           path="/admin/orders"
//           element={
//             <AdminPrivateRoute>
//               <AdminLayout>
//                 <AdminOrders />
//               </AdminLayout>
//             </AdminPrivateRoute>
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <AppRouter />
//     </Router>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// User Pages
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Cart from "./Pages/Cart";
import ViewProduct from "./Pages/ViewProduct";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import Wishlist from "./Pages/Wishlist";

// Admin Pages
import AdminLogin from "./Admin.jsx/AdminLogin";
import AdminMainDashboard from "./Admin.jsx/AdminMainDashboard";
import AdminUsers from "./Admin.jsx/AdminUsers";
import AdminProducts from "./Admin.jsx/AdminProducts";
import AdminOrders from "./Admin.jsx/AdminOrders";
import AdminLayout from "./Admin.jsx/AdminLayout";

// Components
import Navbar from "./Component/Navbar";

// Admin Protected Route
function AdminPrivateRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin");
  const adminData = localStorage.getItem("adminData");
  return isAdmin && adminData ? children : <Navigate to="/admin/login" replace />;
}

function AppRouter() {
  const location = useLocation();

 
  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      
      {!hideNavbar && <Navbar />}

      <Routes>
       
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ViewProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

       
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminPrivateRoute>
              <AdminLayout>
                <AdminMainDashboard />
              </AdminLayout>
            </AdminPrivateRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminPrivateRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminPrivateRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminPrivateRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </AdminPrivateRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminPrivateRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </AdminPrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;
