import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { getUserPaymentHistory } from "../../services/api";
import "./../../assets/styles/trxScreen.css";

export default function TxnHistoryModal({ onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("💳 Fetching transaction history...");

      const data = await getUserPaymentHistory();
      console.log("💳 getUserPaymentHistory response:", data);

      if (data.success) {
        const txns = data.transactions || data.payments || [];
        console.log("💳 Loaded transactions:", txns.length);
        setTransactions(txns);
      } else {
        console.log("❌ Transaction fetch failed:", data.message);
        setTransactions([]);
      }
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortedTransactions = () => {
    // Sort by most recent first
    return [...transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "rejected":
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-[rgba(0,0,0,0.6)] my-auto w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[rgba(0,0,0,0.7)] relative p-4 flex flex-col justify-center">
          <h2 className="text-xl text-red-600 font-bold mx-auto">
            Transaction History
          </h2>
          <RxCross2
            className="text-white text-3xl cursor-pointer absolute top-3 right-2"
            onClick={onClose}
          />
        </div>
        <div className="overflow-y-auto">
          <div className="relative overflow-x-auto p-4">
            <div className="max-h-[50vh] overflow-y-auto hide-scrollbar">
              {loading ? (
                <div className="text-white text-center py-8">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-white text-center py-8">
                  No transactions found
                </div>
              ) : (
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-white bg-transparent dark:bg-gray-700 dark:text-gray-400 pb-4">
                    <tr className="mb-4">
                      <th
                        scope="col"
                        className="rounded-full text-center bg-blue-600 mx-3 my-4"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="rounded-full text-center bg-blue-600 mx-3 my-4"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="rounded-full text-center bg-blue-600 mx-3 my-4"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="rounded-full text-center bg-blue-600 mx-3 my-4"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="h-4"></td>
                    </tr>
                    {getSortedTransactions().map((txn, index) => (
                      <tr
                        key={index}
                        className="bg-transparent dark:bg-gray-800 dark:border-gray-700 border-2 border-red-600"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap dark:text-white"
                        >
                          {formatDate(txn.createdAt)}
                        </th>
                        <td className="px-6 py-4 text-gray-200 font-medium text-lg text-center capitalize">
                          {txn.transactionType || txn.type || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-200 font-medium text-lg text-center">
                          ⭐ {txn.amount}
                        </td>
                        <td
                          className={`px-6 py-4 font-medium text-lg text-center capitalize ${getStatusColor(
                            txn.status
                          )}`}
                        >
                          {txn.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p className="text-lg text-white my-3">
              Total Transactions: {transactions.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
