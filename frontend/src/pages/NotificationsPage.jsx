import { useEffect, useState } from "react";
import { Bell, Check, Trash2, CheckCircle2 } from "lucide-react";
import { apiClient } from "../lib/axios";
import LoadingScreen from "../components/shared/LoadingScreen";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationsList();
  }, []);

  const fetchNotificationsList = async () => {
    try {
      const res = await apiClient.get("/notifications?limit=50");
      setNotifications(res.data.data.notifications || res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success("Notification marked as read");
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {}
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your workspace alerts and updates</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-150 dark:divide-gray-700">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
            <Bell className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-gray-400">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? "bg-blue-50/20 dark:bg-blue-900/10" : ""
              }`}
            >
              <div className="flex gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-blue-500" : "bg-transparent"}`} />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{n.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
