
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();




  const validate = () => {
    let tempErrors = {};
    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      tempErrors.password = "Password is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      if (res.data) {
        toast.success("Login successful!");
        const { token, refreshToken } = res.data;
        const user = { ...res.data }; // Keep everything including tokens

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        if (user.role === "admin") {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminData", JSON.stringify(user));
          navigate("/admin/dashboard");
        } else {
          localStorage.setItem("isAdmin", "false");
          navigate("/");
        }

        window.dispatchEvent(new Event("userLoggedIn"));
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error);
      const serverMsg = error.response?.data?.message || " something went wrong ";
      toast.error(serverMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-md text-white">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-white">
          Login to <span className="text-blue-500">Jerseyfy</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

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
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-white`}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>


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
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-white`}
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors font-bold py-3 rounded-lg shadow-md text-white"
          >
            Login
          </button>
        </form>


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
