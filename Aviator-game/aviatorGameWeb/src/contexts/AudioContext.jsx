import React, { createContext, useContext, useEffect, useState } from "react";
import backgroundMusic from "../services/backgroundMusic";
import soundManager from "../services/soundManager";

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  useEffect(() => {
    // Initialize background music using the centralized service
    backgroundMusic.initialize();

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setIsMusicEnabled(
          settings.musicEnabled !== undefined ? settings.musicEnabled : true
        );
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    // Listen for settings changes
    const handleSettingsChange = (event) => {
      const settings = event.detail;
      setIsMusicEnabled(settings.musicEnabled);
      setIsMusicPlaying(settings.musicEnabled);
    };

    window.addEventListener("settingsChanged", handleSettingsChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("settingsChanged", handleSettingsChange);
      backgroundMusic.pause();
    };
  }, []);

  const playMusic = () => {
    if (soundManager.isMusicEnabled()) {
      backgroundMusic.play();
      setIsMusicPlaying(true);
    }
  };

  const pauseMusic = () => {
    backgroundMusic.pause();
    setIsMusicPlaying(false);
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const setMusicEnabledFunc = (enabled) => {
    setIsMusicEnabled(enabled);

    // Update localStorage
    const savedSettings = localStorage.getItem("gameSettings") || "{}";
    const settings = JSON.parse(savedSettings);
    settings.musicEnabled = enabled;
    localStorage.setItem("gameSettings", JSON.stringify(settings));

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("settingsChanged", {
        detail: settings,
      })
    );

    if (!enabled && isMusicPlaying) {
      pauseMusic();
    } else if (enabled && !isMusicPlaying) {
      playMusic();
    }
  };

  const setVolume = (volume) => {
    backgroundMusic.setVolume(volume);
  };

  const value = {
    playMusic,
    pauseMusic,
    toggleMusic,
    isMusicPlaying,
    isMusicEnabled,
    setMusicEnabled: setMusicEnabledFunc,
    setVolume,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
