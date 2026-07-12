import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProjectsList();
  }, [search]);

  const fetchProjectsList = async () => {
    try {
      const res = await apiClient.get(`/projects?search=${search}`);
      setProjects(res.data.data.data || res.data.data);
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
      case "active": return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "planning": return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "on_hold": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projects.length} total projects</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filters and search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none text-sm text-gray-700 dark:text-gray-200"
        />
      </div>

      {/* Grid of projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No projects found.</div>
        ) : (
          projects.map((proj) => (
            <Link
              key={proj._id}
              to={`/projects/${proj._id}`}
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 min-h-[32px]">
                    {proj.description || "No description provided"}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Status and priority Badges */}
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getStatusColor(proj.status)}`}>
                  {proj.status.replace("_", " ")}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getPriorityColor(proj.priority)}`}>
                  {proj.priority}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5">
                  <span>Progress</span>
                  <span>{proj.progress ?? 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-300"
                    style={{ width: `${proj.progress ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Date footer */}
              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium pt-2 border-t border-gray-100 dark:border-gray-700">
                {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : ""} &rarr; {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : ""}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
