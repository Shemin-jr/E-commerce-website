import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/api";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const tempErrors = {};

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
        email: email.trim(),
        password: password,
      });

      if (res.data) {
        toast.success("Login successful!");
        const { token, refreshToken } = res.data;
        const user = { ...res.data };

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
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="Enter your email"
                className={`w-full rounded-2xl border bg-white/8 px-5 py-4 text-white outline-none transition placeholder:text-slate-400 ${errors.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  }`}
                required
              />
              {errors.email ? <p className="mt-2 text-xs text-red-400">{errors.email}</p> : null}
            </div>

            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder="Enter your password"
                className={`w-full rounded-2xl border bg-white/8 px-5 py-4 text-white outline-none transition placeholder:text-slate-400 ${errors.password
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  }`}
                required
              />
              {errors.password ? <p className="mt-2 text-xs text-red-400">{errors.password}</p> : null}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-4 text-lg font-bold text-white shadow-lg shadow-blue-950/40 transition"
            >
              Login
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Register
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
