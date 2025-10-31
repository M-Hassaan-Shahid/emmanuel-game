import React from "react";
import socket from "../../services/socket";

export default function BetUserList() {
  const [betUsers, setBetUsers] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState("all"); // 'all', 'my', 'top'

  React.useEffect(() => {
    // Listen for real-time bet updates from socket

    socket.on("bet_placed", (betData) => {
      setBetUsers((prev) => [betData, ...prev].slice(0, 50)); // Keep last 50 bets
    });

    socket.on("bet_cashed_out", (cashoutData) => {
      setBetUsers((prev) =>
        prev.map((bet) =>
          bet.id === cashoutData.betId
            ? {
                ...bet,
                cashout: cashoutData.cashout,
                mult: cashoutData.multiplier,
              }
            : bet
        )
      );
    });

    return () => {
      socket.off("bet_placed");
      socket.off("bet_cashed_out");
    };
  }, []);

  const betUser =
    betUsers.length > 0
      ? betUsers
      : [
          {
            id: 46107,
            img: "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
            bet: 7297,
            mult: "2.3X",
            cashout: 8425,
          },
          {
            id: 46108,
            img: "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
            bet: 5000,
            mult: "1.8X",
            cashout: "",
          },
          {
            id: 46109,
            img: "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
            bet: 10000,
            mult: "2.1X",
            cashout: 10500,
          },
          {
            id: 46110,
            img: "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
            bet: 8500,
            mult: "3.5X",
            cashout: "",
          },
          {
            id: 46111,
            img: "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
            bet: 4300,
            mult: "1.5X",
            cashout: 6450,
          },
        ];
  return (
    <div className="bg-black md:w-[25vw] rounded-xl h-[calc(100vh-70px)]">
      <div className="w-full flex justify-center my-2 p-2">
        <div className="border rounded-full border-gray-700 bg-gray-700 flex w-2/3">
          <span className=" rounded-full text-white text-xs p-1 px-2 bg-gray-900 w-1/3 text-center">
            All Bets
          </span>
          <span className=" rounded-full text-white text-xs p-1 px-2 w-1/3 text-center">
            My Bets
          </span>
          <span className=" rounded-full text-white text-xs p-1 px-2 w-1/3 text-center">
            Top
          </span>
        </div>
      </div>
      <p className="text-white uppercase mt-2 px-2 py-2 border-b-2 border-black">
        Total bets: <span className="text-green-700">441</span>
      </p>
      <ul className="flex text-gray-500 justify-between px-2 py-2">
        <li className="w-1/3">User</li>
        <li className="w-1/3">Bet INR X</li>
        <li className="w-1/3">Cash Out INR</li>
      </ul>
      <ul className="flex text-white justify-between px-2 py-1 bg-green-600 m-1 ">
        <li>75421</li>
        <li className="bg-green-700 px-2 rounded-full">1.5X</li>
        <li>240.76</li>
      </ul>
    </div>
  );
}
