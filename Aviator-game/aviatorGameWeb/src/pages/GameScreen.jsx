import React from "react";
import Header from "../components/home/Header";
import Planefly from "../components/Game/Planefly";
import ProfileModel from "../components/home/ProfileModel";
import socket from "../services/socket";
import { getUserId } from "../services/userService";

export default function GameScreen() {
  const [allBets, setAllBets] = React.useState([]);
  const [myBets, setMyBets] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState("all");
  const [activeModal, setActiveModal] = React.useState(null);
  const [isFooterHidden, setIsFooterHidden] = React.useState(false);
  const currentUserId = getUserId();

  const handleHideFooter = (hide) => {
    setIsFooterHidden(hide);
  };

  const closeModal = () => {
    setActiveModal(null);
    handleHideFooter(false);
  };

  // Load existing bets from database on mount
  React.useEffect(() => {
    const loadExistingBets = async () => {
      try {
        const backendUrl =
          import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/getSinglebet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        });

        const data = await response.json();
        if (data.success && Array.isArray(data.result)) {
          console.log(
            "📚 Loaded existing bets from database:",
            data.result.length
          );

          // Convert database bets to display format
          const formattedBets = data.result
            .filter(
              (bet) => bet.status === "active" || bet.status === "cashed_out"
            )
            .slice(0, 50)
            .map((bet) => ({
              id: bet.userId || bet.user_id || "Unknown",
              img: "https://thumbs.dreamstime.com/b/d-icon-avatar-cartoon-character-man-businessman-business-suit-looking-camera-isolated-transparent-png-background-277029050.jpg",
              bet: bet.bet_amount || bet.betAmount,
              mult:
                bet.status === "cashed_out"
                  ? `${bet.cashout_multiplier}X`
                  : "-",
              cashout: bet.status === "cashed_out" ? bet.winnings : "-",
              betId: bet._id,
            }));

          setMyBets(formattedBets);
        }

        // Load all active bets for "All Bets" tab
        const allBetsResponse = await fetch(
          `${backendUrl}/api/getAllbet?limit=50&page=1`
        );
        const allBetsData = await allBetsResponse.json();

        if (allBetsData.success && Array.isArray(allBetsData.result)) {
          console.log("📚 Loaded all active bets:", allBetsData.result.length);

          const formattedAllBets = allBetsData.result
            .filter(
              (bet) => bet.status === "active" || bet.status === "cashed_out"
            )
            .slice(0, 50)
            .map((bet) => ({
              id: bet.userId || bet.user_id || "Unknown",
              img: "https://thumbs.dreamstime.com/b/d-icon-avatar-cartoon-character-man-businessman-business-suit-looking-camera-isolated-transparent-png-background-277029050.jpg",
              bet: bet.bet_amount || bet.betAmount,
              mult:
                bet.status === "cashed_out"
                  ? `${bet.cashout_multiplier}X`
                  : "-",
              cashout: bet.status === "cashed_out" ? bet.winnings : "-",
              betId: bet._id,
            }));

          setAllBets(formattedAllBets);
        }
      } catch (error) {
        console.error("❌ Error loading existing bets:", error);
      }
    };

    loadExistingBets();
  }, [currentUserId]);

  React.useEffect(() => {
    console.log("🎮 GameScreen: Setting up bet listeners");
    console.log("🔌 Socket connected:", socket.connected);
    console.log("🔌 Socket ID:", socket.id);

    // Listen for all bets placed
    socket.on("bet_placed", (betData) => {
      console.log("📊 GameScreen: Bet placed event received:", betData);
      const newBet = {
        id: betData.user_id || betData.userId,
        img:
          betData.photo_url ||
          "https://thumbs.dreamstime.com/b/d-icon-avatar-cartoon-character-man-businessman-business-suit-looking-camera-isolated-transparent-png-background-277029050.jpg",
        bet: betData.betAmount,
        mult: "-",
        cashout: "-",
        betId: betData.betId,
      };

      setAllBets((prev) => {
        const updated = [newBet, ...prev].slice(0, 50);
        console.log("📊 All bets updated:", updated.length);
        return updated;
      });

      // If it's current user's bet, add to myBets
      if (betData.userId === currentUserId) {
        setMyBets((prev) => {
          const updated = [newBet, ...prev].slice(0, 50);
          console.log("📊 My bets updated:", updated.length);
          return updated;
        });
      }
    });

    // Listen for cash outs from other players
    socket.on("bet_cashed_out", (cashoutData) => {
      console.log("💰 GameScreen: Bet cashed out event:", cashoutData);
      const updateBet = (bet) => {
        if (bet.betId === cashoutData.betId) {
          return {
            ...bet,
            cashout: cashoutData.cashout,
            mult: cashoutData.multiplier,
          };
        }
        return bet;
      };

      setAllBets((prev) => prev.map(updateBet));
      setMyBets((prev) => prev.map(updateBet));
    });

    // Listen for own cash outs
    socket.on("cash_out_success", (cashoutData) => {
      console.log("💰 GameScreen: Cash out success event:", cashoutData);
      const updateBet = (bet) => {
        if (bet.betId === cashoutData.betId) {
          return {
            ...bet,
            cashout: cashoutData.winnings,
            mult: `${cashoutData.multiplier}X`,
          };
        }
        return bet;
      };

      setAllBets((prev) => prev.map(updateBet));
      setMyBets((prev) => prev.map(updateBet));
    });

    // Clear bets when new round starts (commented out for debugging)
    socket.on("multiplier_reset", () => {
      console.log(
        "🔄 GameScreen: New round starting - keeping bets visible for debugging"
      );
      // Temporarily disabled to see if bets are being added
      // setAllBets([]);
      // setMyBets([]);
    });

    return () => {
      socket.off("bet_placed");
      socket.off("bet_cashed_out");
      socket.off("cash_out_success");
      socket.off("multiplier_reset");
    };
  }, [currentUserId]);

  const displayBets = activeTab === "all" ? allBets : myBets;

  return (
    <div className="bg-black w-screen">
      <Header hideFooter={handleHideFooter} setActiveModal={setActiveModal} />

      <div className="flex justify-between flex-col md:flex-row gap-3 px-2">
        <div className="w-full md:w-[25vw] lg:w-[22vw]">
          <div className="w-full flex justify-center my-2">
            <span className="border rounded-full border-gray-700">
              <span
                onClick={() => setActiveTab("all")}
                className={`border border-gray-700 rounded-full text-white text-xs sm:text-sm p-1 px-2 sm:px-3 cursor-pointer transition ${
                  activeTab === "all" ? "bg-gray-900" : "hover:bg-gray-800"
                }`}
              >
                All Bets
              </span>
              <span
                onClick={() => setActiveTab("my")}
                className={`border-gray-700 rounded-full text-white text-xs sm:text-sm p-1 px-2 sm:px-3 cursor-pointer transition ${
                  activeTab === "my" ? "bg-gray-900" : "hover:bg-gray-800"
                }`}
              >
                My Bets
              </span>
            </span>
          </div>
          <div className="border max-h-[50vh] md:h-screen rounded-2xl border-gray-700 bg-gray-900 p-2 px-3 overflow-y-auto overflow-x-auto">
            <p className="text-white uppercase text-xs sm:text-sm">
              Total bets:{" "}
              <span className="text-green-700">{displayBets.length}</span>
            </p>
            <table className="w-full text-gray-400 my-2 table-fixed min-w-[400px]">
              <thead>
                <tr className="flex justify-between px-2 sm:px-4">
                  <th className="font-thin text-xs sm:text-sm w-[35%] text-left">
                    User
                  </th>
                  <th className="font-thin text-xs sm:text-sm w-[22%] text-center">
                    Bet
                  </th>
                  <th className="font-thin text-xs sm:text-sm w-[20%] text-center">
                    Mult.
                  </th>
                  <th className="font-thin text-xs sm:text-sm w-[23%] text-right">
                    Cash out
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayBets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-8">
                      {activeTab === "all"
                        ? "No bets placed yet"
                        : "You haven't placed any bets yet"}
                    </td>
                  </tr>
                ) : (
                  displayBets.map((user, index) => (
                    <tr
                      key={index}
                      className="text-white flex justify-between items-center bg-black px-2 sm:px-4 py-2 my-1.5 rounded-xl"
                    >
                      <td className="flex items-center gap-1.5 sm:gap-2 w-[35%] min-w-0">
                        <img
                          src={user.img}
                          alt=".."
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex-shrink-0"
                        />
                        <p className="text-xs sm:text-sm truncate">{user.id}</p>
                      </td>
                      <td className="w-[22%] text-center">
                        <span className="inline-block border rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs whitespace-nowrap">
                          ⭐ {user.bet}
                        </span>
                      </td>
                      <td className="text-xs sm:text-sm w-[20%] text-center font-medium text-green-400">
                        {user.mult || "-"}
                      </td>
                      <td className="text-xs sm:text-sm w-[23%] text-right font-medium">
                        {user.cashout !== "-" ? `⭐ ${user.cashout}` : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className='w-4/6'> */}
        <div className="w-full px-4">
          <Planefly />
        </div>
        {/* </div> */}
      </div>

      {/* Modals */}
      {activeModal === "profile" && <ProfileModel onClose={closeModal} />}
    </div>
  );
}
