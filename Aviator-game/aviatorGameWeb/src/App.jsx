import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import Register from "./pages/Register";
import ResetPassword from "./pages/resetPassword";
import ResetOtpScreen from "./pages/ResetOtpScreen";
import GameScreen from "./pages/GameScreen";
import Aviator from "./pages/Aviator";
import OAuthCallback from "./pages/OAuthCallback";
import TelegramLogin from "./pages/TelegramLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./services/AuthContext";
import { AudioProvider, useAudio } from "./contexts/AudioContext";
import ProtectedRoute from "../ProtectedRoute ";

function AppContent() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { playMusic } = useAudio();

  useEffect(() => {
    // Play music on first user interaction
    const handleUserInteraction = () => {
      playMusic();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [playMusic]);

  const handleWelcomeEnd = () => {
    setShowWelcome(false);
  };

  return (
    <Router>
      <ToastContainer />
      {showWelcome ? (
        <Welcome onWelcomeEnd={handleWelcomeEnd} />
      ) : (
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<ResetPassword />} />
          <Route path="/password-reset-otp" element={<ResetOtpScreen />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/telegram-login" element={<TelegramLogin />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GameScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aviator"
            element={
              <ProtectedRoute>
                <Aviator />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
