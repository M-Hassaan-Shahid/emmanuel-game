import { useState, useEffect } from "react";
import { FaAward, FaChevronDown } from "react-icons/fa6";
import { GiTrophyCup } from "react-icons/gi";
import { RxCross2 } from "react-icons/rx";
import api from "../../services/api";

export default function Leaderboard({ onClose }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/getAlluser");
      if (response.data.success) {
        // Sort users by balance (highest first)
        const sortedUsers = (response.data.result || [])
          .filter((user) => user.balance > 0)
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 20); // Top 20
        setLeaders(sortedUsers);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-blue-300";
    if (rank === 3) return "text-orange-400";
    if (rank <= 5) return "text-red-400";
    return "text-gray-400";
  };

  const getTrophyIcon = (rank) => {
    if (rank === 1) {
      return (
        <>
          <GiTrophyCup className="text-yellow-400" />
          <GiTrophyCup className="text-yellow-400" />
        </>
      );
    }
    if (rank === 2) {
      return (
        <>
          <FaAward className="text-blue-300" />
          <GiTrophyCup className="text-blue-300" />
        </>
      );
    }
    if (rank === 3) {
      return (
        <>
          <FaAward className="text-orange-400" />
          <FaAward className="text-orange-400" />
        </>
      );
    }
    if (rank <= 5) {
      return <FaAward className="text-red-400" />;
    }
    return <FaAward className="text-gray-400" />;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-[rgba(0,0,0,0.8)] my-auto w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex flex-col justify-center">
          <h2 className="text-xl text-red-600 font-bold mx-auto mb-4">
            Top Earners
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
              ) : leaders.length === 0 ? (
                <div className="text-white text-center py-8">
                  No leaderboard data available
                </div>
              ) : (
                <>
                  <ul className="flex justify-between border items-center p-2 text-lg text-gray-400 font-medium">
                    <li>
                      <ul className="flex gap-10 font-medium">
                        <li>Rank</li>
                        <li>User</li>
                      </ul>
                    </li>
                    <li>Balance</li>
                  </ul>
                  {leaders.map((user, index) => {
                    const rank = index + 1;
                    const rankColor = getRankColor(rank);
                    return (
                      <ul
                        key={user._id}
                        className="flex justify-between border items-center p-2 text-lg text-gray-400 font-medium my-2"
                      >
                        <li>
                          <ul className="flex gap-10 font-medium">
                            <li className={`text-center w-11 ${rankColor}`}>
                              {rank}
                            </li>
                            <li
                              className={`flex gap-2 items-center ${rankColor}`}
                            >
                              <img
                                src={
                                  user.photo_url ||
                                  "https://thumbs.dreamstime.com/b/d-icon-avatar-cartoon-character-man-businessman-business-suit-looking-camera-isolated-transparent-png-background-277029050.jpg"
                                }
                                alt="avatar"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <p>
                                {user.username || user.user_id || "Anonymous"}
                              </p>
                            </li>
                          </ul>
                        </li>
                        <li className="flex items-center gap-2 text-xl">
                          <span className={rankColor}>⭐ {user.balance}</span>
                          {getTrophyIcon(rank)}
                        </li>
                      </ul>
                    );
                  })}
                </>
              )}
            </div>
            {!loading && leaders.length > 0 && (
              <div className="flex w-full justify-center">
                <FaChevronDown className="text-3xl text-white text-center" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
