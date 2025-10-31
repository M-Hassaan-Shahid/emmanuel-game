import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../services/AuthContext";
import { FaCopy, FaShareAlt } from "react-icons/fa";

const ReferralCode = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.promocode) {
      navigator.clipboard.writeText(user.promocode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const shareText = `Join this awesome Aviator game using my referral code: ${user?.promocode} and get bonus stars! 🎮⭐`;

    if (navigator.share) {
      navigator
        .share({
          title: "Join Aviator Game",
          text: shareText,
        })
        .catch((err) => console.log("Error sharing:", err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  if (!user?.promocode) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎯</span>
        <h3 className="text-white font-bold text-lg">Your Referral Code</h3>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-mono font-bold text-xl">
            {user.promocode}
          </span>
          <button
            onClick={handleCopy}
            className="bg-white text-purple-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaCopy className={copied ? "text-green-600" : ""} />
          </button>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full bg-white text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <FaShareAlt />
        Share & Earn
      </button>

      <p className="text-white text-xs mt-2 opacity-90 text-center">
        💰 You and your friend both get 50 stars when they use your code!
      </p>
    </div>
  );
};

export default ReferralCode;
