import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import reset from "./../../assets/images/forgot_password/reset-password-icon.png";
import { toast } from "react-toastify";
import { resetForgotPassword } from "../../services/api";

export default function ResetBox({ identifier, resetMethod = "email" }) {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await resetForgotPassword(
        identifier,
        newPassword,
        resetMethod
      );
      if (response.status === 200) {
        toast.success("Password reset successfully!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[rgba(0,0,0,0.7)] flex flex-col justify-center items-center p-4 rounded-xl gap-6 px-10">
      <img src={reset} alt="reset" className="w-14" />
      <h3 className="text-xl text-red-600 font-bold">Set New Password</h3>
      <p className="text-blue-300 text-md text-center">
        Must be at least 4 characters
      </p>

      <div className="flex flex-col gap-4 w-full">
        {/* New Password */}
        <div className="flex flex-col gap-2">
          <p className="text-white font-medium">New Password*</p>
          <div className="border-2 border-red-700 p-2 rounded-sm flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="bg-transparent outline-none flex-grow text-white w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sky-500 ml-2"
            >
              {showPassword ? <IoEye /> : <IoMdEyeOff />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <p className="text-white font-medium">Confirm Password*</p>
          <div className="border-2 border-red-700 p-2 rounded-sm flex items-center">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              className="bg-transparent outline-none flex-grow text-white w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-sky-500 ml-2"
            >
              {showConfirmPassword ? <IoEye /> : <IoMdEyeOff />}
            </button>
          </div>
        </div>
      </div>

      <button
        className="bg-red-600 hover:bg-red-500 text-white p-3 font-bold my-2 rounded-lg w-full transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleResetPassword}
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <Link
        to={"/"}
        className="flex items-center gap-2 text-blue-300 font-medium hover:text-blue-200 transition"
      >
        <FaArrowLeft />
        <p>Back To Log In</p>
      </Link>

      <div className="grid grid-rows-1 grid-cols-3 gap-3">
        <span className="w-16 h-3 bg-blue-200 rounded-full"></span>
        <span className="w-16 h-3 bg-blue-200 rounded-full"></span>
        <span className="w-16 h-3 bg-blue-400 rounded-full"></span>
      </div>
    </div>
  );
}
