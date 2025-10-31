import React, { useState } from "react";
import logo from "./../../assets/images/home/aviator.png";
import profile from "./../../assets/images/home/profile.png";
import share from "./../../assets/images/home/share.png";
import coin from "./../../assets/images/home/coin.png";
import setting from "./../../assets/images/home/settings.png";
import exit from "./../../assets/images/home/exit-game.png";
import txn from "./../../assets/images/home/transcation-history.png";
import leader from "./../../assets/images/home/leaderbords-icon.png";
import game from "./../../assets/images/home/game-history.png";
import reward from "./../../assets/images/home/daily-rewards.png";
import wallet from "./../../assets/images/home/wallet.png";
import money from "./../../assets/images/home/add-money.png";
import { FaShareNodes } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function Footer({ hideFooter, setActiveModal }) {
  const navigate = useNavigate();
  const openModal = (modalType) => {
    setActiveModal(modalType);
    hideFooter(true); // Hide footer when modal opens
  };

  return (
    <div className="bg-[rgba(0,0,0,0.6)] h-16 sm:h-20 flex items-center justify-between px-2 sm:px-4 md:px-8 lg:px-12">
      <div className="flex w-auto sm:w-1/3 lg:w-2/5 gap-1 sm:gap-3 md:gap-6 lg:gap-8 items-center justify-start">
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer"
          onClick={() => openModal("txn")}
        >
          <img
            src={txn}
            alt="transaction"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[9px] sm:text-xs md:text-sm whitespace-nowrap">
            Txn
          </p>
        </span>
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer"
          onClick={() => openModal("leaderBoard")}
        >
          <img
            src={leader}
            alt="leaderboard"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[9px] sm:text-xs md:text-sm whitespace-nowrap hidden sm:block">
            Leaderboards
          </p>
          <p className="font-semibold text-[9px] sm:hidden">Leaders</p>
        </span>
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer"
          onClick={() => openModal("gameHistory")}
        >
          <img
            src={game}
            alt="game history"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[9px] sm:text-xs md:text-sm whitespace-nowrap">
            History
          </p>
        </span>
      </div>
      <button
        className='bg-[url("./assets/images/home/play-button.png")] bg-contain bg-no-repeat bg-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 -mt-6 sm:-mt-8 md:-mt-12 lg:-mt-14 flex-shrink-0'
        onClick={() => navigate("/game")}
      ></button>
      <div className="flex w-auto sm:w-1/3 lg:w-2/5 gap-1 sm:gap-3 md:gap-6 lg:gap-8 items-center justify-end">
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer"
          onClick={() => openModal("wallet")}
        >
          <img
            src={wallet}
            alt="wallet"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[9px] sm:text-xs md:text-sm whitespace-nowrap">
            Wallet
          </p>
        </span>
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer"
          onClick={() => openModal("addmoney")}
        >
          <img
            src={money}
            alt="add money"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[9px] sm:text-xs md:text-sm whitespace-nowrap hidden sm:block">
            Add Money
          </p>
          <p className="font-semibold text-[9px] sm:hidden">Add</p>
        </span>
      </div>
    </div>
  );
}
