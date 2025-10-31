import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import SuccessfulDeposit from "./SuccessfulDeposit";
import { toast } from "react-toastify";
import { useAuth } from "../../services/AuthContext";
import { getUserProfile } from "../../services/api";

export default function Deposite({ onClose }) {
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();

  // Handle Telegram Stars Payment
  const handleTelegramStarsPayment = async () => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);

    // Check if user has Telegram linked
    if (!user?.telegramId) {
      toast.error("Please link your Telegram account first!");
      toast.info("Go to Profile → Link Telegram", { autoClose: 5000 });
      setLoading(false);
      return;
    }

    try {
      // Get bot username from backend
      const botUsername =
        import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "YourAviatorBot";

      // Create deep link to Telegram bot with purchase amount
      const deepLink = `https://t.me/${botUsername}?start=buy_${amount}`;

      toast.info("Opening Telegram...", { autoClose: 2000 });

      // Open Telegram bot in new window
      window.open(deepLink, "_blank");

      toast.success(
        `Redirected to Telegram! Complete payment in the bot to add ${amount} Stars.`,
        { autoClose: 5000 }
      );

      // Poll for payment status
      const currentBalance = user?.balance || 0;
      const checkPayment = setInterval(async () => {
        try {
          const userId = localStorage.getItem("userId");
          const data = await getUserProfile(userId);

          if (data.success && data.result) {
            const newBalance = data.result.balance;

            // Check if balance increased
            if (newBalance > currentBalance) {
              clearInterval(checkPayment);
              setLoading(false);
              setSuccess(true);

              const addedAmount = newBalance - currentBalance;
              toast.success(`Payment successful! ${addedAmount} Stars added.`);

              // Update AuthContext and localStorage
              const updatedUser = {
                ...user,
                balance: newBalance,
              };
              updateUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));

              // Close modal after 2 seconds
              setTimeout(() => {
                setSuccess(false);
                onClose();
              }, 2000);
            }
          }
        } catch (error) {
          console.error("Status check error:", error);
        }
      }, 3000); // Check every 3 seconds

      // Stop checking after 5 minutes
      setTimeout(() => {
        clearInterval(checkPayment);
        setLoading(false);
        toast.info("Payment check stopped. Refresh page if payment completed.");
      }, 300000);
    } catch (error) {
      setLoading(false);
      console.error("Telegram payment error:", error);
      toast.error(error.message || "Failed to initiate Telegram payment");
    }
  };

  // Handle Submit
  const handleSubmit = () => {
    handleTelegramStarsPayment();
  };

  // Close success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-[rgba(0,0,0,0.6)] my-auto w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex flex-col justify-center">
          <h2 className="text-xl text-red-600 font-bold mx-auto mb-4">
            ⭐ Add Telegram Stars
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer absolute top-3 right-2"
            onClick={onClose}
          />
        </div>

        <div className="text-gray-200 p-4 overflow-y-auto">
          {/* Amount Input */}
          <div className="w-3/4 mx-auto mb-4">
            <p className="text-white font-medium mb-2">Enter Amount (Stars)</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in Stars"
              className="w-full bg-transparent text-white p-3 outline-none border-2 border-red-600 rounded-md"
              min="1"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="w-3/4 mx-auto mb-4">
            <p className="text-white font-medium mb-2 text-center">
              Quick Select
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white p-2 rounded-md transition"
                >
                  ⭐ {quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Telegram Stars Payment Section */}
          <div className="w-3/4 mx-auto">
            <div className="bg-[rgba(255,255,255,0.1)] p-4 rounded-lg mb-4">
              <h4 className="text-white font-semibold mb-3 text-center">
                ⭐ Telegram Stars Payment
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                ✓ Pay using Telegram Stars
              </p>
              <p className="text-sm text-gray-300 mb-2">
                ✓ Instant confirmation
              </p>
              <p className="text-sm text-gray-300 mb-2">
                ✓ Secure payment via Telegram
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Note: You will be redirected to Telegram bot to complete the
                payment
              </p>
            </div>

            <button
              className={`w-full bg-blue-600 my-3 p-3 rounded-md font-semibold hover:bg-blue-500 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Waiting for payment..."
                : "⭐ Pay with Telegram Stars"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="absolute text-white p-4 bg-[rgba(0,0,0,0.9)] rounded-md">
          <SuccessfulDeposit />
        </div>
      )}
    </div>
  );
}
