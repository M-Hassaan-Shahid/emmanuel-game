import React from "react";
import logo from "./../assets/images/home/aviator.png";
import bg from "./../assets/images/game play/bg/bg.png";
import { IoMdMenu } from "react-icons/io";
import BetUserList from "../components/Game/BetUserList";
import Plane from "../components/Game/Plane";
import { useAuth } from "../services/AuthContext";

export default function Aviator() {
  const { user } = useAuth();

  return (
    <div
      className={`bg-[url('./assets/images/login/bg.png')] bg-cover object-contain bg-no-repeat h-screen w-screen`}
    >
      <div className="bg-black p-2 flex justify-between">
        <div className="flex gap-5">
          <img src={logo} alt="logo" className="w-[13vw] h-8" />
          <span className="bg-green-600 p-1 px-4 text-white rounded-full flex gap-2 items-center cursor-pointer">
            {" "}
            <p className="w-6 h-6 rounded-full flex justify-center bg-gray-600">
              ?
            </p>{" "}
            How to play?
          </span>
        </div>
        <div className="flex text-gray-400 items-center">
          <p className="text-xl text-green-600 font-semibold px-3 border-r border-gray-600">
            {user?.balance || 0} {user?.currency || "INR"}
          </p>
          <IoMdMenu className="text-3xl mx-3 cursor-pointer" />
        </div>
      </div>
      <div className="p-2 px-3 flex flex-col-reverse md:flex-row gap-3">
        <BetUserList />
        <Plane />
      </div>
    </div>
  );
}
