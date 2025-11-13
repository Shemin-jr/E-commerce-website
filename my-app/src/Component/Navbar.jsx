

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes, FaHeart, FaBox } from "react-icons/fa";
import axios from "axios";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const navItems = ["Home", "Products"];

 
  const loadUser = useCallback(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));
    setUser(savedUser);
  }, []);

  
  const updateCounts = useCallback(async () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistCount(wishlist.length);

    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));

    if (storedUser) {
      try {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        const res = await axios.get(`http://localhost:5000/carts?userId=${storedUser.id}`);

        if (res.data && res.data.length > 0) {
          const latestCart = res.data.reduce((a, b) => {
            const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return ta >= tb ? a : b;
          }, res.data[0]);

          const serverItems = latestCart.items || [];

          
          if (localCart.length > serverItems.length) {
            await axios.patch(`http://localhost:5000/carts/${latestCart.id}`, {
              items: localCart,
              updatedAt: new Date().toISOString(),
            });
            setCartCount(localCart.length);
          } else {
            setCartCount(serverItems.length);
          }
        } else {
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];
          if (localCart.length > 0) {
            await axios.post(`http://localhost:5000/carts`, {
              userId: storedUser.id,
              items: localCart,
              updatedAt: new Date().toISOString(),
            });
            setCartCount(localCart.length);
          } else {
            setCartCount(0);
          }
        }
      } catch (err) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartCount(cart.length);
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
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

    setUser(null);
    setCartCount(0);
    setWishlistCount(0);

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    window.dispatchEvent(new Event("userLoggedOut"));

    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1a40] text-white p-4 flex justify-between items-center shadow-lg">
      
      <Link
        to="/"
        className="text-2xl md:text-3xl font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-white to-blue-400 drop-shadow-lg hover:scale-105 transition-transform duration-300"
      >
        Jerseyfy
      </Link>

      
      <ul className="hidden md:flex space-x-6 items-center">
        {navItems.map((item) => (
          <li key={item}>
            <Link
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="hover:text-yellow-400 transition-colors duration-200"
            >
              {item}
            </Link>
          </li>
        ))}

       
        <li className="relative">
          <Link
            to="/wishlist"
            className="hover:text-pink-500 flex items-center transition-colors duration-200"
          >
            <FaHeart className="mr-1" />
          
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5">
                {wishlistCount}
              </span>
            )}
          </Link>
        </li>

       
        <li className="relative">
          <Link
            to="/cart"
            className="hover:text-green-400 flex items-center transition-colors duration-200"
          >
            <FaShoppingCart className="mr-1" />
            
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-green-500 text-white text-xs font-bold rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </Link>
        </li>

        
        <li>
          <Link
            to="/orders"
            className="hover:text-yellow-400 flex items-center transition-colors duration-200"
          >
            <FaBox className="mr-1" /> Orders
          </Link>
        </li>

       
        {user ? (
          <>
            <li className="text-yellow-300 font-semibold">
              Hi, {user.name || user.email?.split("@")[0]}
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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
        {menuOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
      </div>

      
      <ul
        className={`md:hidden absolute top-full left-0 w-full bg-[#1a1a40] text-center flex flex-col space-y-4 py-4 transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        {navItems.map((item) => (
          <li key={item}>
            <Link
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="hover:text-yellow-400 block py-1 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          </li>
        ))}

        <li>
          <Link
            to="/wishlist"
            className="hover:text-pink-500 flex justify-center items-center transition-colors duration-200 relative"
            onClick={() => setMenuOpen(false)}
          >
            <FaHeart className="mr-1" /> Wishlist
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-[38%] bg-pink-500 text-white text-xs font-bold rounded-full px-1.5">
                {wishlistCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link
            to="/cart"
            className="hover:text-green-400 flex justify-center items-center transition-colors duration-200 relative"
            onClick={() => setMenuOpen(false)}
          >
            <FaShoppingCart className="mr-1" /> Cart
            {cartCount > 0 && (
              <span className="absolute top-0 right-[38%] bg-green-500 text-white text-xs font-bold rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link
            to="/orders"
            className="hover:text-yellow-400 flex justify-center items-center transition-colors duration-200"
            onClick={() => setMenuOpen(false)}
          >
            <FaBox className="mr-1" /> Orders
          </Link>
        </li>

        {user ? (
          <>
            <li className="text-yellow-300 font-semibold">
              Hi, {user.name || user.email?.split("@")[0]}
            </li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full inline-block transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full inline-block transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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


