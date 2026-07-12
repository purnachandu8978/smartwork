import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Download, FileSpreadsheet, FileText, Printer, Calendar } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    Promise.all([
      apiClient.get("/dashboard/analytics/tasks"),
      apiClient.get("/dashboard/analytics/attendance"),
    ])
      .then(([tasks, att]) => {
        setTaskData(tasks.data.data);
        setAttendanceData(att.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports &amp; Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Export spreadsheets and analyze team statistics</p>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export Excel
          </button>
          <button className="flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <FileText className="w-4 h-4 text-red-500" /> Export PDF
          </button>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Rate (Last 7 days) */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-white text-base mb-4">Task Completion Rate</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskData.length ? taskData : [
                { _id: "2026-07-06", count: 2 },
                { _id: "2026-07-07", count: 4 },
                { _id: "2026-07-08", count: 3 },
                { _id: "2026-07-09", count: 7 },
                { _id: "2026-07-10", count: 5 },
                { _id: "2026-07-11", count: 8 },
                { _id: "2026-07-12", count: 6 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" fontSize={10} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Attendance Trend */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-white text-base mb-4">Daily Attendance Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData.length ? attendanceData : [
                { _id: "Mon", present: 8, absent: 2 },
                { _id: "Tue", present: 9, absent: 1 },
                { _id: "Wed", present: 9, absent: 1 },
                { _id: "Thu", present: 10, absent: 0 },
                { _id: "Fri", present: 7, absent: 3 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" fontSize={10} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
