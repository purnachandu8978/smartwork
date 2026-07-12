import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSocket } from "../../hooks/useSocket";

const AppLayout = () => {
  const { sidebarCollapsed } = useSelector((state) => state.ui);
  const { theme } = useSelector((state) => state.ui);

  // Initialize socket connection
  useSocket();

  return (
    <div className={`flex h-screen overflow-hidden ${theme === "dark" ? "dark" : ""}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
