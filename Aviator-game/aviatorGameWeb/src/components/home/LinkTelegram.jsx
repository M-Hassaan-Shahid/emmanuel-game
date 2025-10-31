import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { useAuth } from "../../services/AuthContext";
import api from "../../services/api";

export default function LinkTelegram({ onClose }) {
  const [linkCode, setLinkCode] = useState("");
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [botUsername, setBotUsername] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    checkLinkStatus();
  }, []);

  useEffect(() => {
    if (expiresIn > 0) {
      const timer = setInterval(() => {
        setExpiresIn((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [expiresIn]);

  const checkLinkStatus = async () => {
    try {
      if (!user?._id) return;
      const response = await api.get(
        `/api/telegram-link/link-status/${user._id}`
      );
      if (response.data.success && response.data.isLinked) {
        setIsLinked(true);
      }
    } catch (error) {
      console.error("Check link status error:", error);
    }
  };

  const generateLinkCode = async () => {
    try {
      setLoading(true);
      if (!user?._id) {
        toast.error("Please login first");
        return;
      }

      const response = await api.post("/api/telegram-link/generate-link-code", {
        userId: user._id,
      });

      if (response.data.success) {
        if (response.data.alreadyLinked) {
          setIsLinked(true);
          toast.info("Telegram account already linked");
        } else {
          setLinkCode(response.data.linkCode);
          setBotUsername(response.data.botUsername);
          setExpiresIn(response.data.expiresIn);
          toast.success("Link code generated!");
        }
      }
    } catch (error) {
      console.error("Generate link code error:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate link code"
      );
    } finally {
      setLoading(false);
    }
  };

  const unlinkAccount = async () => {
    try {
      setLoading(true);
      if (!user?._id) return;

      const response = await api.post("/api/telegram-link/unlink", {
        userId: user._id,
      });

      if (response.data.success) {
        setIsLinked(false);
        setLinkCode("");
        const updatedUser = { ...user, telegramId: null };
        updateUser(updatedUser);
        toast.success("Telegram account unlinked");
      }
    } catch (error) {
      console.error("Unlink error:", error);
      toast.error(error.response?.data?.message || "Failed to unlink account");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-[rgba(0,0,0,0.9)] my-auto w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden border border-gray-700 flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl text-blue-500 font-bold">
            Link Telegram Account
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer hover:text-red-500 transition"
            onClick={onClose}
          />
        </div>

        <div className="p-6 overflow-y-auto">
          {isLinked ? (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Account Linked!
              </h3>
              <p className="text-gray-400 mb-6">
                Your Telegram account is connected. You can now buy Stars
                through Telegram and use them on the website.
              </p>
              <button
                onClick={unlinkAccount}
                disabled={loading}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Unlinking..." : "Unlink Account"}
              </button>
            </div>
          ) : linkCode ? (
            <div className="text-center">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-white text-xl font-semibold mb-4">
                Link Code Generated
              </h3>

              <div className="bg-[rgba(255,255,255,0.1)] p-6 rounded-lg mb-4">
                <p className="text-gray-400 text-sm mb-2">Your Link Code:</p>
                <div className="text-4xl font-bold text-blue-500 mb-2 tracking-wider">
                  {linkCode}
                </div>
                <p className="text-red-400 text-sm">
                  Expires in: {formatTime(expiresIn)}
                </p>
              </div>

              <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg mb-4 text-left">
                <p className="text-white font-semibold mb-2">Steps to Link:</p>
                <ol className="text-gray-300 text-sm space-y-2">
                  <li>1. Open Telegram</li>
                  <li>
                    2. Search for{" "}
                    <span className="text-blue-400">@{botUsername}</span>
                  </li>
                  <li>
                    3. Send:{" "}
                    <span className="text-blue-400">/start {linkCode}</span>
                  </li>
                  <li>4. Your account will be linked automatically!</li>
                </ol>
              </div>

              <a
                href={`https://t.me/${botUsername}?start=${linkCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition mb-3"
              >
                Open in Telegram
              </a>

              <button
                onClick={() => {
                  setLinkCode("");
                  setExpiresIn(0);
                }}
                className="text-gray-400 hover:text-white transition text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Connect Your Telegram
              </h3>
              <p className="text-gray-400 mb-6">
                Link your Telegram account to buy Stars and sync your balance
                across platforms.
              </p>

              <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg mb-6 text-left">
                <p className="text-white font-semibold mb-2">Benefits:</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>✓ Buy Stars directly through Telegram</li>
                  <li>✓ Instant balance sync</li>
                  <li>✓ Secure payment via Telegram</li>
                  <li>✓ Use Stars on website and bot</li>
                </ul>
              </div>

              <button
                onClick={generateLinkCode}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Link Code"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
