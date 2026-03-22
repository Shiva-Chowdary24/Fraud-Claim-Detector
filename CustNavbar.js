import React, { useState, useEffect } from "react";
import { Bell, UserCircle, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";
import API from "../api"; // ✅ Use your custom API instance for consistency

function CustNavbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Default to ADMIN if it's an admin portal, or the stored ID for customers
  const customerId = localStorage.getItem("customer_id") || "000000";
  const fullName = localStorage.getItem("full_name") || "Customer";

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      // ✅ FIX: Match your FastAPI Path Parameter: /notifications/get/{id}
      const res = await API.get(`/notifications/get/${customerId}`);
      setNotifications(res.data);
    } catch (err) {
      console.log("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling every 10 seconds to check for new approvals
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [customerId]);

  // If you don't have a "read" boolean in DB, just use notifications.length
  const unreadCount = notifications.length;

  return (
    <nav className="sticky top-0 z-30 flex justify-between items-center bg-slate-950/40 backdrop-blur-md border-b border-white/5 px-8 py-4">
      <div className="flex flex-col text-left">
        <h2 className="text-lg font-bold text-white tracking-tight">Overview</h2>
        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">Customer Portal</p>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-white/5 transition-colors group"
          >
            <Bell size={20} className="text-slate-400 group-hover:text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-slate-950 font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <Notifications 
              notifications={notifications} 
              setNotifications={setNotifications} // ✅ REQUIRED for "Clear All" logic
              onClose={() => setShowNotifications(false)} 
              role="customer" 
            />
          )}
        </div>

        {/* ID Badge */}
        <div className="hidden sm:flex items-center bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-xl">
          <div className="mr-2.5 p-1 bg-blue-500/20 rounded-md">
            <Shield size={12} className="text-blue-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-0.5">Cust ID</span>
            <span className="text-xs font-mono font-bold text-blue-400 leading-none">#{customerId}</span>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl border border-white/5 bg-slate-800/30">
          <UserCircle size={22} className="text-blue-400" />
          <span className="font-bold text-slate-100 text-sm tracking-tight">{fullName}</span>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-all group">
          <div className="p-2 rounded-lg group-hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
          </div>
          <span className="hidden lg:block text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default CustNavbar;
