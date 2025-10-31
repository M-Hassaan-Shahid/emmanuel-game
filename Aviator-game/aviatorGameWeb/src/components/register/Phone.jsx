import React, { useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { IoLogoGoogle, IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import currencyOptions from "./../../services/currencies.json";
import Select from "react-select";
import "./../../assets/styles/Register.css";
import { toast } from "react-toastify";
import axios from "axios";

export default function Phone() {
  const [phone, setPhone] = useState();
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleCurrencyChange = (option) => {
    setSelectedCurrency(option);
  };

  // Send SMS OTP
  const sendSmsOtp = async () => {
    if (!phone) {
      toast.error("Please enter phone number!");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL;
      const response = await axios.post(`${apiUrl}/api/sendmailsms`, {
        contact: phone,
      });

      if (response.data) {
        toast.success("OTP sent to your phone!");
        setIsOtpSent(true);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error(error.response?.data?.message || "Failed to send SMS");
    }
    setLoading(false);
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP!");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL;
      const response = await axios.post(`${apiUrl}/api/verifyotpreg`, {
        contact: phone,
        otp: otp,
      });

      if (response.data.message === "User verified successfully.") {
        toast.success("Phone verified successfully!");
        setIsOtpVerified(true);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  // Complete Registration
  const handleRegister = async () => {
    if (!isOtpVerified) {
      toast.error("Please verify your phone number first!");
      return;
    }

    if (!password || password.length < 4) {
      toast.error("Password must be at least 4 characters!");
      return;
    }

    if (!selectedCurrency) {
      toast.error("Please select a currency!");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL;
      const response = await axios.post(`${apiUrl}/api/insertuser`, {
        contact: phone,
        password: password,
        currency: selectedCurrency.value,
        promocode: promoCode || undefined,
      });

      if (response.data.success) {
        toast.success("Registration successful! Please login.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  // Custom styles for the Select component
  const customStyles = {
    control: (provided) => ({
      ...provided,
      background: "transparent", // Set background to transparent
      border: "2px solid #dc2626", // Match the border color with your design
      boxShadow: "none",
      "&:hover": {
        border: "2px solid #dc2626", // Maintain the border color on hover
      },
    }),
    menu: (provided) => ({
      ...provided,
      background: "#1F1F1F", // Background color for the dropdown menu
    }),
    option: (provided, state) => ({
      ...provided,
      color: "white", // Text color for options
      background: state.isSelected ? "#dc2626" : "transparent", // Background color for selected option
      "&:hover": {
        background: "#dc2626", // Background color on hover
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white", // Text color for the selected value
    }),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 md:items-center">
        <div className="flex flex-col gap-2">
          <p className="text-white font-medium">Your Phone number*</p>
          <div className="border-2 border-red-600 rounded-sm overflow-hidden">
            <div className="flex justify-between">
              <PhoneInput
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
                className="custom-phone-input"
              />
              <button
                className="bg-sky-600 text-sm text-white px-4 hover:bg-sky-300 hover:text-sky-600 disabled:opacity-50"
                onClick={sendSmsOtp}
                disabled={loading || isOtpSent}
              >
                {loading ? "Sending..." : isOtpSent ? "Sent" : "Send SMS"}
              </button>
            </div>
          </div>
          <div className="border-2 border-red-600 flex justify-between mt-4">
            <input
              type="text"
              placeholder="Confirmation Code"
              className="bg-transparent text-white p-2 outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={!isOtpSent || isOtpVerified}
            />
            <button
              className="bg-sky-300 text-sm text-sky-600 px-4 hover:bg-sky-600 hover:text-white disabled:opacity-50"
              onClick={verifyOtp}
              disabled={loading || !isOtpSent || isOtpVerified}
            >
              {isOtpVerified
                ? "Verified ✓"
                : loading
                ? "Verifying..."
                : "Confirm"}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-72 flex flex-col gap-2">
            <p className="text-white font-medium">Select Currency*</p>
            <Select
              options={currencyOptions}
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              placeholder="Select currency"
              styles={customStyles}
            />
          </div>
          <div className="border-2 border-red-600 mt-4 rounded-sm">
            <input
              type="text"
              placeholder="Promo Code (if you have one)"
              className="w-full bg-transparent text-white p-2 outline-none"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="border-2 border-red-700 p-1 rounded-sm flex items-center md:w-1/2 md:mx-auto my-4 p-2">
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
      <button
        className="bg-red-600 text-white uppercase p-2 font-medium disabled:opacity-50"
        onClick={handleRegister}
        disabled={loading || !isOtpVerified}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="text-sm text-white mx-auto my-6">
        Already have an account?{" "}
        <Link to={"/"} className="text-sky-400">
          Login
        </Link>
      </p>
      {/* Additional styles to ensure the background works */}
      <style>
        {`
        .custom-phone-input input {
          background-color: transparent !important;
          color: white; 
          outline: none !important;  
          border: none;
          padding:7px;
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
