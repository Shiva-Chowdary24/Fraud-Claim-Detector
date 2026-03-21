// src/components/Login.jsx
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  X,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("login");
  const [loading, setLoading] = useState(false);

  const { setShowLogin, backendUrl } = useContext(AppContext);

  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errorMsg) setErrorMsg("");
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMsg) setErrorMsg("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); 

    try {
      let endpoint = "/customer/login";
      if (state === "signup") endpoint = "/customer/register";
      if (state === "admin") endpoint = "/admin/login";

      const { data } = await axios.post(backendUrl + endpoint, { email, password });

      if (data?.message) {
        // ✅ Store Email
        localStorage.setItem("email", email);

        // ✅ Store the 6-digit Customer ID from the Backend
        if (data.customer_id) {
          localStorage.setItem("customer_id", data.customer_id);
        }

        setShowLogin?.(false);

        if (state === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/customer/dashboard");
        }
      } else {
        setErrorMsg("Invalid credentials");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 401) {
        setErrorMsg("Invalid credentials");
      } else {
        setErrorMsg("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(2, 6, 23, 0.85), rgba(2, 6, 23, 0.85)), url('/images/bg.jpg')",
        }}
      />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <form
          onSubmit={onSubmitHandler}
          className={`relative bg-slate-900/60 backdrop-blur-xl border p-8 md:p-10 rounded-3xl shadow-2xl text-slate-300 transition-all duration-500 ${
            state === "admin" ? "border-emerald-500/40" : "border-white/10"
          }`}
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-500 ${
                state === "admin"
                  ? "bg-emerald-600/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-blue-600/20 border-blue-500/30"
              }`}
            >
              {state === "admin" ? (
                <ShieldAlert className="text-emerald-400 w-7 h-7" />
              ) : (
                <ShieldCheck className="text-blue-400 w-7 h-7" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight">
              {state === "admin"
                ? "Admin Portal"
                : state === "login"
                ? "Welcome Back"
                : "Join Us"}
            </h1>
            <p className="text-slate-400 text-sm mt-2 text-center">
              {state === "admin" ? "Authorized Personnel Only" : "Protecting your future with AI"}
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div className="text-sm font-medium">{errorMsg}</div>
            </motion.div>
          )}

          <div className="space-y-4">
            {state === "signup" && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  value={name}
                  type="text"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 text-white placeholder:text-slate-600"
                  placeholder="Full Name"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                onChange={handleEmailChange}
                value={email}
                type="email"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 text-white placeholder:text-slate-600"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                onChange={handlePasswordChange}
                value={password}
                type="password"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 text-white placeholder:text-slate-600"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full font-bold py-3.5 rounded-xl mt-8 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
              state === "admin"
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 text-white"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 text-white"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {state === "login" ? "Sign In" : state === "admin" ? "Admin Login" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-8 text-center space-y-4">
            {state === "admin" ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setState("login");
                }}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                ← Back to User Login
              </button>
            ) : (
              <>
                <p className="text-sm text-slate-400">
                  {state === "login" ? "New here?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setState(state === "login" ? "signup" : "login");
                    }}
                    className="text-blue-400 ml-1.5 font-bold hover:underline"
                  >
                    {state === "login" ? "Create Account" : "Sign In"}
                  </button>
                </p>
                <div className="pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setState("admin");
                    }}
                    className="text-xs uppercase tracking-widest text-emerald-500 font-bold hover:text-emerald-400 transition-colors"
                  >
                    Admin Login
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
