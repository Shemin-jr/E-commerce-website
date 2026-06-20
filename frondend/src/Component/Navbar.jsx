

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes, FaHeart, FaBox } from "react-icons/fa";
import API from "../api/api";

function readStorageJson(key, fallback = null) {
  try {
    const rawValue = localStorage.getItem(key);

    if (!rawValue || rawValue === "undefined" || rawValue === "null") {
      return fallback;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Skipping invalid localStorage value for ${key}`, error);
    return fallback;
  }
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const navItems = ["Home", "Products"];


  const loadUser = useCallback(() => {
    const savedUser =
      readStorageJson("user") ||
      readStorageJson("currentUser");
    setUser(savedUser);
  }, []);


  const updateCounts = useCallback(async () => {
    const wishlist = readStorageJson("wishlist", []);
    setWishlistCount(wishlist.length);

    const storedUser =
      readStorageJson("user") ||
      readStorageJson("currentUser");

    // Get local cart once
    const localCartRaw = localStorage.getItem("cart");
    const localCart = readStorageJson("cart", []);

    // Update count immediately for better UX
    setCartCount(localCart.length);

    if (storedUser) {
      try {
        const userId = storedUser._id || storedUser.id;
        const res = await API.get(`/cart?userId=${userId}`);

        if (res.data && res.data.length > 0) {
          const latestCart = res.data.reduce((a, b) => {
            const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return ta >= tb ? a : b;
          }, res.data[0]);

          const serverItems = latestCart.items || [];

          // If local has more items, push them to server
          if (localCart.length > serverItems.length) {
            await API.patch(`/cart/${userId}`, {
              items: localCart,
              updatedAt: new Date().toISOString(),
            });
          }

          if (localCartRaw === null && serverItems.length > 0) {
            localStorage.setItem("cart", JSON.stringify(serverItems));
            setCartCount(serverItems.length);
          }
        } else {
          if (localCart.length > 0) {
            await API.patch(`/cart/${userId}`, {
              items: localCart,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Error syncing cart counts:", err);
      }
    }
  }, []);


  useEffect(() => {
    loadUser();
    updateCounts();

    const refreshAll = () => {

      loadUser();
      updateCounts();
    };

    window.addEventListener("wishlistUpdated", refreshAll);
    window.addEventListener("cartUpdated", refreshAll);
    window.addEventListener("userLoggedIn", refreshAll);
    window.addEventListener("userLoggedOut", refreshAll);

    return () => {
      window.removeEventListener("wishlistUpdated", refreshAll);
      window.removeEventListener("cartUpdated", refreshAll);
      window.removeEventListener("userLoggedIn", refreshAll);
      window.removeEventListener("userLoggedOut", refreshAll);
    };
  }, [loadUser, updateCounts]);


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData");
    localStorage.removeItem("token");

    setUser(null);
    setCartCount(0);
    setWishlistCount(0);

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    window.dispatchEvent(new Event("userLoggedOut"));

    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-sky-300/10 bg-[linear-gradient(90deg,rgba(7,18,35,0.94),rgba(12,24,43,0.88),rgba(7,18,35,0.94))] px-4 py-3 text-white shadow-[0_18px_50px_rgba(2,6,23,0.32)] backdrop-blur-xl">

      <Link
        to="/"
        className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
      >

        <span className="text-xl font-black lowercase tracking-[0.06em] text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-blue-400 drop-shadow-lg md:text-2xl">
          Jersey_vault
        </span>
      </Link>


      <ul className="hidden md:flex space-x-5 items-center">
        {navItems.map((item) => (
          <li key={item}>
            <Link
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors duration-200 hover:text-sky-300"
            >
              {item}
            </Link>
          </li>
        ))}


        <li className="relative">
          <Link
            to="/wishlist"
            className="flex items-center text-slate-200 transition-colors duration-200 hover:text-sky-300"
          >
            <FaHeart className="mr-1" />

            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-3 rounded-full bg-cyan-400 px-1.5 text-xs font-bold text-slate-950">
                {wishlistCount}
              </span>
            )}
          </Link>
        </li>


        <li className="relative">
          <Link
            to="/cart"
            className="flex items-center text-slate-200 transition-colors duration-200 hover:text-sky-300"
          >
            <FaShoppingCart className="mr-1" />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 rounded-full bg-emerald-400 px-1.5 text-xs font-bold text-slate-950">
                {cartCount}
              </span>
            )}
          </Link>
        </li>


        <li>
          <Link
            to="/orders"
            className="flex items-center text-slate-200 transition-colors duration-200 hover:text-sky-300"
          >
            <FaBox className="mr-1" /> Orders
          </Link>
        </li>


        {user ? (
          <>
            <li className="font-semibold text-sky-200">
              Hi, {user.name || user.email?.split("@")[0]}
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-red-500 hover:shadow-lg"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link
              to="/login"
              className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Login
            </Link>
          </li>
        )}
      </ul>


      <div
        className="md:hidden cursor-pointer z-50"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </div>


      <ul
        className={`absolute left-0 top-full flex w-full flex-col space-y-4 overflow-hidden border-b border-white/10 bg-[rgba(6,14,27,0.96)] py-4 text-center backdrop-blur-xl transition-all duration-300 md:hidden ${menuOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        {navItems.map((item) => (
          <li key={item}>
            <Link
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="block py-1 text-sm font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors duration-200 hover:text-sky-300"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          </li>
        ))}

        <li>
          <Link
            to="/wishlist"
            className="relative flex items-center justify-center text-slate-200 transition-colors duration-200 hover:text-sky-300"
            onClick={() => setMenuOpen(false)}
          >
            <FaHeart className="mr-1" /> Wishlist
            {wishlistCount > 0 && (
              <span className="absolute right-[38%] top-0 rounded-full bg-cyan-400 px-1.5 text-xs font-bold text-slate-950">
                {wishlistCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link
            to="/cart"
            className="relative flex items-center justify-center text-slate-200 transition-colors duration-200 hover:text-sky-300"
            onClick={() => setMenuOpen(false)}
          >
            <FaShoppingCart className="mr-1" /> Cart
            {cartCount > 0 && (
              <span className="absolute right-[38%] top-0 rounded-full bg-emerald-400 px-1.5 text-xs font-bold text-slate-950">
                {cartCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link
            to="/orders"
            className="flex items-center justify-center text-slate-200 transition-colors duration-200 hover:text-sky-300"
            onClick={() => setMenuOpen(false)}
          >
            <FaBox className="mr-1" /> Orders
          </Link>
        </li>

        {user ? (
          <>
            <li className="font-semibold text-sky-200">
              Hi, {user.name || user.email?.split("@")[0]}
            </li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="inline-block rounded-full border border-white/10 bg-white/8 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-red-500 hover:shadow-lg"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link
              to="/login"
              className="inline-block rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
