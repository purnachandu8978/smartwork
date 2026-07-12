import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken } from "../../features/authSlice";
import toast from "react-hot-toast";

const OAuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      dispatch(setAccessToken(token));
      toast.success("Successfully logged in with OAuth!");
      navigate("/dashboard");
    } else {
      toast.error("OAuth authentication failed");
      navigate("/login");
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-800 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Completing login...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
