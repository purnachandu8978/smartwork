import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Settings, Lock, Shield, User, Sliders } from "lucide-react";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [appName, setAppName] = useState("SmartWork Hub");
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com");
  const [maintenance, setMaintenance] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Settings updated successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure workspace parameters and administrative settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-gray-400" /> Global Settings
        </h3>

        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Application Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="mt-1.5 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">SMTP Host</label>
            <input
              type="text"
              value={smtpServer}
              onChange={(e) => setSmtpServer(e.target.value)}
              className="mt-1.5 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="maintenance"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="maintenance" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Enable Maintenance Mode
            </label>
          </div>

          <div className="pt-4 border-t border-gray-150 dark:border-gray-700">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
