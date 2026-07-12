import { useEffect, useState } from "react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const KanbanPage = () => {
  const [columns, setColumns] = useState({
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    testing: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKanbanBoard();
  }, []);

  const fetchKanbanBoard = async () => {
    try {
      const res = await apiClient.get("/tasks/kanban");
      setColumns(res.data.data);
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

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag tasks between columns to update status</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-[1200px]">
          {Object.entries(columns).map(([colId, tasks]) => (
            <div key={colId} className="flex-1 bg-gray-100/60 dark:bg-gray-800/40 p-4 rounded-2xl flex flex-col gap-3 h-full border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {colId.replace("_", " ")}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-md">
                  {tasks?.length || 0}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1">
                {tasks?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">Empty</div>
                ) : (
                  tasks?.map((task) => (
                    <div
                      key={task._id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 hover:border-blue-500/50 transition-colors cursor-pointer"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                        {task.title}
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.estimatedHours && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                            {task.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanPage;
