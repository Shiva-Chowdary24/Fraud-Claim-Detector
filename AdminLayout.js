import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ShieldAlert, Home, FileText, UserPlus, UserMinus, ScrollText, MessageSquare, ClipboardList, Menu } from "lucide-react"; 
import Notifications from "../components/Notifications";
import API from "../api"; // ✅ CRITICAL: Using our custom API instance that includes the 'role' header

function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // ✅ Updated Logout to clear all session data
  const logout = () => {
    localStorage.clear(); 
    navigate("/login", { replace: true });
  };

  // ✅ Fetch Admin Notifications using the 'API' instance
  const fetchAdminNotifs = async () => {
    try {
      // Because we use 'API', the 'role: admin' header is automatically attached
      const res = await API.get("/admin/notifications?recipient_id=ADMIN");
      setNotifications(res.data);
    } catch (err) {
      console.error("Auth Error in Admin Layout:", err.response?.status);
      if (err.response?.status === 403) {
        // If still 403, the 'role' in localStorage might be wrong or missing
        console.log("Access Denied: Check if 'role' is 'admin' in LocalStorage");
      }
    }
  };

  useEffect(() => {
    fetchAdminNotifs();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchAdminNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* --- TOP NAVBAR --- */}
      <div className="bg-slate-900 text-white flex justify-between items-center px-6 py-4 shadow-xl z-50 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <ShieldAlert size={24} className="text-emerald-400" />
          </div>
          <span className="tracking-tight">Insurance Admin <span className="text-emerald-400">Portal</span></span>
        </h1>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-slate-900 font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <Notifications 
                notifications={notifications} 
                setNotifications={setNotifications}
                onClose={() => setShowNotif(false)} 
                role="admin" 
              />
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>

          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-white">System Administrator</span>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Verified Session</span>
          </div>

          <button
            onClick={logout}
            className="bg-rose-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-rose-500 transition-all active:scale-95 shadow-lg shadow-rose-900/20"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- DYNAMIC SIDEBAR --- */}
        <div className={`bg-slate-900 text-slate-300 transition-all duration-500 ${open ? "w-72" : "w-20"} flex flex-col border-r border-slate-800 shadow-2xl`}>
          <div className="p-4 flex justify-center border-b border-slate-800/50 mb-4">
            <button 
              onClick={() => setOpen(!open)} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
            >
              <Menu size={24} />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
            <NavItem to="/admin/dashboard" icon={<Home size={20}/>} label="Dashboard Overview" open={open} />
            <NavItem to="/admin/Issue-policy" icon={<FileText size={20}/>} label="Issue New Policy" open={open} />
            <NavItem to="/admin/add" icon={<UserPlus size={20}/>} label="Add Dealer" open={open} />
            <NavItem to="/admin/delete" icon={<UserMinus size={20}/>} label="Manage Dealers" open={open} />
            <NavItem to="/admin/logs" icon={<ScrollText size={20}/>} label="Fraud Detection Logs" open={open} />
            <Link to="/admin/policy-requests" className={`flex items-center gap-4 p-3.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all group ${!open && "justify-center"}`}>
               <ClipboardList size={20} className="group-hover:scale-110 transition-transform"/>
               {open && <span className="font-medium flex-1 text-sm">Policy Requests</span>}
               {open && unreadCount > 0 && <span className="bg-emerald-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold">NEW</span>}
            </Link>
            <NavItem to="/admin/customer-queries" icon={<MessageSquare size={20}/>} label="Customer Support" open={open} />
            <NavItem to="/admin/audit-logs" icon={<ScrollText size={20}/>} label="System Audit Logs" open={open} />
          </nav>
        </div>

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="flex-1 bg-slate-50 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Child components render here */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Sub-component for Sidebar Links to keep code clean
const NavItem = ({ to, icon, label, open }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 p-3.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all group ${!open && "justify-center"}`}
  >
    <div className="group-hover:scale-110 transition-transform">{icon}</div>
    {open && <span className="font-medium text-sm tracking-wide">{label}</span>}
  </Link>
);

export default AdminLayout;
