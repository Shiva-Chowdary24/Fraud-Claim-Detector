import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ShieldAlert, Home, FileText, UserPlus, UserMinus, ScrollText, MessageSquare, ClipboardList, Menu } from "lucide-react"; 
import Notifications from "../components/Notifications";
import API from "../api"; 

function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
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
      console.error("Auth Error in Admin Layout:", err.response?.status);
    }
  };

  useEffect(() => {
    fetchAdminNotifs();
    const interval = setInterval(fetchAdminNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    // ✅ Changed main wrapper to bg-slate-950 (Near Black)
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-200">
      
      {/* --- TOP NAVBAR --- */}
      <div className="bg-slate-900 text-white flex justify-between items-center px-6 py-4 shadow-2xl z-50 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <ShieldAlert size={24} className="text-emerald-400" />
          </div>
          <span className="tracking-tight text-white">Insurance Admin <span className="text-emerald-400">Portal</span></span>
        </h1>

        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-slate-900 font-bold">
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

          <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>

          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-white">System Administrator</span>
            <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">Secure Session</span>
          </div>

          <button
            onClick={logout}
            className="bg-rose-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-rose-500 transition-all active:scale-95 shadow-lg shadow-rose-900/40"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- SIDEBAR --- */}
        <div className={`bg-slate-900 text-slate-400 transition-all duration-500 ${open ? "w-72" : "w-20"} flex flex-col border-r border-slate-800 shadow-2xl`}>
          <div className="p-4 flex justify-center border-b border-slate-800/50 mb-4">
            <button 
              onClick={() => setOpen(!open)} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
            >
              <Menu size={24} />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
            <NavItem to="/admin/dashboard" icon={<Home size={20}/>} label="Dashboard" open={open} />
            <NavItem to="/admin/Issue-policy" icon={<FileText size={20}/>} label="Issue Policy" open={open} />
            <NavItem to="/admin/add" icon={<UserPlus size={20}/>} label="Add Dealer" open={open} />
            <NavItem to="/admin/delete" icon={<UserMinus size={20}/>} label="Manage Dealers" open={open} />
            <NavItem to="/admin/logs" icon={<ScrollText size={20}/>} label="Fraud Logs" open={open} />
            
            <Link to="/admin/policy-requests" className={`flex items-center gap-4 p-3.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all group ${!open && "justify-center"}`}>
               <ClipboardList size={20} className="group-hover:scale-110 transition-transform"/>
               {open && <span className="font-medium flex-1 text-sm tracking-wide">Policy Requests</span>}
               {open && unreadCount > 0 && <span className="bg-emerald-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold">NEW</span>}
            </Link>

            <NavItem to="/admin/customer-queries" icon={<MessageSquare size={20}/>} label="Queries" open={open} />
            <NavItem to="/admin/audit-logs" icon={<ScrollText size={20}/>} label="Audit Logs" open={open} />
          </nav>
        </div>

        {/* --- MAIN PAGE CONTENT --- */}
        {/* ✅ Changed background to bg-slate-950 and container to bg-slate-900 */}
        <main className="flex-1 bg-slate-950 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl min-h-[80vh] text-slate-200">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

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
