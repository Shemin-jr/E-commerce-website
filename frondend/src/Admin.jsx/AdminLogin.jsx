import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";


export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      const user = res.data;

      if (user.role !== "admin") {
        toast.error("Access denied. Not an admin account.");
        return;
      }

      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminData", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user)); // Sync with Navbar
      localStorage.setItem("token", user.token);

      toast.success("Admin Login successful!");
      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error(" something went wrong ");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-xl font-bold text-center mb-4">Admin Login</h2>

        <input className="w-full p-2 border rounded mt-4" type="email"
          placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <input className="w-full p-2 border rounded mt-4" type="password"
          placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="w-full bg-blue-600 text-white py-2 rounded mt-6 hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
