import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");          

    try {
      const res = await axios.get(`${API_URL}/admins`);
      const admin = res.data.find(a => a.email === email && a.password === password);

      if (!admin) return setError("Invalid email or password");   

      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminData", JSON.stringify(admin));

      navigate("/admin/dashboard", { replace: true }); 
    } catch {
      setError("Server error. Please ensure JSON server is running.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-xl font-bold text-center mb-4">Admin Login</h2>

        {error && <p className="text-red-600 text-center mb-2">{error}</p>}

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
