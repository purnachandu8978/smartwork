import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, Shield } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/employees/${id}`)
      .then((res) => setEmployee(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!employee) return <div className="p-8 text-center text-gray-500">Employee not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/employees" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to employees
      </Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-2xl text-gray-700 dark:text-white">
            {employee.user?.firstName?.[0]}{employee.user?.lastName?.[0]}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.user?.firstName} {employee.user?.lastName}</h1>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mt-1">{employee.position || "Employee"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{employee.department || "No department"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Contact Information</h3>
            <div className="space-y-2">
              <span className="text-gray-400 block font-medium">Email</span>
              <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
                <Mail className="w-4 h-4 text-gray-400" /> {employee.user?.email}
              </span>
            </div>
            {employee.user?.phone && (
              <div className="space-y-2">
                <span className="text-gray-400 block font-medium">Phone</span>
                <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" /> {employee.user?.phone}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Employment Details</h3>
            <div className="space-y-2">
              <span className="text-gray-400 block font-medium">Joined Date</span>
              <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" /> {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "Not specified"}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-400 block font-medium">Reporting To</span>
              <span className="text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 mt-1">
                <User className="w-4 h-4 text-gray-400" /> {employee.reportingTo ? `${employee.reportingTo.firstName} ${employee.reportingTo.lastName}` : "None"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
