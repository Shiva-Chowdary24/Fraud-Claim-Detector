import React, { useState, useEffect } from "react";
import { Bell, UserCircle, LogOut, Shield } from "lucide-react"; // Added Shield icon
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";
import axios from "axios";
import { toast } from "react-toastify";

function CustNavbar() {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 🆔 Retrieve the new 6-digit ID and Username
  const customerId = localStorage.getItem("customer_id") || "000000";
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    // Clear all storage on logout
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("customer_id"); 
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/customer/notifications");
      setNotifications(res.data);

      res.data.forEach(n => {
        if (!n.read) {
          toast.success(n.message);
        }
      });
    } catch (err) {
      console.log("Error fetching notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="sticky top-0 z-30 flex justify-between items-center bg-slate-950/40 backdrop-blur-md border-b border-white/5 px-8 py-4">
      
      {/* Title Section */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-white tracking-tight">Overview</h2>
        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">
          Customer Portal
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 md:gap-8">

        {/* --- 🆔 UNIQUE CUSTOMER ID BADGE --- */}
        <div className="hidden sm:flex items-center bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-xl hover:border-blue-500/40 transition-all cursor-default">
          <div className="mr-2.5 p-1 bg-blue-500/20 rounded-md">
            <Shield size={12} className="text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-0.5">
              Cust ID
            </span>
            <span className="text-xs font-mono font-bold text-blue-400 leading-none">
              #{customerId}
            </span>
          </div>
        </div>

        {/* 🔔 Notification Bell */}
        <div className="relative">
          <div
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer group"
          >
            <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors">
              <Bell size={20} className="text-slate-400 group-hover:text-white" />
            </div>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifications && (
            <Notifications onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/5 bg-slate-800/30">
          <UserCircle size={24} className="text-blue-400" />
          <span className="font-medium text-slate-200 text-sm">{username}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-medium text-sm transition-all group"
        >
          <div className="p-2 rounded-lg group-hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
          </div>
          <span className="hidden lg:block">Logout</span>
        </button>

      </div>
    </nav>
  );
}

export default CustNavbar;
