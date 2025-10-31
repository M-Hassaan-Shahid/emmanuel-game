import { FaGoogle } from "react-icons/fa";

export default function GoogleLogin() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <div className="google-login-container p-4">
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 border border-gray-300 shadow-sm transition-all"
      >
        <FaGoogle className="text-red-500 text-xl" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
}
