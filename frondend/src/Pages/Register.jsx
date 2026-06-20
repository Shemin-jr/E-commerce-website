import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const tempErrors = {};

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
        name: name.trim(),
        email: email.trim(),
        password,
      });

      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      const serverMsg = error.response?.data?.message || "Something went wrong";
      toast.error(serverMsg);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i2f9m2t2.rocketcdn.me/wp-content/uploads/2020/01/Singapore-Liverpool-FC-Store-Club-Jerseys-1024x564.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.78),rgba(2,6,23,0.88))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.14),transparent_30%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md rounded-[30px] border border-white/10 bg-[rgba(10,18,34,0.82)] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10"
        >
          <h1 className="mb-8 text-center text-4xl font-black text-white">
            Register
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-white/8 px-5 py-4 text-white outline-none transition placeholder:text-slate-400 ${errors.name
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  }`}
              />
              {errors.name ? <p className="mt-2 text-xs text-red-400">{errors.name}</p> : null}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-white/8 px-5 py-4 text-white outline-none transition placeholder:text-slate-400 ${errors.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  }`}
              />
              {errors.email ? <p className="mt-2 text-xs text-red-400">{errors.email}</p> : null}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-white/8 px-5 py-4 pr-20 text-white outline-none transition placeholder:text-slate-400 ${errors.password
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  }`}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-cyan-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              {errors.password ? <p className="mt-2 text-xs text-red-400">{errors.password}</p> : null}
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-white/8 px-5 py-4 pr-20 text-white outline-none transition placeholder:text-slate-400 ${errors.confirmPassword
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  }`}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-cyan-300"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
              {errors.confirmPassword ? <p className="mt-2 text-xs text-red-400">{errors.confirmPassword}</p> : null}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-4 text-lg font-bold text-white shadow-lg shadow-blue-950/40 transition"
            >
              Register
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Login
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
