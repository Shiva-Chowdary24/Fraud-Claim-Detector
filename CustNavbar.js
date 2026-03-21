import React, { useState, useEffect } from "react";
import { Bell, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";
import axios from "axios";
import { toast } from "react-toastify";

function CustNavbar() {

  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // 🔥 Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/customer/notifications");
      setNotifications(res.data);

      // 🔔 Show toast for unread
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

    // 🔄 Auto refresh every 10 sec (optional)
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  // 🔴 Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="sticky top-0 z-30 flex justify-between items-center bg-slate-950/40 backdrop-blur-md border-b border-white/5 px-8 py-4">
      
      {/* Title */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-white tracking-tight">Overview</h2>
        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">
          Customer Portal
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-8">

        {/* 🔔 Notification Bell */}
        <div className="relative">

          <div
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer group"
          >
            <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors">
              <Bell size={20} className="text-slate-400 group-hover:text-white" />
            </div>

            {/* 🔴 Unread Count Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}

          </div>

          {/* Dropdown */}
          {showNotifications && (
            <Notifications onClose={() => setShowNotifications(false)} />
          )}

        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/5 bg-slate-800/30">
          <UserCircle size={24} className="text-blue-400" />
          <span className="font-medium text-slate-200 text-sm">{username}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-medium text-sm transition-all group"
        >
          <div className="p-2 rounded-lg group-hover:bg-red-500/10">
            <LogOut size={18} />
          </div>
          <span className="hidden md:block">Logout</span>
        </button>

      </div>
    </nav>
  );
}

export default CustNavbar;
