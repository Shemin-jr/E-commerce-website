
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData");
    navigate("/", { replace: true });
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👤" },
    { name: "Products", path: "/admin/products", icon: "📦" },
    { name: "Orders", path: "/admin/orders", icon: "🧾" }
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-black transition-all duration-300">

   
      <aside
        className={`
          ${open ? "w-64" : "w-20"}
          bg-white border-r border-gray-200 shadow-xl
          p-4 flex flex-col transition-all duration-300
        `}
      >
        
        <button
          className="text-2xl font-bold mb-6 hover:opacity-70 transition"
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
                flex items-center gap-3 px-4 py-2 rounded-xl transition font-medium
                ${
                  location.pathname === menu.path
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-gray-200"
                }
              `}
            >
              <span className="text-lg">{menu.icon}</span>
              {open && <span>{menu.name}</span>}
            </Link>
          ))}
        </nav>

        
        <button
          onClick={logout}
          className="w-full px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition font-medium"
        >
          Logout
        </button>
      </aside>


      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

