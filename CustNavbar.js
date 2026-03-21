import React, { useState, useEffect } from "react";
import { Bell, UserCircle, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";
import axios from "axios";
import { toast } from "react-toastify";

function CustNavbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Pulling the correct keys from localStorage
  const customerId = localStorage.getItem("customer_id") || "000000";
  const fullName = localStorage.getItem("full_name") || "Customer";

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/customer/notifications");
      setNotifications(res.data);
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
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-white tracking-tight">Overview</h2>
        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">Customer Portal</p>
      </div>

      <div className="flex items-center gap-6 md:gap-8">
        {/* ID Badge */}
        <div className="hidden sm:flex items-center bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-xl">
          <div className="mr-2.5 p-1 bg-blue-500/20 rounded-md">
            <Shield size={12} className="text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-0.5">Cust ID</span>
            <span className="text-xs font-mono font-bold text-blue-400 leading-none">#{customerId}</span>
          </div>
        </div>

        {/* Profile with Name */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl border border-white/5 bg-slate-800/30">
          <UserCircle size={22} className="text-blue-400" />
          <span className="font-bold text-slate-100 text-sm tracking-tight">{fullName}</span>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-all">
          <LogOut size={18} />
          <span className="hidden lg:block text-sm font-medium">Logout</span>
        </button>
      </div>

      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
    </nav>
  );
}

export default CustNavbar;
