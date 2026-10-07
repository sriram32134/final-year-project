import React from 'react';
import { X, Bell, ArrowRight, Sparkles } from 'lucide-react';

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onOpenReplanModal,
}) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-space-950/70 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-space-900 border-l border-white/10 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
                  NOTIFICATIONS
                </h3>
                <div className="text-[11px] font-mono text-cyan-400">
                  {unreadCount} UNREAD ALERTS
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No notifications at this time.
              </div>
            ) : (
              notifications.map((notif) => {
                const isUrgent = notif.urgency === 'HIGH';
                return (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isUrgent
                        ? 'bg-rose-950/20 border-rose-500/30 shadow-lg'
                        : notif.read
                        ? 'bg-space-950/40 border-white/5'
                        : 'bg-space-950/80 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {notif.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {notif.timestamp}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-sans mb-1">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {notif.summary}
                    </p>

                    {/* Action button if conflict details exist */}
                    {notif.conflictDetails && (
                      <button
                        onClick={() => onOpenReplanModal(notif)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black tracking-wider uppercase transition-all shadow-glow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>REVIEW & ACCEPT REPLAN</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
