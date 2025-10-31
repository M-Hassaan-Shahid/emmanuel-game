import React from "react";
import { RxCross2 } from "react-icons/rx";
import today from "./../../assets/images/rewards/you-have-won.png";
import box from "./../../assets/images/rewards/treasure.png";

export default function Rewards({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-[rgba(0,0,0,0.6)] my-auto w-full max-w-xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex flex-col justify-center">
          <h2 className="text-2xl text-red-600 font-bold mx-auto mb-2">
            Daily Rewards!
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer absolute top-3 right-2"
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col justify-center items-center gap-3 overflow-y-auto p-4">
          <img src={today} alt="today" className="w-1/2 mx-auto" />
          <img src={box} alt="today" className="w-1/3 my-2 mt-4 mx-auto" />
          <button className="bg-blue-500 text-white mx-auto p-2 px-4">
            Claim now!
          </button>
          <p className="text-white">
            Come back after 24 hours for new rewards!
          </p>
          <p className="text-red-500 font-bold mb-4">24 : 00 : 00</p>
        </div>
      </div>
    </div>
  );
}
