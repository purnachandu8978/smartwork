import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, CheckSquare } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const TaskDetailPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/tasks/${id}`)
      .then((res) => setTask(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!task) return <div className="p-8 text-center text-gray-500">Task not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/tasks" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{task.description || "No description provided"}</p>
          </div>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-2.5 py-1 rounded-full uppercase">
            {task.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <span className="text-gray-400 block font-medium">Assignee</span>
            <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
              <User className="w-4 h-4 text-gray-400" /> {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Due Date</span>
            <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Priority</span>
            <span className="text-gray-800 dark:text-white font-semibold uppercase block mt-1">{task.priority}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Project</span>
            <span className="text-gray-800 dark:text-white font-semibold block mt-1">
              {task.project?.name || "Independent Task"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
