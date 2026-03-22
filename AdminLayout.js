import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api"; 

function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear(); 
    navigate("/login", { replace: true });
  };

  const fetchAdminNotifs = async () => {
    try {
      const res = await API.get("/admin/notifications?recipient_id=ADMIN");
      setNotifications(res.data);
    } catch (err) {
      console.error("Auth Error:", err.response?.status);
    }
  };

  useEffect(() => {
    fetchAdminNotifs();
    const interval = setInterval(fetchAdminNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col font-mono bg-black text-white">
      
      {/* --- TOP NAVBAR --- */}
      <div className="bg-black border-b border-white flex justify-between items-center px-6 py-4 z-50">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tracking-tighter uppercase">Admin_Portal</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end border-r border-white pr-6">
            <span className="text-xs uppercase font-bold text-gray-400">Authenticated as</span>
            <span className="text-sm font-bold">ROOT_ADMIN</span>
          </div>

          <div className="relative group">
            <span className="text-sm font-bold cursor-default">
              Alerts: [{unreadCount}]
            </span>
          </div>

          <button
            onClick={logout}
            className="border border-white px-4 py-1 text-xs font-bold uppercase hover:bg-white hover:text-black transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- SIDEBAR --- */}
        <div className={`bg-black border-r border-white transition-all duration-300 ${open ? "w-64" : "w-16"} flex flex-col`}>
          <div className="p-4 border-b border-white flex justify-center">
            <button 
              onClick={() => setOpen(!open)} 
              className="text-xl hover:scale-110 transition-transform"
            >
              {open ? "«" : "»"}
            </button>
          </div>

          <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
            <NavItem to="/admin/dashboard" label="Dashboard" open={open} sym="■" />
            <NavItem to="/admin/Issue-policy" label="Issue Policy" open={open} sym="✚" />
            <NavItem to="/admin/add" label="Add Dealer" open={open} sym="+" />
            <NavItem to="/admin/delete" label="Remove Dealer" open={open} sym="-" />
            
            <Link to="/admin/policy-requests" className="flex items-center gap-4 px-6 py-3 hover:bg-white hover:text-black transition-all">
               <span>⚡</span>
               {open && <span className="text-xs font-bold uppercase flex-1">Requests</span>}
               {open && unreadCount > 0 && <span>!</span>}
            </Link>

            <NavItem to="/admin/audit-logs" label="Audit Logs" open={open} sym="◈" />
          </nav>
        </div>

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="flex-1 bg-black p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* The inner content container is also black with a white border */}
            <div className="bg-black border border-white p-8 min-h-[80vh]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Simple NavItem using text symbols
const NavItem = ({ to, label, open, sym }) => (
  <Link 
    to={to} 
    className="flex items-center gap-4 px-6 py-3 hover:bg-white hover:text-black transition-all"
  >
    <span className="text-lg">{sym}</span>
    {open && <span className="text-xs font-bold uppercase tracking-widest">{label}</span>}
  </Link>
);

export default AdminLayout;
