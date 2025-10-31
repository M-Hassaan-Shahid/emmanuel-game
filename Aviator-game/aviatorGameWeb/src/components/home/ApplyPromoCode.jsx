import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../services/AuthContext";
import { applyPromoCode } from "../../services/api";
import { syncUserFromBackend } from "../../services/userService";

const ApplyPromoCode = ({ onSuccess }) => {
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();

  const handleApply = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    if (!user?._id) {
      toast.error("Please login to apply promo code");
      return;
    }

    setLoading(true);
    try {
      const response = await applyPromoCode(promoCode.toUpperCase(), user._id);

      if (response.success) {
        toast.success(response.message || "Promo code applied successfully!");
        setPromoCode("");

        // Sync user data from backend
        const updatedUser = await syncUserFromBackend();
        if (updatedUser) {
          updateUser(updatedUser);
        }

        if (onSuccess) {
          onSuccess(response.reward, response.newBalance);
        }
      } else {
        toast.error(response.message || "Failed to apply promo code");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast.error(
        error.response?.data?.message || "Failed to apply promo code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎁</span>
        <h3 className="text-white font-bold text-lg">Have a Promo Code?</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Enter code here"
          className="flex-1 px-4 py-2 rounded-lg border-2 border-white bg-white/90 text-gray-800 font-mono font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          disabled={loading}
        />
        <button
          onClick={handleApply}
          disabled={loading}
          className="bg-white text-orange-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>

      <p className="text-white text-xs mt-2 opacity-90">
        💡 Enter a promo code to get bonus stars!
      </p>
    </div>
  );
};

export default ApplyPromoCode;
