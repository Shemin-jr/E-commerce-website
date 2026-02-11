import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData");
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <aside className="w-72 bg-white border-r h-screen fixed shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold shadow-lg">
            A
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400">Administrator</div>
            <div className="text-sm font-semibold text-gray-900">
              {JSON.parse(localStorage.getItem('adminData') || '{}').name || 'Admin'}
            </div>
          </div>
        </div>
      </div>

      <nav className="p-4 flex flex-col gap-2">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z">
            </path>
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
            </path>
          </svg>
          Users
        </NavLink>
        <NavLink to="/admin/products" className={linkClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
            </path>
          </svg>
          Products
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z">
            </path>
          </svg>
          Orders
        </NavLink>

        <button 
          onClick={logout} 
          className="mt-6 flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
            </path>
          </svg>
          Logout
        </button>
      </nav>
    </aside>
  );
}
