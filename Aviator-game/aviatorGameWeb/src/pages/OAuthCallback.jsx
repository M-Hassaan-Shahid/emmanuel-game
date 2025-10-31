import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useAuth } from "../services/AuthContext";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get("token");
      const userStr = searchParams.get("user");
      const error = searchParams.get("message");

      if (error) {
        toast.error(error);
        navigate("/login");
        return;
      }

      if (!token) {
        toast.error("No token received");
        navigate("/login");
        return;
      }

      try {
        let user = null;

        if (userStr && userStr !== "{}") {
          user = JSON.parse(decodeURIComponent(userStr));
        }

        if (!user || !user.id) {
          const userCookie = Cookies.get("user");
          if (userCookie) {
            user = JSON.parse(userCookie);
          }
        }

        if (!user || !user.id) {
          throw new Error("No user data");
        }

        Cookies.set("token", token, { expires: 7 });
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);

        login(user);

        toast.success(`Welcome ${user.name || user.username || user.email}!`);
        navigate("/home");
      } catch (error) {
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto"></div>
        <p className="text-white mt-4 text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}
