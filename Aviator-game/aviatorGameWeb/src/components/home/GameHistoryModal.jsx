import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { getUserBets } from "../../services/api";

export default function GameHistoryModal({ onClose }) {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameHistory();
  }, []);

  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      console.log("📊 Fetching game history for user:", userId);
      const data = await getUserBets(userId);
      console.log("📊 Game history response:", data);
      if (data.success) {
        const betsData = Array.isArray(data.result) ? data.result : [];
        console.log("📊 Loaded bets:", betsData.length);
        setBets(betsData);
      }
    } catch (error) {
      console.error("❌ Error fetching game history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  const getResultColor = (result) => {
    return result === "win" ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-[rgba(0,0,0,0.6)] my-auto w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex flex-col justify-center">
          <h2 className="text-xl text-red-600 font-bold mx-auto mb-4">
            Game History
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer absolute top-3 right-2"
            onClick={onClose}
          />
        </div>
        <div className="overflow-y-auto">
          <div className="relative overflow-x-auto p-4">
            <div className="max-h-[50vh] overflow-y-auto hide-scrollbar">
              {loading ? (
                <div className="text-white text-center py-8">Loading...</div>
              ) : bets.length === 0 ? (
                <div className="text-white text-center py-8">
                  No game history found
                </div>
              ) : (
                <>
                  <ul className="flex justify-between text-white gap-2">
                    <li className="bg-sky-600 px-2 py-1 rounded-full w-full text-xs text-center font-medium">
                      Date
                    </li>
                    <li className="bg-sky-600 px-2 py-1 rounded-full w-full text-xs text-center font-medium">
                      Bet Stars
                    </li>
                    <li className="bg-sky-600 px-2 py-1 rounded-full w-full text-xs text-center font-medium">
                      Multiplier
                    </li>
                    <li className="bg-sky-600 px-2 py-1 rounded-full w-full text-xs text-center font-medium">
                      Earnings Stars
                    </li>
                    <li className="bg-sky-600 px-2 py-1 rounded-full w-full text-xs text-center font-medium">
                      Result
                    </li>
                  </ul>
                  {bets.map((bet, index) => (
                    <ul
                      key={index}
                      className="flex justify-between text-white gap-2 border-2 border-red-600 items-center my-2"
                    >
                      <li className="px-2 py-1 rounded-full w-full text-xs text-center font-medium">
                        {formatDate(bet.createdAt)}
                      </li>
                      <li className="px-2 py-1 w-full text-md text-center font-medium">
                        ⭐ {bet.bet_amount || bet.betAmount || 0}
                      </li>
                      <li className="px-2 py-1 w-full text-md text-center font-medium">
                        {bet.cashout_multiplier
                          ? `${bet.cashout_multiplier.toFixed(2)}X`
                          : bet.crash_multiplier
                          ? `${bet.crash_multiplier.toFixed(2)}X`
                          : "-"}
                      </li>
                      <li className="px-2 py-1 w-full text-md text-center font-medium">
                        ⭐{" "}
                        {bet.winnings
                          ? bet.winnings.toFixed(2)
                          : bet.winAmount || 0}
                      </li>
                      <li
                        className={`px-2 py-1 w-full text-md text-center font-medium capitalize ${
                          bet.status === "cashed_out"
                            ? "text-green-500"
                            : bet.status === "lost"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {bet.status === "cashed_out"
                          ? "Win"
                          : bet.status === "lost"
                          ? "Lost"
                          : bet.status === "active"
                          ? "Active"
                          : "Pending"}
                      </li>
                    </ul>
                  ))}
                </>
              )}
            </div>
            <p className="text-lg text-white my-3">
              Total Games Played: {bets.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
