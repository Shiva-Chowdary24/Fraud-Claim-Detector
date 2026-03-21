import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, ChevronRight, Circle, Trash2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Notifications = ({ notifications, onClose, role, setNotifications }) => {
  const navigate = useNavigate();

  const handleItemClick = async (notif) => {
    try {
      // 1. ERASE from database immediately on click
      // This matches the @app.delete("/{role}/notifications/erase/{notif_id}") route
      await axios.delete(`http://127.0.0.1:8000/${role}/notifications/erase/${notif._id}`);
      
      // 2. Update local state so it vanishes from the UI without a refresh
      if (setNotifications) {
        setNotifications(prev => prev.filter(n => n._id !== notif._id));
      }

      // 3. Navigate to the target action page (e.g., /admin/policy-requests)
      navigate(notif.link);
      
      // 4. Close the dropdown
      onClose();
    } catch (e) {
      console.error("Error erasing notification:", e);
      // Even if delete fails, we still navigate so the user can perform the task
      navigate(notif.link);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 mt-4 w-85 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in duration-200">
      
      {/* Header */}
      <div className="p-5 bg-slate-800/40 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Notifications</h3>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
          {notifications.length} Total
        </span>
      </div>
      
      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Inbox Empty</p>
            <p className="text-[10px] text-slate-600 mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n._id} 
              onClick={() => handleItemClick(n)}
              className="p-5 border-b border-white/5 hover:bg-blue-600/5 cursor-pointer transition-all flex items-start gap-4 group text-left"
            >
              <div className="mt-1 flex-shrink-0">
                <Circle size={8} className="fill-blue-500 text-blue-500 animate-pulse" />
              </div>
              
              <div className="flex-1">
                <p className="text-xs leading-relaxed text-slate-200 font-medium group-hover:text-white transition-colors">
                  {n.message}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                   <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                     <Clock size={10} /> 
                     {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   
                   <div className="flex items-center gap-1 text-[9px] text-blue-400 font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                     Go to Action <ChevronRight size={10} />
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/50 text-center border-t border-slate-800">
        <p className="text-[9px] text-slate-600 font-medium">Clicking a notification clears it from your inbox.</p>
      </div>
    </div>
  );
};

export default Notifications;
