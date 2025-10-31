import { useState, useEffect } from "react";
import { GiBackwardTime } from "react-icons/gi";
import { RxCross2 } from "react-icons/rx";
import { FaTelegram } from "react-icons/fa";
import LinkTelegram from "./LinkTelegram";
import { useAuth } from "../../services/AuthContext";
import { getUserBets } from "../../services/api";

const ProfileModel = ({ onClose }) => {
  const [showLinkTelegram, setShowLinkTelegram] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    firstGameDate: null,
  });
  const [recentBets, setRecentBets] = useState([]);
  const isTelegramLinked = user?.telegramId;

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const data = await getUserBets(userId);
      if (data.success && data.result) {
        const bets = data.result;
        // Correct mapping: status 'cashed_out' = win, status 'lost' = loss
        const wins = bets.filter((b) => b.status === "cashed_out").length;
        const losses = bets.filter((b) => b.status === "lost").length;
        const winRate =
          bets.length > 0 ? ((wins / bets.length) * 100).toFixed(1) : 0;
        const firstGame =
          bets.length > 0 ? new Date(bets[bets.length - 1].createdAt) : null;

        setStats({
          totalGames: bets.length,
          wins,
          losses,
          winRate,
          firstGameDate: firstGame,
        });

        // Get recent 6 bets
        setRecentBets(bets.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  return (
    <>
      {showLinkTelegram && (
        <LinkTelegram onClose={() => setShowLinkTelegram(false)} />
      )}
      {!showLinkTelegram && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 p-4 overflow-y-auto">
          <div className="bg-[rgba(0,0,0,0.7)] my-auto w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-[rgba(0,0,0,0.0)] relative p-4 flex flex-col justify-center">
              <RxCross2
                className="text-white text-2xl sm:text-3xl cursor-pointer absolute top-3 right-2"
                onClick={onClose}
              />
            </div>
            <div className="p-6 flex flex-col items-center overflow-y-auto">
              <div className="w-full max-w-2xl">
                <div className="flex items-center gap-2 text-white justify-around my-3">
                  <img
                    src={
                      user?.photo_url ||
                      "https://thumbs.dreamstime.com/b/d-icon-avatar-cartoon-character-man-businessman-business-suit-looking-camera-isolated-transparent-png-background-277029050.jpg"
                    }
                    alt="..."
                    className="w-20 md:w-20 rounded-full"
                  />
                  <div>
                    <p className="text-xl">
                      User : {user?.username || user?.user_id || "*****"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Balance: ⭐ {user?.balance || 0}
                    </p>
                  </div>
                </div>

                {/* Telegram Link Button */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowLinkTelegram(true)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                      isTelegramLinked
                        ? "bg-green-600 hover:bg-green-500 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    <FaTelegram className="text-2xl" />
                    {isTelegramLinked
                      ? "✓ Telegram Linked"
                      : "Link Telegram Account"}
                  </button>
                  {!isTelegramLinked && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Link to buy Stars via Telegram
                    </p>
                  )}
                </div>
                <div className="bg-[rgba(0,0,0,0.8)] text-white overflow-hidden rounded-lg">
                  <p
                    className="text-white font-medium text-center py-2"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(249, 25, 25, 0.53) 50%, rgba(0,0,0,0.5) 100%)",
                    }}
                  >
                    Your Summary
                  </p>
                  <div className="w-full flex flex-col items-center py-5 border-b border-red-500">
                    <p className="text-ms font-semibold">
                      Your first game was on
                    </p>
                    <p className="text-red-500 font-semibold">
                      {stats.firstGameDate
                        ? stats.firstGameDate.toLocaleDateString("en-GB")
                        : "No games yet"}
                    </p>
                  </div>
                  <div className="w-full flex flex-col items-center py-5 border-b border-red-500">
                    <p className="text-ms font-semibold">Total Games Played</p>
                    <p className="font-semibold text-red-500">
                      {stats.totalGames} Games
                    </p>
                  </div>
                  <div className="w-full flex items-center py-5 px-4 text-md justify-between">
                    <span className="text-center">
                      <p>Matches</p>
                      <span className="text-red-500 font-semibold">
                        {stats.totalGames}
                      </span>
                    </span>
                    <span className="text-center">
                      <p>Wins</p>
                      <span className="text-red-500 font-semibold">
                        {stats.wins}
                      </span>
                    </span>
                    <span className="text-center">
                      <p>Losses</p>
                      <span className="text-red-500 font-semibold">
                        {stats.losses}
                      </span>
                    </span>
                    <span className="text-center">
                      <p>Winrate</p>
                      <span className="text-red-500 font-semibold">
                        {stats.winRate}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModel;
