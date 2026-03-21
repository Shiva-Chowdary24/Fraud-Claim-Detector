import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, ChevronRight, Circle } from 'lucide-react';
import axios from 'axios';

const Notifications = ({ notifications, onClose, role }) => {
  const navigate = useNavigate();

  const handleItemClick = async (notif) => {
    // 1. Mark as read in DB so it dims out
    try {
      await axios.put(`http://127.0.0.1:8000/${role}/notifications/read/${notif._id}`);
    } catch (e) { 
      console.log("Error marking as read"); 
    }

    // 2. Redirect to the specific page (e.g., /admin/policy-requests)
    navigate(notif.link);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10">
      <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell size={16} className="text-blue-400" /> Activity Center
        </h3>
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
                {n.read ? (
                  <Circle size={8} className="text-slate-700" />
                ) : (
                  <Circle size={8} className="fill-blue-500 text-blue-500 animate-pulse" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs leading-relaxed ${n.read ? 'text-slate-500' : 'text-slate-200 font-medium'}`}>
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
    </div>
  );
};

export default Notifications;
