import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { useAuth } from "../../services/AuthContext";
import { createWithdrawal } from "../../services/api";

export default function Withdraw({ onClose }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getUserBalance = () => {
    return user?.balance || 0;
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    const userBalance = getUserBalance();

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > userBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (withdrawAmount < 100) {
      toast.error("Minimum withdrawal amount is ⭐ 100 Stars");
      return;
    }

    setLoading(true);

    try {
      const data = await createWithdrawal({ amount: withdrawAmount });

      if (data.success) {
        toast.success("Withdrawal request submitted! Pending admin approval.");
        setAmount("");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit withdrawal request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <div className="bg-[rgba(0,0,0,0.9)] w-full max-w-md rounded-2xl overflow-hidden">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex justify-center items-center">
          <h2 className="text-xl text-green-500 font-bold">
            Withdraw Telegram Stars
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer absolute right-3"
            onClick={onClose}
          />
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Available Balance</p>
            <p className="text-white text-2xl font-bold">
              ⭐ {getUserBalance()} Stars
            </p>
          </div>

          <div className="mb-4">
            <label className="text-white text-sm mb-2 block">
              Withdrawal Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min ⭐ 100)"
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="mb-4 bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-400 text-xs">
              ⚠️ Withdrawal requests are processed by admin within 24 hours
            </p>
            <p className="text-gray-400 text-xs mt-1">
              💫 Minimum withdrawal: ⭐ 100 Stars
            </p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className={`w-full p-3 rounded-lg font-semibold text-white ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } transition-all`}
          >
            {loading ? "Processing..." : "Submit Withdrawal Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
