import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""

  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };


  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { name, email, password } = formData;

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(" something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md text-white">
        <h1 className="text-4xl font-bold text-center mb-6">
          Register for <span className="text-blue-500">Jerseyfy</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <span
                className="absolute right-3 top-2 cursor-pointer text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <span
                className="absolute right-3 top-2 cursor-pointer text-gray-400"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "Hide" : "Show"}
              </span>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>


          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
