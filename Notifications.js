import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, ChevronRight, Circle, Trash2 } from 'lucide-react';
import axios from 'axios';

const Notifications = ({ notifications, onClose, role, setNotifications }) => {
  const navigate = useNavigate();

  // 1. Erase a single notification on click
  const handleItemClick = async (notif) => {
    try {
      // API call to permanently delete from DB
      await axios.delete(`http://127.0.0.1:8000/${role}/notifications/erase/${notif._id}`);
      
      // Update UI state immediately
      if (setNotifications) {
        setNotifications(prev => prev.filter(n => n._id !== notif._id));
      }

      // Redirect to the action page
      navigate(notif.link);
      onClose();
    } catch (e) {
      console.log("Error erasing notification");
      navigate(notif.link); // Still navigate so user can work
      onClose();
    }
  };

  // 2. Erase all notifications for this role/user
  const handleClearAll = async () => {
    try {
      const recipientId = role === "admin" ? "ADMIN" : localStorage.getItem("customer_id");
      await axios.delete(`http://127.0.0.1:8000/${role}/notifications/clear-all?recipient_id=${recipientId}`);
      
      if (setNotifications) setNotifications([]);
      onClose();
    } catch (e) {
      console.log("Error clearing notifications");
    }
  };

  return (
    <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10">
      {/* Header with Clear All Button */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell size={16} className="text-blue-400" /> Notifications
        </h3>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            <Trash2 size={10} /> Clear All
          </button>
        )}
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell size={32} className="mx-auto text-slate-700 mb-2 opacity-20" />
            <p className="text-xs text-slate-500 font-medium">All caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n._id} 
              onClick={() => handleItemClick(n)}
              className="p-4 border-b border-white/5 hover:bg-blue-600/10 cursor-pointer transition-all flex items-start gap-3 group text-left"
            >
              <div className="mt-1 flex-shrink-0">
                <Circle size={8} className="fill-blue-500 text-blue-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-xs leading-relaxed text-slate-200 font-medium group-hover:text-white transition-colors">
                  {n.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                   <span className="text-[9px] text-slate-600 flex items-center gap-1 uppercase font-bold tracking-widest">
                     <Clock size={10} /> {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   <ChevronRight size={12} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Small informative footer */}
      {notifications.length > 0 && (
        <div className="p-2 bg-slate-950/30 text-center border-t border-slate-800/50">
          <p className="text-[8px] text-slate-700 uppercase font-black tracking-tighter">Click to action & erase</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
