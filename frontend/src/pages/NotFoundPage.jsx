import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Page Not Found
        </h2>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all shadow-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
