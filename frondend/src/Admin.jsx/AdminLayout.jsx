
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    window.dispatchEvent(new Event("userLoggedOut"));
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👤" },
    { name: "Products", path: "/admin/products", icon: "📦" },
    { name: "Orders", path: "/admin/orders", icon: "🧾" },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 transition-all duration-300">
      <aside
        className={`
          ${open ? "w-64" : "w-20"}
          bg-gray-900 border-r border-gray-800 shadow-2xl
          p-4 flex flex-col transition-all duration-300
        `}
      >
        <button
          className="text-2xl font-bold mb-8 hover:opacity-70 transition text-indigo-400"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <nav className="space-y-2 flex-1">
          {menuItems.map((menu) => (
            <Link
              key={menu.name}
              to={menu.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium
                ${location.pathname === menu.path
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <span className="text-xl">{menu.icon}</span>
              {open && <span>{menu.name}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          className="w-full px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-600 text-red-400 hover:text-white transition-all duration-300 font-semibold"
        >
          {open ? "Logout" : "🚪"}
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-auto bg-gray-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
