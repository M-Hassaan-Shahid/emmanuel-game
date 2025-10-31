import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const AllTransactions = () => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, [page, search]);

    const fetchData = async () => {
        setLoader(true);
        try {
            // Get token from cookies
            const token = Cookies.get("jwt");

            // Fetch transactions with authentication
            const res = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/getpayment?page=${page}&limit=${pageSize}&search=${search}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const result = await res.json();

            if (result.success) {
                // Fetch user details for each transaction
                const dataWithUsers = await Promise.all(
                    result.result.map(async (item) => {
                        try {
                            const userRes = await fetch(
                                `${process.env.REACT_APP_BACKEND_URL}/api/getSingleuser`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: item.user_id }),
                                }
                            );
                            const userData = await userRes.json();

                            if (userData.success && userData.result) {
                                return {
                                    ...item,
                                    username: userData.result.username || "Unknown",
                                    user_display_id: userData.result.user_id || item.user_id,
                                };
                            }
                        } catch (error) {
                            console.error("Error fetching user:", error);
                        }

                        return {
                            ...item,
                            username: "Unknown",
                            user_display_id: item.user_id,
                        };
                    })
                );
                setData(dataWithUsers);
                setCount(result.count);
            } else {
                toast.error(result.message || "Failed to fetch transactions");
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Failed to fetch transactions");
        } finally {
            setLoader(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            approved: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            rejected: "bg-red-100 text-red-800",
        };
        const emojis = {
            approved: "✅",
            pending: "⏳",
            rejected: "❌",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
                {emojis[status]} {status.toUpperCase()}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        return type === "recharge" ? "💳" : "💸";
    };

    const startIndex = (page - 1) * pageSize;

    return (
        <div className="p-6">
            <ToastContainer position="top-right" autoClose={2000} theme="light" />

            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">📜 All Transactions</h2>
                <p className="text-gray-600">Complete transaction history</p>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by amount..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {loader && (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-e-transparent" />
                </div>
            )}

            {!loader && data.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sr.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.map((item, index) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm">{startIndex + index + 1}</td>
                                    <td className="px-6 py-4 text-lg">
                                        {getTypeIcon(item.transactionType)}
                                        <span className="ml-2 text-sm font-medium capitalize">{item.transactionType}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.username}</div>
                                        <div className="text-sm text-gray-500">ID: {item.user_display_id}</div>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold ${item.transactionType === 'recharge' ? 'text-green-600' : 'text-red-600'}`}>
                                        ⭐ {item.amount}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loader && data.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">📭 No transactions found</p>
                </div>
            )}

            {data.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(startIndex + pageSize, count)} of {count} entries
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={startIndex + pageSize >= count}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllTransactions;
