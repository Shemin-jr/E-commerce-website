
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
    { name: "Orders", path: "/admin/orders", icon: "🧾" }
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 transition-all duration-300">
      <aside
        className={`
          ${open ? "w-64" : "w-20"}
          bg-white border-r border-gray-200 shadow-lg
          p-4 flex flex-col transition-all duration-300
        `}
      >
        <button
          className="text-2xl font-bold mb-8 hover:opacity-70 transition text-blue-600"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <nav className="space-y-3 flex-1">
          {menuItems.map((menu) => (
            <Link
              key={menu.name}
              to={menu.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium
                ${location.pathname === menu.path
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-blue-600"
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
          className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 font-semibold shadow-md"
        >
          {open ? "Logout" : "🚪"}
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
