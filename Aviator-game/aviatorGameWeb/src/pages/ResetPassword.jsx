import React, { useState } from "react";
import BG from "./../assets/images/forgot_password/bg.png";
import finger from "./../assets/images/forgot_password/figer-print.png";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { forgetPasswordSendOtp } from "../services/api";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [resetMethod, setResetMethod] = useState("email"); // 'email' or 'phone'
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetOtp = async () => {
    const identifier = resetMethod === "email" ? email : phone;

    if (!identifier) {
      toast.error(
        `Enter your ${resetMethod === "email" ? "email" : "phone number"}`
      );
      return;
    }

    // Validate email format
    if (resetMethod === "email" && !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone format
    if (resetMethod === "phone" && !phone) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await forgetPasswordSendOtp(identifier, resetMethod);
      console.log(response);

      if (response.status === 200) {
        toast.success(response.data?.message || "OTP sent successfully");
        navigate("/password-reset-otp", {
          state: {
            identifier,
            resetMethod,
          },
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-[url("./assets/images/forgot_password/bg.png")] bg-cover bg-no-repeat h-screen w-screen flex justify-center items-center'>
      <div className="bg-[rgba(0,0,0,0.7)] flex flex-col justify-center items-center p-4 rounded-xl gap-6 px-10">
        <img src={finger} alt="finger" className="w-14" />
        <h3 className="text-xl text-red-600 font-bold">Forgot Password ?</h3>
        <p className="text-blue-300 text-md text-center">
          No worries, we'll send you reset instructions
        </p>

        {/* Reset Method Selection */}
        <div className="flex gap-4 w-full justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-white">
            <input
              type="radio"
              name="resetMethod"
              value="email"
              checked={resetMethod === "email"}
              onChange={(e) => setResetMethod(e.target.value)}
              className="w-4 h-4"
            />
            <span>Email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-white">
            <input
              type="radio"
              name="resetMethod"
              value="phone"
              checked={resetMethod === "phone"}
              onChange={(e) => setResetMethod(e.target.value)}
              className="w-4 h-4"
            />
            <span>Phone</span>
          </label>
        </div>

        {/* Email Input */}
        {resetMethod === "email" && (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-white font-medium">Your Email*</p>
            <div className="border-2 border-red-700 p-1 rounded-sm">
              <input
                type="email"
                placeholder="Enter your Email"
                className="bg-transparent outline-none flex-grow text-white w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Phone Input */}
        {resetMethod === "phone" && (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-white font-medium">Your Phone Number*</p>
            <div className="border-2 border-red-700 p-1 rounded-sm">
              <PhoneInput
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
                className="custom-phone-input"
              />
            </div>
          </div>
        )}

        <button
          className="bg-red-600 hover:bg-red-500 text-white p-3 font-bold my-2 rounded-lg w-full transition"
          onClick={handleResetOtp}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <Link
          to={"/"}
          className="flex items-center gap-2 text-blue-300 font-medium hover:text-blue-200 transition"
        >
          <FaArrowLeft />
          <p>Back To Log In</p>
        </Link>

        <div className="grid grid-rows-1 grid-cols-3 gap-3">
          <span className="w-16 h-3 bg-blue-400 rounded-full"></span>
          <span className="w-16 h-3 bg-blue-200 rounded-full"></span>
          <span className="w-16 h-3 bg-blue-200 rounded-full"></span>
        </div>
      </div>

      {/* Phone Input Styles */}
      <style>
        {`
          .custom-phone-input input {
            background-color: transparent !important;
            color: white; 
            outline: none !important;  
            border: none;
          }
          .custom-phone-input input:focus {
            outline: none !important;  
            box-shadow: none; 
          }
        `}
      </style>
    </div>
  );
}
