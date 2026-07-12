import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, CheckSquare, Plus } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!project) return <div className="p-8 text-center text-gray-500">Project not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/projects" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{project.description || "No description provided"}</p>
          </div>
          <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2.5 py-1 rounded-full uppercase">
            {project.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <span className="text-gray-400 block font-medium">Owner</span>
            <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
              <User className="w-4 h-4 text-gray-400" /> {project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : "Unassigned"}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Timeline</span>
            <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" /> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Progress</span>
            <span className="text-gray-800 dark:text-white font-semibold block mt-1">{project.progress ?? 0}%</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Members</span>
            <span className="text-gray-800 dark:text-white font-semibold block mt-1">{project.members?.length || 0} active</span>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Project Members</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {project.members?.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No members assigned.</p>
          ) : (
            project.members?.map((m) => (
              <div key={m.user?._id} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-sm">
                    {m.user?.firstName?.[0]}{m.user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.user?.firstName} {m.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{m.user?.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full capitalize">{m.role}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
