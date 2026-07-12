import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, User } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamsList();
  }, []);

  const fetchTeamsList = async () => {
    try {
      const res = await apiClient.get("/teams");
      setTeams(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{teams.length} active teams</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No teams found.</div>
        ) : (
          teams.map((team) => (
            <div
              key={team._id}
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{team.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{team.description || "No description"}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {team.leader && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 font-medium">Leader:</span>
                  <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" /> {team.leader.firstName} {team.leader.lastName}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">Members ({team.members?.length || 0})</span>
                <div className="flex -space-x-2 overflow-hidden">
                  {team.members?.map((m, idx) => (
                    <div
                      key={m.user?._id || idx}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs"
                      title={m.user?.firstName}
                    >
                      {m.user?.firstName?.[0] || "U"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
