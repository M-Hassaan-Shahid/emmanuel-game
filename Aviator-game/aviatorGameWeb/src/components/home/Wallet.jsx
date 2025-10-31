import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import Gold from "./../../assets/images/wallet/gold.png";
import { FaPiggyBank } from "react-icons/fa6";
import { useAuth } from "../../services/AuthContext";
import { getUserProfile } from "../../services/api";

export default function Wallet({ onClose, hideFooter, setActiveModal }) {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBalance(user?.balance || 0);
  }, [user]);

  // Auto-refresh balance when wallet opens
  useEffect(() => {
    refreshBalance();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshBalance = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const data = await getUserProfile(userId);
      if (data.success && data.result) {
        setBalance(data.result.balance || 0);
        updateUser({ ...user, balance: data.result.balance });
      }
    } catch (error) {
      console.error("Error refreshing balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (modalType) => {
    setActiveModal(modalType);
    hideFooter(true); // Hide footer when modal opens
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-[rgba(0,0,0,0.6)] my-auto w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex flex-col justify-center">
          <h2 className="text-xl text-red-600 font-bold mx-auto mb-4">
            ⭐ Telegram Stars Wallet
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer absolute top-3 right-2"
            onClick={onClose}
          />
        </div>
        <div className="overflow-y-auto">
          <div className="relative overflow-x-auto p-4">
            <div
              className="w-full flex justify-between p-6"
              style={{
                background:
                  "radial-gradient(circle, rgba(248,94,94,0.53) 50%, rgba(0,0,0,0.6) 100%)",
              }}
            >
              <div className="w-1/2 flex flex-col justify-center items-center">
                <p className="text-lg font-medium text-white">
                  Available Balance
                </p>
                <h2 className="text-2xl font-bold text-white">
                  ⭐ {balance} Stars
                </h2>
                <button
                  onClick={refreshBalance}
                  disabled={loading}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                >
                  {loading ? "Refreshing..." : "🔄 Refresh"}
                </button>
              </div>
              <img src={Gold} alt="coin" className="w-20" />
            </div>
            <div className="flex gap-3 mx-auto justify-center my-4 px-4">
              <button
                className="bg-blue-500 text-blue-100 flex items-center gap-2 font-medium p-3 justify-center text-sm sm:text-base flex-1 hover:bg-blue-600 transition-all rounded-lg"
                onClick={() => openModal("addmoney")}
              >
                Add Stars <FaPiggyBank />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
