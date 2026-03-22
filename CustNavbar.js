import React, { useState, useEffect } from "react";
import { Bell, UserCircle, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";
import API from "../services/api";

function CustNavbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Retrieve user info from storage
  const customerId = localStorage.getItem("customer_id") || "000000";
  const fullName = localStorage.getItem("full_name") || "Customer";

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/login");
  };

  /**
   * ✅ FETCH LOGIC
   * Retrieves notifications specifically for this Customer ID.
   * Path: /notifications/get/{id}
   */
  const fetchNotifications = async () => {
    try {
      const res = await API.get(`/notifications/get/${customerId}`);
      // Ensure we are working with an array
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Polling Error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 10 seconds to catch Admin approvals/declines in real-time
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [customerId]);

  // Only count notifications that haven't been 'read' yet
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="sticky top-0 z-30 flex justify-between items-center bg-slate-950/40 backdrop-blur-md border-b border-white/5 px-8 py-4">
      {/* Brand/Path Section */}
      <div className="flex flex-col text-left">
        <h2 className="text-lg font-bold text-white tracking-tight leading-none">Overview</h2>
        <p className="text-[9px] text-blue-500 uppercase tracking-[0.2em] font-black mt-1">
          Secure_Customer_Portal
        </p>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        
        {/* --- NOTIFICATION HUB --- */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all group ${
              showNotifications ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <Bell size={20} className={`${unreadCount > 0 ? "text-blue-400 animate-pulse" : "text-slate-400"} group-hover:text-white`} />
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-[#0a1628] font-black shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <Notifications 
              notifications={notifications} 
              setNotifications={setNotifications} 
              onClose={() => setShowNotifications(false)} 
              role="customer" 
            />
          )}
        </div>

        {/* --- ID BADGE (DYNAMIC) --- */}
        <div className="hidden sm:flex items-center bg-slate-900/50 border border-white/5 px-4 py-2 rounded-2xl shadow-inner">
          <div className="mr-3 p-1.5 bg-blue-500/10 rounded-lg">
            <Shield size={14} className="text-blue-500" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Authenticated_ID</span>
            <span className="text-xs font-mono font-bold text-slate-200 leading-none">#{customerId}</span>
          </div>
        </div>

        {/* --- PROFILE SECTION --- */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-white/5 bg-slate-800/20">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <UserCircle size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-200 text-sm tracking-tight hidden md:block">{fullName}</span>
        </div>

        {/* --- LOGOUT ACTION --- */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-all group px-2"
        >
          <div className="p-2 rounded-xl group-hover:bg-red-500/10 transition-colors border border-transparent group-hover:border-red-500/20">
            <LogOut size={18} />
          </div>
          <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">Exit_Session</span>
        </button>

      </div>
    </nav>
  );
}

export default CustNavbar;
