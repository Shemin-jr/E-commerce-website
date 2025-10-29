
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if user exists in db.json (JSON Server)
      const res = await axios.get(
        `http://localhost:5000/users?email=${encodeURIComponent(
          email
        )}&password=${encodeURIComponent(password)}`
      );

      if (res.data && res.data.length === 1) {
        const user = res.data[0];

        // ✅ Store user in localStorage (both keys to support existing code)
        const userData = { id: user.id, name: user.name, email: user.email };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("currentUser", JSON.stringify(userData));

        // ✅ Trigger Navbar update
        window.dispatchEvent(new Event("userLoggedIn"));
          setEmail("");
        setPassword("");
        // ✅ Navigate to home
        navigate("/");
      } else {
        alert("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const serverMessage =
        error?.response?.data || error?.message || "Unknown error";
      alert(`Login failed: ${serverMessage}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-md text-white">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-white">
          Login to <span className="text-blue-500">Jerseyfy</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block font-medium mb-2 text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-white"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block font-medium mb-2 text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-white"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors font-bold py-3 rounded-lg shadow-md text-white"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <span
      onClick={() => navigate("/register")}
            className="text-blue-500 hover:underline font-medium cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
