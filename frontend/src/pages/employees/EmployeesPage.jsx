import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, MoreHorizontal, Mail, Phone } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmployeesList();
  }, [search]);

  const fetchEmployeesList = async () => {
    try {
      const res = await apiClient.get(`/employees?search=${search}`);
      // The API wraps standard pagination format { data: [...], pagination }
      setEmployees(res.data.data.data || res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{employees.length} team members</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none text-sm text-gray-700 dark:text-gray-200"
        />
      </div>

      {/* Grid of Employee cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No employees found.</div>
        ) : (
          employees.map((emp) => {
            const user = emp.user;
            if (!user) return null;
            return (
              <div
                key={emp._id}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 relative group"
              >
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-750 text-gray-800 dark:text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      getInitials(user.firstName, user.lastName)
                    )}
                  </div>

                  {/* Profile info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/employees/${emp._id}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors text-base truncate block">
                      {user.firstName} {user.lastName}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5 capitalize">{emp.position || "Employee"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{emp.department || "No department"}</p>
                  </div>
                </div>

                {/* Contact information */}
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-md">
                    active
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md">
                    {user.role || "employee"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
