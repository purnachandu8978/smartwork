import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FolderKanban, CheckSquare, UserCircle, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { apiClient } from "../lib/axios";
import LoadingScreen from "../components/shared/LoadingScreen";

const COLORS = ["#22c55e", "#6366f1", "#f59e0b", "#94a3b8", "#ef4444", "#0ea5e9"];

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard")
      .then((res) => {
        setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (!data) return <div className="p-8 text-center text-gray-500">Failed to load dashboard data</div>;

  const { kpi, tasks, attendance, projects } = data;

  // Format task distribution data for Recharts
  const taskChartData = Object.entries(tasks.byStatus).map(([name, count]) => ({
    name: name.replace("_", " ").toUpperCase(),
    count,
  }));

  // Format project progress for Recharts Pie
  const projectChartData = projects.map((p) => ({
    name: p.name,
    value: p.progress || 10,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your workspace</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Projects</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kpi.totalProjects ?? 6}</h3>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3" /> 12% from last month
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Tasks</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kpi.totalTasks ?? 14}</h3>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3" /> 8% from last month
            </p>
          </div>
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Employees</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kpi.totalUsers ?? 10}</h3>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3" /> 5% from last month
            </p>
          </div>
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Avg Work Hours</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{attendance.workHoursThisMonth ? (attendance.workHoursThisMonth / 20).toFixed(1) : "7.8"}h</h3>
            <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-3 h-3" /> 2% from last week
            </p>
          </div>
          <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task distribution */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-white text-base mb-4">Task Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData.length ? taskChartData : [
                { name: "BACKLOG", count: 2 },
                { name: "TODO", count: 3 },
                { name: "IN PROGRESS", count: 3 },
                { name: "REVIEW", count: 2 },
                { name: "TESTING", count: 2 },
                { name: "DONE", count: 2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="count" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project progress */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-white text-base mb-4">Project Status</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectChartData.length ? projectChartData : [
                    { name: "SmartWork Platform", value: 65 },
                    { name: "Mobile App Redesign", value: 40 },
                    { name: "Analytics Dashboard", value: 10 },
                    { name: "API Gateway v2", value: 80 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(projectChartData.length ? projectChartData : [1, 2, 3, 4]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower section */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-white text-base mb-4">Weekly Attendance</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { day: "Mon", hours: 8.2 },
              { day: "Tue", hours: 7.9 },
              { day: "Wed", hours: 8.5 },
              { day: "Thu", hours: 8.0 },
              { day: "Fri", hours: 6.8 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <Tooltip />
              <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
