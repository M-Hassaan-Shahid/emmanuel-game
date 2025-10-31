import { useState, useEffect } from "react";
import axios from "axios";

const BroadcastBanner = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (broadcasts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % broadcasts.length);
      }, 5000); // Change message every 5 seconds
      return () => clearInterval(interval);
    }
  }, [broadcasts.length]);

  const fetchBroadcasts = async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:8000";
      const response = await axios.get(`${backendUrl}/api/broadcasts/active`);
      if (response.data.success) {
        setBroadcasts(response.data.broadcasts);
      }
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-600 border-green-700";
      case "warning":
        return "bg-yellow-600 border-yellow-700";
      case "error":
        return "bg-red-600 border-red-700";
      default:
        return "bg-blue-600 border-blue-700";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "📢";
    }
  };

  if (!isVisible || broadcasts.length === 0) return null;

  const currentBroadcast = broadcasts[currentIndex];

  return (
    <div
      className={`${getTypeStyles(
        currentBroadcast.type
      )} border-2 rounded-lg p-4 mb-4 shadow-lg animate-fade-in`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{getTypeIcon(currentBroadcast.type)}</span>
          <div className="flex-1">
            <p className="text-white font-medium">{currentBroadcast.message}</p>
            {broadcasts.length > 1 && (
              <p className="text-white text-xs mt-1 opacity-75">
                {currentIndex + 1} / {broadcasts.length}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 text-xl font-bold ml-4"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BroadcastBanner;
