import React, { useState, useEffect, useRef } from "react";
import socket from "../../services/socket";
import "./../../assets/styles/Game.css";
import { useAuth } from "../../services/AuthContext";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export default function Plane() {
  const { user, login } = useAuth();
  const [betAmount, setBetAmount] = useState(5);
  const [multiplier, setMultiplier] = useState(0);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 });
  const [isPlaneVisible, setIsPlaneVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [cashOutMultiplier, setCashOutMultiplier] = useState("");
  const [crashPoint, setCrashPoint] = useState("");

  const gameRef = useRef(null);

  // Authenticate user on mount
  useEffect(() => {
    if (user?._id) {
      socket.emit("authenticate", user._id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("multiplier_reset", () => {
      // Reset all states for the new round
      setIsBetPlaced(false);
      setBetAmount(5);
      setLoadingComplete(false);
      setIsPlaneVisible(false); // Hide the plane during loading
      setMultiplier(0); // Reset multiplier to 0 to avoid showing old values
      setIsCrashed(false); // Reset crashed state early
      setMessage("");
      setCrashPoint("");

      // Show the loader and delay the start of the new round
      setShowLoader(true);
      setTimeout(() => {
        setLoadingComplete(true);
        setShowLoader(false); // Hide loader after loading is complete
        setIsPlaneVisible(false); // Keep the plane hidden until the multiplier starts
        setWinnings(0);
      }, 5000);
    });

    socket.on("betting_open", () => {
      setIsBettingOpen(true);
    });

    socket.on("betting_close", () => {
      setIsBettingOpen(false);
    });

    socket.on("multiplier_update", (data) => {
      setMultiplier(data.multiplier);

      // Ensure the plane becomes visible only when multiplier updates
      if (!isCrashed && !isPlaneVisible) {
        setIsPlaneVisible(true);
        movePlaneDiagonally(); // Start moving the plane after multiplier is updated
      }
    });

    socket.on("plane_crash", ({ crashPoint }) => {
      setIsPlaneVisible(false); // Hide the plane immediately on crash
      setIsCrashed(true); // Set crash state
      setShowLoader(true); // Show loader during crash reset
      setMessage(`Flew away`);
      setCrashPoint(crashPoint);
      resetPlanePosition(); // Reset plane position for next round
    });

    socket.on("cash_out_success", (data) => {
      setCashOutMultiplier(data.message);
      setWinnings(data.winnings);
    });

    return () => {
      socket.off("multiplier_reset");
      socket.off("betting_open");
      socket.off("betting_close");
      socket.off("multiplier_update");
      socket.off("plane_crash");
      socket.off("cash_out_success");
    };
  }, [isPlaneVisible, isCrashed]);

  const resetPlanePosition = () => {
    setPlanePosition({ x: 0, y: 0 });
    setShowLoader(false);
  };
  const movePlaneDiagonally = () => {
    const gameWidth = gameRef.current.offsetWidth;
    const gameHeight = gameRef.current.offsetHeight;

    let xPos = 0;
    let yPos = 0;

    const animate = () => {
      xPos += gameWidth / 500; // Adjust for smoother, slower movement
      yPos += gameHeight / 500;

      setPlanePosition({ x: xPos, y: yPos });

      // Stop when it reaches the end of the screen
      if (xPos < gameWidth - 70 && yPos < gameHeight - 95) {
        requestAnimationFrame(animate); // Continue animating
      } else {
        oscillatePlane(xPos, yPos); // Start oscillating when plane reaches the end
      }
    };

    requestAnimationFrame(animate); // Start the animation loop
  };

  const oscillatePlane = (finalX, finalY) => {
    const oscillationAmplitude = 14; // Height of oscillation
    const oscillationFrequency = 0.05; // Speed of oscillation
    let oscillationPhase = 0;

    const animateOscillation = () => {
      oscillationPhase += oscillationFrequency;
      const newY = finalY + oscillationAmplitude * Math.sin(oscillationPhase);

      setPlanePosition({ x: finalX, y: newY }); // Update Y position for oscillation

      if (!isCrashed) {
        requestAnimationFrame(animateOscillation); // Continue oscillating
      }
    };

    requestAnimationFrame(animateOscillation); // Start the oscillation animation
  };

  const increaseBet = () => {
    setBetAmount((prev) => prev + 1);
  };

  const decreaseBet = () => {
    setBetAmount((prev) => (prev > 0 ? prev - 1 : 0)); // Ensure betAmount doesn't go below 0
  };

  const handlePlaceBet = () => {
    if (betAmount > 0 && isBettingOpen && user?._id) {
      if (user.balance < betAmount) {
        toast.error("Insufficient balance!");
        return;
      }
      socket.emit("place_bet", { betAmount, userId: user._id });
      setIsBetPlaced(true);
    } else if (!user?._id) {
      toast.error("Please login to place bet");
    }
  };

  const handleCashOut = () => {
    if (multiplier > 0 && !isCrashed) {
      socket.emit("cash_out");
      setIsBetPlaced(false); // Disable cashout after it's clicked
    }
  };

  // Conditionally render the bet or cashout button based on game state
  const renderActionButton = () => {
    if (isCrashed) {
      return (
        <button disabled className="bg-green-900 p-3 text-white rounded-lg">
          Place Bet
        </button>
      );
    }

    if (isBetPlaced) {
      return (
        <button
          onClick={handleCashOut}
          disabled={isCrashed}
          className="bg-green-900 p-3 text-white rounded-lg"
        >
          Cash Out
        </button>
      );
    }

    return (
      <button
        onClick={handlePlaceBet}
        disabled={!isBettingOpen || isBetPlaced}
        className="bg-green-900 p-3 text-white rounded-lg"
      >
        Place Bet
      </button>
    );
  };
  return (
    <div className="">
      <div className="flex">
        <ul className="flex gap-2 overflow-hidden">
          <li className="bg-green-600 p-1 px-2 h-6 text-xs font-medium rounded-full text-white flex justify-center items-center">
            1.5X
          </li>
          <li className="bg-green-600 p-1 px-2 h-6 text-xs font-medium rounded-full text-white flex justify-center items-center">
            1.5X
          </li>
          <li className="bg-green-600 p-1 px-2 h-6 text-xs font-medium rounded-full text-white flex justify-center items-center">
            1.5X
          </li>
        </ul>
      </div>
      <div
        className="game md:w-[75vw] my-1 md:h-[62vh] relative"
        ref={gameRef}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {isPlaneVisible && (
          <img
            className="plane z-50"
            src="./plane.gif"
            alt="Flying Plane"
            style={{
              transform: `translate(${planePosition.x}px, -${planePosition.y}px)`,
              transition: "transform 50ms linear",
            }}
          />
        )}
        {!isCrashed && !showLoader ? (
          <div className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 text-5xl font-extrabold z-50">
            {multiplier}x
          </div>
        ) : (
          <>
            <div className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 ">
              <div className="text-3xl font-bold">{message}</div>
              <div className="text-3xl text-[#de3232] font-bold">
                {crashPoint ? crashPoint + "x" : ""}
              </div>
            </div>
          </>
        )}
        {showLoader && (
          <img
            src="/loading-icon.png"
            alt="loading"
            className={`${showLoader ? "loading" : "hidden"} z-50`}
          />
        )}
        <p
          className={`${
            showLoader ? "mt-36 text-[#d20637] text-lg z-50" : "hidden"
          }`}
        >
          Loading...
        </p>
        <img
          src="/bg-rotate.svg"
          alt="..."
          className="w-screen absolute -bottom-[130%] -left-[50%] rotating-background z-0"
        />
      </div>
      <div>
        <div className="flex flex-col md:flex-row gap-1 md:gap-8">
          <div className="bg-black md:w-1/2 p-1 px-4 pb-3 rounded-3xl">
            <div className="w-full flex justify-center my-2">
              <span className="border rounded-full border-gray-700 w-2/6 flex">
                <span className=" rounded-full text-white text-xs p-1 px-5 w-1/2 text-center bg-[#2C2D30]">
                  Bet
                </span>
                <span className=" border-gray-700 rounded-full text-white px-5 w-1/2 text-center text-xs p-1">
                  Auto
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 w-1/3">
                <div className="border border-gray-600 rounded-full bg-black text-white flex">
                  <span
                    className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1 cursor-pointer"
                    onClick={decreaseBet}
                  >
                    {" "}
                    -{" "}
                  </span>
                  <input
                    type="text"
                    className="px-2 bg-black rounded-full w-2/3 outline-none text-center"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                  />
                  <span
                    className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1 cursor-pointer"
                    onClick={increaseBet}
                  >
                    {" "}
                    +{" "}
                  </span>
                </div>
                <div className="flex justify-between gap-1 my-1">
                  <span
                    className="border border-gray-600 rounded-full px-2 w-full text-gray-500 cursor-pointer"
                    onClick={() => setBetAmount(100)}
                  >
                    100
                  </span>
                  <span
                    className="border border-gray-600 rounded-full px-2 w-full text-gray-500 cursor-pointer"
                    onClick={() => setBetAmount(200)}
                  >
                    200
                  </span>
                </div>
                <div className="flex justify-between gap-1 my-1">
                  <span
                    className="border border-gray-600 rounded-full px-2 w-full text-gray-500 cursor-pointer"
                    onClick={() => setBetAmount(500)}
                  >
                    500
                  </span>
                  <span
                    className="border border-gray-600 rounded-full px-2 w-full text-gray-500 cursor-pointer"
                    onClick={() => setBetAmount(1000)}
                  >
                    1000
                  </span>
                </div>
              </div>
              <button
                className={`bg-[${
                  isBetPlaced ? "orange" : "#28A909"
                }] w-full h-24 rounded-lg uppercase p-3 text-xl font-semibold text-white`}
                onClick={isBetPlaced ? handleCashOut : handlePlaceBet}
              >
                {isBetPlaced ? "Cash out" : "Bet"}
              </button>
            </div>
          </div>
          <div className="bg-black md:w-1/2 p-1 px-4 pb-3 rounded-3xl">
            <div className="w-full flex justify-center my-2">
              <span className="border rounded-full border-gray-700 w-2/6 flex">
                <span className=" rounded-full text-white text-xs p-1 px-5 w-1/2 text-center bg-[#2C2D30]">
                  Bet
                </span>
                <span className=" border-gray-700 rounded-full text-white px-5 w-1/2 text-center text-xs p-1">
                  Auto
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 w-1/3">
                <div className="border border-gray-600 rounded-full bg-black text-white flex">
                  <span className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1">
                    {" "}
                    -{" "}
                  </span>
                  <input
                    type="text"
                    className="px-2 bg-black rounded-full w-2/3 outline-none text-center"
                  />
                  <span className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1">
                    {" "}
                    +{" "}
                  </span>
                </div>
                <div className="flex justify-between gap-1 my-1">
                  <span className="border border-gray-600 rounded-full px-2 w-full text-gray-500">
                    100
                  </span>
                  <span className="border border-gray-600 rounded-full px-2 w-full text-gray-500">
                    200
                  </span>
                </div>
                <div className="flex justify-between gap-1 my-1">
                  <span className="border border-gray-600 rounded-full px-2 w-full text-gray-500">
                    500
                  </span>
                  <span className="border border-gray-600 rounded-full px-2 w-full text-gray-500">
                    1000
                  </span>
                </div>
              </div>
              <button className="bg-[#28A909] w-full h-24 rounded-lg uppercase p-3 text-xl font-semibold text-white">
                Bet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
