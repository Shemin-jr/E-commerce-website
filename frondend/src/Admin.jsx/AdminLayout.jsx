import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaUsers,
  FaTshirt,
  FaReceipt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FaChartLine },
    { name: "Users", path: "/admin/users", icon: FaUsers },
    { name: "Products", path: "/admin/products", icon: FaTshirt },
    { name: "Orders", path: "/admin/orders", icon: FaReceipt },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`
          ${open ? "w-72" : "w-24"}
          bg-white border-r border-slate-200
          flex flex-col transition-all duration-500 ease-out z-20 shadow-[10px_0_40px_rgba(0,0,0,0.02)] relative
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-4 top-10 bg-white border border-slate-200 text-slate-400 p-2 rounded-full shadow-lg hover:scale-110 hover:text-blue-600 transition-all z-30"
        >
          {open ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* Logo Section */}
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-400 rounded-2xl flex items-center justify-center text-white font-black italic shadow-xl shadow-blue-100 ring-4 ring-blue-50/50">
            J
          </div>
          {open && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-black italic tracking-tighter text-slate-900"
            >
              JERSEY_VAULT<span className="text-blue-600">.</span>
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-6 space-y-3">
          {menuItems.map((menu) => {
            const Icon = menu.icon;
            const isActive = location.pathname === menu.path;

            return (
              <Link
                key={menu.name}
                to={menu.path}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 font-bold group
                  ${isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <Icon className={`text-xl ${isActive ? "text-white" : "group-hover:text-blue-600"} transition-colors`} />
                {open && <span className="tracking-wide uppercase text-[10px] tracking-[0.2em]">{menu.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black uppercase text-[10px] tracking-[0.2em]"
          >
            <FaSignOutAlt className="text-lg" />
            {open && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative bg-white">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#e2e8f0 1.2px, transparent 0)", backgroundSize: "40px 40px" }}
        />

        <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-10 px-10 py-6 flex justify-between items-center border-b border-slate-200/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Admin Workspace</span>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
              {menuItems.find(m => m.path === location.pathname)?.name || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-black italic text-slate-900">Administrator</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Access</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 font-black italic shadow-sm">
              A
            </div>
          </div>
        </header>

        <div className="p-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
