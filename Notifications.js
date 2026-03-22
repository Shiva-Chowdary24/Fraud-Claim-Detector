import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, ChevronRight, Circle, Trash2 } from 'lucide-react';
import API from '../api'; // ✅ Using your custom API instance
import { toast } from 'react-toastify';

const Notifications = ({ notifications, onClose, role, setNotifications }) => {
  const navigate = useNavigate();

  // 1. Erase single notification on click
  const handleItemClick = async (notif) => {
    // Remove from UI immediately for speed
    if (setNotifications) {
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
    }

    try {
      await API.delete(`/${role}/notifications/erase/${notif._id}`);
    } catch (e) {
      console.error("Database sync failed");
    } finally {
      navigate(notif.link);
      onClose();
    }
  };

  // 2. Erase all notifications for current user/admin
  const handleClearAll = async () => {
    try {
      const recipientId = role === "admin" ? "ADMIN" : localStorage.getItem("customer_id");
      
      // Pass recipient_id as query param to match Python @app.delete
      await API.delete(`/${role}/notifications/clear-all`, {
        params: { recipient_id: recipientId }
      });
      
      if (setNotifications) setNotifications([]); 
      onClose();
      toast.success("Inbox cleared");
    } catch (e) {
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10">
      {/* Header */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell size={16} className="text-blue-400" /> Notifications
        </h3>
        {notifications.length > 0 && (
          <button onClick={handleClearAll} className="text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase flex items-center gap-1 transition-colors">
            <Trash2 size={10} /> Clear All
          </button>
        )}
      </div>
      
      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-slate-600">
            <Bell size={32} className="mx-auto mb-2 opacity-10" />
            <p className="text-xs">No new alerts</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} onClick={() => handleItemClick(n)} className="p-4 border-b border-white/5 hover:bg-blue-600/10 cursor-pointer flex items-start gap-3 group transition-all">
              <div className="mt-1"><Circle size={8} className="fill-blue-500 text-blue-500 animate-pulse" /></div>
              <div className="flex-1 text-left">
                <p className="text-xs text-slate-200 font-medium group-hover:text-white leading-relaxed">{n.message}</p>
                <div className="flex items-center justify-between mt-2">
                   <span className="text-[9px] text-slate-600 flex items-center gap-1 font-bold uppercase tracking-tighter">
                     <Clock size={10} /> {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                   </span>
                   <ChevronRight size={12} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
