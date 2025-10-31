import React, { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import currencyOptions from "./../../services/currencies.json";
import Select from "react-select";
import "./../../assets/styles/Register.css";
import {
  confirmSignUpEmailOtp,
  createUser,
  sendEmailSignUpOtp,
} from "../../services/api";
import { toast } from "react-toastify";

export default function Email() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleCurrencyChange = (option) => {
    setSelectedCurrency(option);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError("");
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

  // Send Otp
  const sendOtp = async () => {
    setLoading(true);
    try {
      const response = await sendEmailSignUpOtp(email);
      console.log(response);

      if (response.status === 200) {
        setLoading(false);
        toast.success("Check email for confirmation code", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        toast.error(response.data.message, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          className: "custom-toast-error", // Apply custom error class
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error during send code", error);
      toast.error(error.response.data.message, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        className: "custom-toast-error", // Apply custom error class
      });
      setLoading(false);
    }
  };
  // confirm code
  const handleConfirmCode = async () => {
    setConfirmed(true);
    try {
      const response = await confirmSignUpEmailOtp(email, confirmCode);
      console.log(response);
      if (response.status === 200) {
        toast.success(response.data?.message, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data?.message, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setConfirmed(false);
    }
  };
  const registerUser = async () => {
    if (!password || password.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    try {
      const userData = {
        email,
        password,
        currency: selectedCurrency?.value, // Assuming currency options contain value and label
        promoCode,
      };

      // Make API call to register user
      const response = await createUser(userData);

      if (response.status === 200) {
        toast.success("User registered successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        navigate("/");
      } else {
        toast.error(response.data?.message, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error registering user", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 md:items-center">
        <div className="flex flex-col gap-2">
          <p className="text-white font-medium">Your Email Id*</p>
          <div className="border-2 border-red-600 rounded-sm overflow-hidden">
            <div className="flex justify-between">
              <input
                type="email"
                placeholder="Enter your Email Id"
                className="bg-transparent outline-none flex-grow text-white p-2 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="bg-sky-600 text-sm text-white px-4 hover:bg-sky-300 hover:text-sky-600"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? "Sending Mail" : "Send Mail"}
              </button>
            </div>
          </div>
          <div className="border-2 border-red-600 flex justify-between mt-4">
            <input
              type="text"
              placeholder="Confirmation Code"
              className="bg-transparent text-white p-2 outline-none"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
            />
            <button
              className={`${
                confirmed ? "bg-green-300" : "bg-sky-300"
              } text-sm text-sky-600 px-4 hover:bg-sky-600 hover:text-white`}
              onClick={handleConfirmCode}
              disabled={confirmed}
            >
              {confirmed ? "Confirmed" : "Confirm"}
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
          onChange={handlePasswordChange}
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
      {passwordError && <p className="text-red-500">{passwordError}</p>}
      <button
        className="bg-red-600 text-white uppercase p-2 font-medium"
        onClick={registerUser}
      >
        Register
      </button>

      <p className="text-sm text-white mx-auto my-6">
        Already have an account?{" "}
        <Link to={"/"} className="text-sky-400">
          Login
        </Link>
      </p>
    </div>
  );
}
