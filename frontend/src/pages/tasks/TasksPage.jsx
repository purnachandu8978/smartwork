import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchTasksList();
  }, [search, activeFilter]);

  const fetchTasksList = async () => {
    try {
      const statusFilter = activeFilter !== "all" ? `&status=${activeFilter}` : "";
      const res = await apiClient.get(`/tasks?search=${search}${statusFilter}`);
      setTasks(res.data.data.data || res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      default: return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done": return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "review": return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
      case "in_progress": return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "todo": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tasks.length} total tasks</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none text-sm text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {["all", "backlog", "todo", "in_progress", "review", "testing", "done"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeFilter === tab
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-950 dark:hover:text-white"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        {tasks.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No tasks found.</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <Link to={`/tasks/${task._id}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors truncate">
                  {task.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getStatusColor(task.status)}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.estimatedHours && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {task.estimatedHours}h estimated
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-750 flex items-center justify-center font-bold text-xs">
                      {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {task.assignee.firstName} {task.assignee.lastName}
                    </span>
                  </div>
                )}
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;
