import { useEffect, useState } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { apiClient } from "../lib/axios";
import LoadingScreen from "../components/shared/LoadingScreen";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get("/audit");
      setLogs(res.data.data.data || res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time system configuration and database changes</p>
        </div>
        <button onClick={fetchLogs} className="text-gray-400 hover:text-gray-650">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="table-header">Timestamp</th>
                <th className="table-header">Action</th>
                <th className="table-header">Resource</th>
                <th className="table-header">Actor</th>
                <th className="table-header">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-750">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No logs found or unauthorized.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="table-row">
                    <td className="table-cell font-semibold">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="table-cell">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        log.action === "create" ? "bg-green-100 text-green-700" :
                        log.action === "update" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell">{log.resource}</td>
                    <td className="table-cell font-medium">
                      {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System"}
                    </td>
                    <td className="table-cell text-gray-400">{log.ipAddress || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
