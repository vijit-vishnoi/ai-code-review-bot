import { useEffect, useState } from 'react';
import { Clock, History, Plus } from 'lucide-react';
import type { ReviewSession } from '../types';

interface SidebarProps {
  onSelectSession: (session: ReviewSession) => void;
  onNewChat: () => void;
}

export const Sidebar = ({ onSelectSession, onNewChat }: SidebarProps) => {
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/sessions`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="w-64 bg-surface border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-slate-200">Past Reviews</h2>
      </div>
      
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded-md transition-colors border border-slate-700 font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Review
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-slate-400 text-sm text-center mt-4">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-slate-400 text-sm text-center mt-4">No past sessions</div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session)}
                className="flex flex-col text-left p-3 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600"
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="text-sm font-medium text-slate-300 truncate">
                    {session.language || 'Unknown'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(() => {
                      const dateStr = session.created_at || session.timestamp || '';
                      if (!dateStr) return 'Unknown';
                      // SQLite sometimes returns "YYYY-MM-DD HH:MM:SS", we need a "T" separator
                      const date = new Date(dateStr.replace(' ', 'T') + 'Z');
                      if (isNaN(date.getTime())) return 'Invalid Date';
                      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    })()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
