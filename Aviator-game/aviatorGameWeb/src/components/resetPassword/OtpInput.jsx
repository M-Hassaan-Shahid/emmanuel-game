import React, { useState } from 'react'
import mail from './../../assets/images/forgot_password/mail-icon.png'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import OTPInput, { ResendOTP } from "otp-input-react";

export default function OtpInput({setShowResetScreen}) {
    const [OTP, setOTP] = useState("");
  return (
    <div className=" bg-[rgba(0,0,0,0.7)] flex flex-col justify-center items-center p-4 rounded-xl gap-6 px-10">
        <img src={mail} alt="finger" className="w-14" />
        <h3 className="text-xl text-red-600 font-bold">Password Reset</h3>
        <p className="text-blue-300 text-md">
          We sent a code to example.123@gmail.com
        </p>
        <div className="flex justify-center w-full">
            <OTPInput value={OTP} onChange={setOTP} autoFocus OTPLength={4} otpType="number" disabled={false} classNames="flex space-x-4" inputClassName="border-2 border-red-600 rounded-lg p-2 text-center w-20 h-20 text-white bg-transparent "/>
        </div>
        <button className="bg-red-600 hover:bg-red-500 text-white p-3 font-bold my-2 rounded-lg w-full" onClick={()=>setShowResetScreen}>
          Continue
        </button>
        <p className='font-medium text-blue-300'>Didn't receive mail?<span className='text-lg text-white font-semibold'> Click Here</span></p>
        <Link
          to={"/"}
          className="flex items-center gap-2 text-blue-300 font-medium"
        >
          <FaArrowLeft />
          <p>Back To Log In</p>
        </Link>
        <div className='grid grid-rows-1 grid-cols-3 gap-3'>
          <span className='w-16 h-3 bg-blue-200 rounded-full'></span>
          <span className='w-16 h-3 bg-blue-400 rounded-full'></span>
          <span className='w-16 h-3 bg-blue-200 rounded-full'></span>
        </div>
      </div>
  )
}
