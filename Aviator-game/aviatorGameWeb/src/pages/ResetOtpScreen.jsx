import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import mail from "./../assets/images/forgot_password/mail-icon.png";
import OTPInput from "otp-input-react";
import ResetBox from "../components/resetPassword/ResetBox";
import { toast } from "react-toastify";
import {
  forgetPasswordSendOtp,
  verifyForgotPasswordOtp,
} from "../services/api";

function ResetOtpScreen() {
  const location = useLocation();
  const identifier = location.state?.identifier; // email or phone
  const resetMethod = location.state?.resetMethod || "email"; // 'email' or 'phone'
  const [verify, setVerify] = useState(false);
  const [OTP, setOTP] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine OTP length based on method
  const otpLength = resetMethod === "phone" ? 6 : 4;

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await forgetPasswordSendOtp(identifier, resetMethod);
      if (response.status === 200) {
        toast.success("OTP resent successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (OTP.length !== otpLength) {
      toast.error(`OTP length should be ${otpLength} digits`);
      return;
    }

    try {
      const response = await verifyForgotPasswordOtp(
        identifier,
        OTP,
        resetMethod
      );
      console.log(response);

      if (response.status === 200) {
        setVerify(true);
        toast.success("OTP verified successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  // Format identifier for display
  const displayIdentifier =
    resetMethod === "email"
      ? identifier
      : identifier?.replace(/(\d{2})(\d{5})(\d+)/, "+$1 $2***$3");

  return (
    <div className='bg-[url("./assets/images/forgot_password/bg.png")] bg-cover bg-no-repeat h-screen w-screen flex justify-center items-center'>
      {verify ? (
        <ResetBox identifier={identifier} resetMethod={resetMethod} />
      ) : (
        <div className="bg-[rgba(0,0,0,0.7)] flex flex-col justify-center items-center p-4 rounded-xl gap-6 px-10">
          <img src={mail} alt="mail" className="w-14" />
          <h3 className="text-xl text-red-600 font-bold">Password Reset</h3>
          <p className="text-blue-300 text-md text-center">
            We sent a {otpLength}-digit code to
            <br />
            <span className="text-white font-semibold">
              {displayIdentifier}
            </span>
          </p>
          <div className="flex justify-center w-full">
            <OTPInput
              value={OTP}
              onChange={setOTP}
              autoFocus
              OTPLength={otpLength}
              otpType="number"
              disabled={false}
              className="flex space-x-4"
              inputClassName="border-2 border-red-600 rounded-lg p-2 text-center w-16 h-16 text-white bg-transparent text-2xl"
            />
          </div>
          <button
            className="bg-red-600 hover:bg-red-500 text-white p-3 font-bold my-2 rounded-lg w-full transition"
            onClick={verifyOtp}
          >
            Verify OTP
          </button>
          <p className="font-medium text-blue-300">
            Didn't receive the code?
            <span
              className="text-lg text-white font-semibold cursor-pointer hover:text-blue-200 transition ml-2"
              onClick={!loading ? handleResendOtp : null}
            >
              {loading ? "Sending..." : "Resend"}
            </span>
          </p>
          <Link
            to={"/password-reset"}
            className="flex items-center gap-2 text-blue-300 font-medium hover:text-blue-200 transition"
          >
            <FaArrowLeft />
            <p>Back</p>
          </Link>
          <div className="grid grid-rows-1 grid-cols-3 gap-3">
            <span className="w-16 h-3 bg-blue-200 rounded-full"></span>
            <span className="w-16 h-3 bg-blue-400 rounded-full"></span>
            <span className="w-16 h-3 bg-blue-200 rounded-full"></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetOtpScreen;
