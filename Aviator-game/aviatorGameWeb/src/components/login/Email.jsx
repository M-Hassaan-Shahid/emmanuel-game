import React, { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { Link } from "react-router-dom";
import { loginByEmail } from "../../services/api";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";

export default function Email() {
  const [email, setEmail] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  // login email
  const handleLoginEmail = async () => {
    if (!email || !password) {
      toast.error("Fill all fields!");
      return;
    }
    setLoading(true);
    try {
      const response = await loginByEmail(email, password);
      console.log(response);

      // Check if the response is successful
      if (response?.data?.success) {
        // Store token in cookies
        Cookies.set("token", response.data.token, { expires: 7 });

        // Update auth context with user data
        login(response.data.user);

        toast.success("Login successful!");
        navigate("/home");
        setEmail("");
        setPassword("");
      } else {
        toast.error(response?.data?.message || "Login failed!");
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message || "An error occurred during login.";
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-white font-medium">Your Email Id*</p>
        <div className="border-2 border-red-700 p-1 rounded-sm">
          <input
            type="email"
            placeholder="Enter your Email Id"
            className="bg-transparent outline-none flex-grow text-white w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="border-2 border-red-700 p-1 rounded-sm flex items-center">
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Password*"
          className="bg-transparent outline-none flex-grow text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-white ml-2"
        >
          {passwordVisible ? (
            <IoEye className="text-sky-500" />
          ) : (
            <IoMdEyeOff className="text-sky-500" />
          )}
        </button>
      </div>
      <div className="flex justify-between text-white items-center">
        <span className="flex gap-1 items-center">
          <input
            type="checkbox"
            name=""
            id=""
            className="border border-red-600"
          />
          <p className="text-xs">Remember me</p>
        </span>
        <Link to={"/password-reset"}>
          <p className="text-sm text-sky-300">Forgot Password ?</p>
        </Link>
      </div>
      <button
        className="bg-red-600 text-white uppercase p-2 font-medium"
        onClick={handleLoginEmail}
      >
        Login
      </button>
      {/* Social Login Options */}
      <div className="flex flex-col justify-center text-white mt-4 gap-2">
        <p className="text-sm mx-auto">Log In Via</p>
        <div className="flex gap-2 mb-4">
          <button
            className="bg-sky-200 text-sky-600 p-2 w-full rounded-sm text-md flex items-center justify-center gap-1 hover:bg-sky-300 transition"
            onClick={() => {
              const backendUrl =
                import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:8000";
              window.location.href = `${backendUrl}/api/auth/google`;
            }}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M457.6 224l-2.1-8.9H262V297h115.6c-12 57-67.7 87-113.2 87-33.1 0-68-13.9-91.1-36.3-23.7-23-38.8-56.9-38.8-91.8 0-34.5 15.5-69 38.1-91.7 22.5-22.6 56.6-35.4 90.5-35.4 38.8 0 66.6 20.6 77 30l58.2-57.9c-17.1-15-64-52.8-137.1-52.8-56.4 0-110.5 21.6-150 61C72.2 147.9 52 204 52 256s19.1 105.4 56.9 144.5c40.4 41.7 97.6 63.5 156.5 63.5 53.6 0 104.4-21 140.6-59.1 35.6-37.5 54-89.4 54-143.8 0-22.9-2.3-36.5-2.4-37.1z"></path>
            </svg>
            Google
          </button>
        </div>
      </div>
      <p className="text-sm text-white mx-auto my-6">
        Don't have an account?{" "}
        <Link to={"/register"} className="text-sky-400">
          Register
        </Link>
      </p>
    </div>
  );
}
