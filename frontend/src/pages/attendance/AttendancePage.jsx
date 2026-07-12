import { useEffect, useState } from "react";
import { Clock, RefreshCw, Play, Square } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";
import toast from "react-hot-toast";

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await apiClient.get("/attendance/my");
      setRecords(res.data.data.records);
      setStats(res.data.data.stats);

      // Check if checked in today
      const today = new Date().toDateString();
      const todayRecord = res.data.data.records.find(
        (r) => new Date(r.date).toDateString() === today
      );
      if (todayRecord) {
        setCheckedIn(!!todayRecord.checkIn);
        setCheckedOut(!!todayRecord.checkOut);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiClient.post("/attendance/check-in");
      toast.success("Checked in successfully!");
      setCheckedIn(true);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiClient.post("/attendance/check-out");
      toast.success("Checked out successfully!");
      setCheckedOut(true);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check out");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your daily check-ins</p>
        </div>
      </div>

      {/* Clock section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
          <Clock className="w-10 h-10 text-gray-400" />
          <div>
            <h3 className="font-bold text-gray-950 dark:text-white text-lg">Daily Check-In</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Record your shifts start and end times</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCheckIn}
              disabled={checkedIn}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!checkedIn || checkedOut}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
            >
              <Square className="w-4 h-4" /> Check Out
            </button>
          </div>
        </div>

        {/* Stats card */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-2 grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <span className="text-xs text-gray-400 block uppercase font-bold">Present Days</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white mt-1.5 block">{stats.present}</span>
            </div>
            <div className="text-center border-x border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 block uppercase font-bold">Half Days</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white mt-1.5 block">{stats.halfDay}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-400 block uppercase font-bold">Total Hours</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white mt-1.5 block">{stats.totalHours}h</span>
            </div>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Attendance Log</h3>
          <button onClick={fetchAttendance} className="text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="table-header">Date</th>
                <th className="table-header">Check In</th>
                <th className="table-header">Check Out</th>
                <th className="table-header">Hours Worked</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-750">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No records found.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="table-row">
                    <td className="table-cell font-semibold">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="table-cell">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}</td>
                    <td className="table-cell">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}</td>
                    <td className="table-cell">{r.workHours ? `${r.workHours.toFixed(2)}h` : "-"}</td>
                    <td className="table-cell">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        r.status === "present" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {r.status}
                      </span>
                    </td>
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

export default AttendancePage;
