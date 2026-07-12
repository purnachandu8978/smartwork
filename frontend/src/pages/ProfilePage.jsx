import { useState } from "react";
import { useSelector } from "react-redux";
import { User, Mail, Shield, Building, Award } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const handleUpdate = (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account profile details</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-150 dark:bg-gray-750 text-gray-800 dark:text-white rounded-full flex items-center justify-center font-bold text-2xl">
            {firstName?.[0]}{lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{firstName} {lastName}</h2>
            <p className="text-sm text-gray-500 capitalize">{user?.role || "employee"}</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleUpdate}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1.5 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1.5 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="mt-1.5 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-750 border border-gray-300 dark:border-gray-650 rounded-xl text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-4 border-t border-gray-150 dark:border-gray-700">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
