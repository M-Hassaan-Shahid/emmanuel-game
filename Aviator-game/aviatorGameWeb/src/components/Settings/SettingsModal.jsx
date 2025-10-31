import { useState, useEffect } from "react";
import { FaTimes, FaVolumeUp, FaVolumeMute, FaCog } from "react-icons/fa";

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 70,
    musicVolume: 50,
    showAnimations: true,
    autoPlayNext: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("gameSettings", JSON.stringify(newSettings));

    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("settingsChanged", { detail: newSettings })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FaCog className="text-2xl text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sound Effects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium flex items-center gap-2">
                {settings.soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                Sound Effects
              </label>
              <button
                onClick={() =>
                  handleSettingChange("soundEnabled", !settings.soundEnabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {settings.soundEnabled && (
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume}
                onChange={(e) =>
                  handleSettingChange("soundVolume", parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            )}
          </div>

          {/* Background Music */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium flex items-center gap-2">
                {settings.musicEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                Background Music
              </label>
              <button
                onClick={() =>
                  handleSettingChange("musicEnabled", !settings.musicEnabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.musicEnabled ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.musicEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {settings.musicEnabled && (
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) =>
                  handleSettingChange("musicVolume", parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            )}
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Show Animations</label>
            <button
              onClick={() =>
                handleSettingChange("showAnimations", !settings.showAnimations)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showAnimations ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showAnimations ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Auto Play Next Round */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">
              Auto Play Next Round
            </label>
            <button
              onClick={() =>
                handleSettingChange("autoPlayNext", !settings.autoPlayNext)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoPlayNext ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoPlayNext ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => {
              const defaultSettings = {
                soundEnabled: true,
                musicEnabled: true,
                soundVolume: 70,
                musicVolume: 50,
                showAnimations: true,
                autoPlayNext: false,
              };
              setSettings(defaultSettings);
              localStorage.setItem(
                "gameSettings",
                JSON.stringify(defaultSettings)
              );
              window.dispatchEvent(
                new CustomEvent("settingsChanged", { detail: defaultSettings })
              );
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
