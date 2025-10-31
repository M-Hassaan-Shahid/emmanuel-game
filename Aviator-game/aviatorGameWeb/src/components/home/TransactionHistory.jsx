import React, { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export default function TransactionHistory({ onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, recharge, withdraw

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const params = filter !== "all" ? `?transactionType=${filter}` : "";

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payment/history${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "✅";
      case "pending":
        return "⏳";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <div className="bg-[rgba(0,0,0,0.9)] w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex justify-center items-center">
          <h2 className="text-xl text-blue-500 font-bold">
            Transaction History
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer absolute right-3"
            onClick={onClose}
          />
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No transactions found
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn._id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold">
                        {txn.transactionType === "recharge" ? "💳" : "💸"}{" "}
                        {txn.transactionType.toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(txn.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">
                        ⭐ {txn.amount} Stars
                      </p>
                      <p className={`text-sm ${getStatusColor(txn.status)}`}>
                        {getStatusIcon(txn.status)} {txn.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    ID: {txn._id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
