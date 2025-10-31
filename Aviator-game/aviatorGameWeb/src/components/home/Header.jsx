import { useState, useEffect } from "react";
import logo from "./../../assets/images/game play/game play/logo.png";
import coin from "./../../assets/images/home/coin.png";
import setting from "./../../assets/images/home/settings.png";
import exit from "./../../assets/images/home/exit-game.png";
import sound from "./../../assets/images/home/sound.png";
import music from "./../../assets/images/home/music.png";
import quick from "./../../assets/images/home/quick-share-seeklogo.png";
import whatsapp from "./../../assets/images/home/WhatsApp_icon.png";
import facebook from "./../../assets/images/home/facebook-logo-2428.png";
import insta from "./../../assets/images/home/—Pngtree—instagram icon_8704817.png";
import { useAuth } from "../../services/AuthContext";
import backgroundMusic from "../../services/backgroundMusic";

import { FaShareNodes, FaGift } from "react-icons/fa6";
import { HiSpeakerphone } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
export default function Header({ hideFooter, setActiveModal }) {
  const openModal = (modalType) => {
    setActiveModal(modalType);
    hideFooter(true); // Hide footer when modal opens
  };
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [toggle, setToggle] = useState({
    sound: false,
    share: false,
    broadcast: false,
    promocode: false,
  });

  const [broadcasts, setBroadcasts] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);

  // Listen for balance updates
  useEffect(() => {
    const handleBalanceUpdate = (event) => {
      if (user && event.detail.balance !== undefined) {
        updateUser({ ...user, balance: event.detail.balance });
      }
    };

    window.addEventListener("balanceUpdated", handleBalanceUpdate);
    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceUpdate);
    };
  }, [user, updateUser]);

  // Auto-refresh balance periodically (every 30 seconds)
  useEffect(() => {
    const refreshUserBalance = async () => {
      if (user) {
        try {
          const userId = localStorage.getItem("userId");
          const data = await axios.post(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:8000"
            }/api/getSingleuser`,
            { id: userId }
          );
          if (data.data.success && data.data.result) {
            updateUser({ ...user, balance: data.data.result.balance });
          }
        } catch (error) {
          console.error("Error refreshing balance:", error);
        }
      }
    };

    // Refresh immediately on mount
    refreshUserBalance();

    // Then refresh every 30 seconds
    const interval = setInterval(refreshUserBalance, 30000);

    return () => clearInterval(interval);
  }, [user, updateUser]);

  // Settings state
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          soundEnabled:
            parsed.soundEnabled !== undefined ? parsed.soundEnabled : true,
          musicEnabled:
            parsed.musicEnabled !== undefined ? parsed.musicEnabled : true,
        });
      } catch (error) {
        console.error("Error parsing settings:", error);
        initializeDefaultSettings();
      }
    } else {
      initializeDefaultSettings();
    }
  }, []);

  const initializeDefaultSettings = () => {
    const defaultSettings = {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 70,
      musicVolume: 50,
    };
    localStorage.setItem("gameSettings", JSON.stringify(defaultSettings));
    setSettings({
      soundEnabled: true,
      musicEnabled: true,
    });
  };

  // Initialize background music on mount
  useEffect(() => {
    backgroundMusic.initialize();

    // Check saved settings and control music accordingly
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);

        if (settings.musicEnabled) {
          backgroundMusic.updateSettings(settings);
          backgroundMusic.play();
        } else {
          backgroundMusic.pause();
        }
      } catch (error) {
        console.error("Error initializing music:", error);
      }
    } else {
      // No saved settings, use defaults (music enabled)
      backgroundMusic.play();
    }

    return () => {
      backgroundMusic.pause();
    };
  }, []);

  // Fetch broadcasts
  useEffect(() => {
    fetchBroadcasts();
    fetchPromoCodes();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.get(`${backendUrl}/api/broadcasts/active`);
      if (response.data.success) {
        setBroadcasts(response.data.broadcasts);
      }
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.get(`${backendUrl}/api/promocodes`);
      if (response.data.success) {
        // Filter only active admin promo codes
        const adminCodes = response.data.result.filter(
          (code) => code.type === "admin" && code.isActive
        );
        setPromoCodes(adminCodes);
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    }
  };

  const handleToggle = (type) => {
    setToggle((prevState) => {
      // Close all other toggles when opening a new one
      const newState = {
        sound: false,
        share: false,
        broadcast: false,
        promocode: false,
      };
      newState[type] = !prevState[type];
      return newState;
    });
  };

  // Close toggles when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside all toggle menus
      const isOutside =
        !event.target.closest(".toggle-menu") &&
        !event.target.closest(".toggle-button");
      if (isOutside) {
        setToggle({
          sound: false,
          share: false,
          broadcast: false,
          promocode: false,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logout successful!");
  };

  return (
    <div className="bg-[rgba(0,0,0,0.6)] h-16 sm:h-20 flex items-center justify-between px-2 sm:px-4 md:px-8 lg:px-12">
      <div className="flex w-auto sm:w-1/2 md:w-1/3 lg:w-2/5 gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center justify-start">
        <img
          src={logo}
          alt="logo"
          className="w-16 h-8 sm:w-24 sm:h-12 md:w-32 md:h-16 object-contain cursor-pointer"
          onClick={() => navigate("/home")}
        />
        <span
          className="flex cursor-pointer"
          onClick={() => openModal("profile")}
        >
          <img
            src="https://thumbs.dreamstime.com/b/d-icon-avatar-cartoon-character-man-businessman-business-suit-looking-camera-isolated-transparent-png-background-277029050.jpg"
            alt="..."
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 rounded-full object-cover"
          />
          <p className="bg-green-600 text-center px-1.5 sm:px-2 md:px-3 flex items-center text-white text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            {user?.user_id || user?.contact || "*****"}
          </p>
        </span>
        <span className="hidden sm:flex flex-col justify-center items-center text-white cursor-pointer relative toggle-button">
          <FaShareNodes
            className="text-lg sm:text-xl md:text-2xl"
            onClick={() => handleToggle("share")}
          />
          <p className="text-[10px] sm:text-xs md:text-sm">Share</p>
          {toggle.share && (
            <div className="absolute top-20 bg-[rgba(0,0,0,0.6)] rounded-lg w-max p-2 toggle-menu z-50">
              <div className="flex gap-3 mb-2 items-center">
                <p className="text-white text-sm">{window.location.origin}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="text-white hover:bg-gray-100 hover:text-black rounded-lg py-2 px-2.5 inline-flex items-center justify-center bg-transparent border-gray-200 border transition"
                >
                  <span className="text-xs font-semibold">Copy</span>
                </button>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-4 gap-3">
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.origin);
                    const text = encodeURIComponent(
                      "Check out this awesome Aviator game!"
                    );
                    window.open(
                      `https://wa.me/?text=${text}%20${url}`,
                      "_blank"
                    );
                  }}
                  className="hover:opacity-80 transition"
                  title="Share on WhatsApp"
                >
                  <img src={whatsapp} alt="WhatsApp" className="w-8 h-8" />
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.origin);
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                      "_blank"
                    );
                  }}
                  className="hover:opacity-80 transition"
                  title="Share on Facebook"
                >
                  <img src={facebook} alt="Facebook" className="w-8 h-8" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    toast.info("Link copied! Share it on Instagram");
                  }}
                  className="hover:opacity-80 transition"
                  title="Copy for Instagram"
                >
                  <img src={insta} alt="Instagram" className="w-8 h-8" />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Aviator Game",
                        text: "Check out this awesome Aviator game!",
                        url: window.location.origin,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.origin);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="hover:opacity-80 transition"
                  title="Share"
                >
                  <img src={quick} alt="Share" className="w-8 h-8" />
                </button>
              </div>
            </div>
          )}
        </span>
      </div>
      <div className="flex w-auto sm:w-1/2 md:w-1/3 lg:w-2/5 gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center justify-end">
        <span className="flex flex-col justify-center items-center text-white cursor-pointer">
          <img
            src={coin}
            alt="coin"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            ⭐ {user?.balance || 0}
          </p>
        </span>
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer relative toggle-button"
          onClick={() => handleToggle("broadcast")}
        >
          <HiSpeakerphone className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-400" />
          <p className="font-semibold text-[10px] sm:text-xs md:text-sm hidden sm:block">
            News
          </p>
          {broadcasts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
              {broadcasts.length}
            </span>
          )}
          {toggle.broadcast && (
            <div
              className="absolute top-16 right-0 bg-gray-900 rounded-lg w-80 max-h-96 overflow-y-auto p-4 z-50 shadow-xl border border-gray-700 toggle-menu"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <HiSpeakerphone className="text-yellow-400" />
                Announcements
              </h3>
              {broadcasts.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No announcements at this time.
                </p>
              ) : (
                <div className="space-y-3">
                  {broadcasts.map((broadcast) => (
                    <div
                      key={broadcast._id}
                      className={`p-3 rounded-lg ${
                        broadcast.type === "success"
                          ? "bg-green-900/30 border border-green-700"
                          : broadcast.type === "warning"
                          ? "bg-yellow-900/30 border border-yellow-700"
                          : broadcast.type === "error"
                          ? "bg-red-900/30 border border-red-700"
                          : "bg-blue-900/30 border border-blue-700"
                      }`}
                    >
                      <p className="text-white text-sm">{broadcast.message}</p>
                      {broadcast.expiresAt && (
                        <p className="text-gray-400 text-xs mt-2">
                          Expires:{" "}
                          {new Date(broadcast.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </span>
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer relative toggle-button"
          onClick={() => handleToggle("sound")}
        >
          <img
            src={setting}
            alt="settings"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[10px] sm:text-xs md:text-sm hidden sm:block">
            Settings
          </p>
          {toggle.sound && (
            <div
              className="absolute -bottom-24 bg-[rgba(0,0,0,0.6)] rounded-lg w-max p-2 z-50 toggle-menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-3 mb-2">
                <img src={sound} alt="sound" className="w-8" />
                <label
                  htmlFor="sound-toggle"
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="sound-toggle"
                    name="sound-toggle"
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        soundEnabled: e.target.checked,
                      };
                      setSettings(newSettings);
                      const fullSettings = JSON.parse(
                        localStorage.getItem("gameSettings") || "{}"
                      );
                      fullSettings.soundEnabled = e.target.checked;
                      fullSettings.soundVolume = fullSettings.soundVolume || 70;
                      localStorage.setItem(
                        "gameSettings",
                        JSON.stringify(fullSettings)
                      );

                      // Notify sound manager of settings change
                      window.dispatchEvent(
                        new CustomEvent("settingsChanged", {
                          detail: fullSettings,
                        })
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 border-2 bg-transparent outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
              <div className="flex gap-3">
                <img src={music} alt="music" className="w-8" />
                <label
                  htmlFor="music-toggle"
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="music-toggle"
                    name="music-toggle"
                    checked={settings.musicEnabled}
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        musicEnabled: e.target.checked,
                      };
                      setSettings(newSettings);
                      const fullSettings = JSON.parse(
                        localStorage.getItem("gameSettings") || "{}"
                      );
                      fullSettings.musicEnabled = e.target.checked;
                      fullSettings.musicVolume = fullSettings.musicVolume || 50;
                      localStorage.setItem(
                        "gameSettings",
                        JSON.stringify(fullSettings)
                      );

                      // Notify sound manager of settings change BEFORE playing
                      window.dispatchEvent(
                        new CustomEvent("settingsChanged", {
                          detail: fullSettings,
                        })
                      );

                      // Then control background music (after settings are updated)
                      if (e.target.checked) {
                        backgroundMusic.play();
                      } else {
                        backgroundMusic.pause();
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 border-2 bg-transparent outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          )}
        </span>
        <span
          className="flex flex-col justify-center items-center text-white cursor-pointer"
          onClick={handleLogout}
        >
          <img
            src={exit}
            alt="exit"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-11 md:h-11"
          />
          <p className="font-semibold text-[10px] sm:text-xs md:text-sm hidden sm:block">
            Exit
          </p>
        </span>
      </div>
    </div>
  );
}
