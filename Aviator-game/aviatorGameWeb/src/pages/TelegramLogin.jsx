import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function TelegramLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const botUsername = searchParams.get("bot");

  useEffect(() => {
    if (!botUsername) {
      navigate("/login");
      return;
    }
  }, [botUsername, navigate]);

  const handleTelegramLogin = () => {
    if (!botUsername) {
      toast.error("Bot username not configured");
      return;
    }

    // Open Telegram bot directly
    const telegramUrl = `https://t.me/${botUsername}?start=login`;
    window.open(telegramUrl, "_blank");

    toast.info(
      "Please register on the website first, then link your Telegram account via Profile",
      {
        autoClose: 8000,
      }
    );
  };

  return (
    <div className="login-screen bg-[url('./assets/images/login/bg.png')] bg-cover h-screen w-full bg-no-repeat flex items-center justify-center p-4">
      <div className="login-container bg-[rgba(0,0,0,0.8)] rounded-2xl p-8 max-w-md w-full border border-gray-700">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-white mb-2">Aviator Game</h1>
          <p className="text-gray-400">Login with Telegram to continue</p>
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-5xl mb-4">📱</div>
            <p className="text-white font-semibold mb-2">
              Login via Telegram Bot
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Click the button below to open Telegram and complete your login
            </p>
          </div>

          <button
            onClick={handleTelegramLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
            Open Telegram Bot
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:text-blue-300 transition text-sm"
          >
            ← Back to Login
          </button>
        </div>

        <div className="mt-6 bg-[rgba(255,255,255,0.05)] rounded-lg p-4">
          <p className="text-white font-semibold text-sm mb-2">⚠️ Important:</p>
          <ol className="text-gray-400 text-xs space-y-1">
            <li>1. Register on the website first (email/password)</li>
            <li>2. Login to your account</li>
            <li>3. Go to Profile → Link Telegram</li>
            <li>4. Use the 6-digit code to link your account</li>
            <li>5. Then you can buy Stars via Telegram</li>
          </ol>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>By logging in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}
