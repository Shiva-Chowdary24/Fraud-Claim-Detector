import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ShieldAlert } from "lucide-react"; // Added Icons
import Notifications from "../components/Notifications";
import axios from "axios";

function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin-login");
  };

  // ✅ Fetch Admin Notifications (Global requests)
  const fetchAdminNotifs = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/notifications?recipient_id=ADMIN");
      setNotifications(res.data);
    } catch (err) {
      console.log("Error fetching admin notifications");
    }
  };

  useEffect(() => {
    fetchAdminNotifs();
    const interval = setInterval(fetchAdminNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="bg-blue-900 text-white flex justify-between items-center px-6 py-3 shadow-lg z-50">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert size={20} className="text-blue-300" />
          Insurance Management Portal
        </h1>

        <div className="flex items-center gap-8 mr-8">
          {/* ✅ Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 text-blue-200 hover:text-white transition-colors"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-blue-900 font-bold animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <Notifications 
                notifications={notifications} 
                onClose={() => setShowNotif(false)} 
                role="admin" 
              />
            )}
          </div>

          <span className="font-medium text-blue-100">Admin Panel</span>

          <button
            onClick={async () => { await logout(); navigate("/login", { replace: true }); }}
            className="bg-red-500 px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-red-600 transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`bg-gray-900 text-white transition-all duration-300 ${open ? "w-64 p-5" : "w-14 p-3"} min-h-screen`}>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 mb-6 cursor-pointer outline-none">
            <div className="flex flex-col gap-1">
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </div>
            {open && <span className="text-sm font-medium">Menu</span>}
          </button>

          {open && (
            <nav className="flex flex-col gap-2">
              <Link to="/admin/dashboard" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors">Home</Link>
              <Link to="/admin/Issue-policy" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors">Issue Policies</Link>
              <Link to="/admin/add" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors">Add Dealer</Link>
              <Link to="/admin/delete" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors">Delete Dealer</Link>
              <Link to="/admin/logs" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors">Fraud Logs</Link>
              <Link to="/admin/policy-requests" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors flex justify-between items-center">
                <span>Policy Requests</span>
                {unreadCount > 0 && <span className="bg-blue-500 text-[10px] px-1.5 py-0.5 rounded-full">New</span>}
              </Link>
              <Link to="/admin/customer-queries" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors">Customer Queries</Link>
              <Link to="/admin/audit-logs" className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors">Audit Logs</Link>
            </nav>
          )}
        </div>

        {/* Page Content */}
        <div className="flex-1 bg-gray-100 p-10 flex justify-center overflow-y-auto h-[calc(100vh-60px)]">
          <div className="w-full max-w-5xl bg-white p-10 rounded-3xl shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
