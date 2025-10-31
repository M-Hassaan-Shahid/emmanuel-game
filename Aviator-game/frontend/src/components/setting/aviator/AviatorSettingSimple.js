import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowRoundBack } from "react-icons/io";

const AviatorSetting = () => {
    const navigate = useNavigate();
    const [loader, setLoader] = useState(true);
    const [data, setData] = useState({
        gameStatus: 1,
        minBetAmount: 0,
        maxBetAmount: 0,
        minRecharge: 0,
    });

    useEffect(() => {
        fetchOldData();
    }, []);

    const fetchOldData = async () => {
        try {
            setLoader(true);
            console.log('🔄 Fetching settings from:', `${process.env.REACT_APP_BACKEND_URL}/api/getAllSetting`);
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllSetting`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const response = await res.json();
            console.log('📥 Fetched settings:', response);

            if (response.success && response.result && response.result.length > 0) {
                const settings = response.result[0];
                setData({
                    gameStatus: settings.gameStatus || 1,
                    minBetAmount: settings.minBetAmount || 0,
                    maxBetAmount: settings.maxBetAmount || 0,
                    minRecharge: settings.minRecharge || 0,
                });
                console.log('✅ Settings loaded successfully');
            } else if (response.success && response.result && response.result.length === 0) {
                console.log('⚠️ No settings found in database, using defaults');
                toast.info("No settings found. Please save initial settings.");
            } else {
                toast.error("Failed to fetch game settings");
            }
        } catch (error) {
            console.error("❌ Error fetching game settings:", error);
            toast.error(`Failed to fetch game settings: ${error.message}`);
        } finally {
            setLoader(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (data.minBetAmount <= 0 || data.maxBetAmount <= 0) {
            toast.error("Bet amounts must be greater than 0");
            return;
        }

        if (data.minBetAmount >= data.maxBetAmount) {
            toast.error("Min bet must be less than max bet");
            return;
        }

        try {
            console.log('📤 Sending settings data:', data);
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/updatesetting`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const response = await res.json();
            console.log('📥 Server response:', response);
            if (response.success) {
                toast.success("Settings updated successfully!");
                setTimeout(() => {
                    navigate(0);
                }, 1500);
            } else {
                toast.error(response.message || "Failed to update settings");
            }
        } catch (err) {
            console.error('❌ Error updating settings:', err);
            toast.error("Failed to update settings");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: name === 'gameStatus' ? parseInt(value) : parseFloat(value) || 0 });
    };

    return (
        <div className="p-6">
            <ToastContainer position="top-right" autoClose={2000} theme="light" />

            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">🎮 Game Control</h2>
                <p className="text-gray-600">Configure game settings and limits</p>
            </div>

            {loader ? (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-e-transparent" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
                    <form onSubmit={handleSubmit}>
                        {/* Game Status */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Game Status
                            </label>
                            <select
                                name="gameStatus"
                                value={data.gameStatus}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="0">🔴 Inactive</option>
                                <option value="1">🟢 Active</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Enable or disable the game</p>
                        </div>

                        {/* Min Bet Amount */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Bet Amount (⭐ Stars)
                            </label>
                            <input
                                type="number"
                                name="minBetAmount"
                                value={data.minBetAmount}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 10"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum amount users can bet per round</p>
                        </div>

                        {/* Max Bet Amount */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Bet Amount (⭐ Stars)
                            </label>
                            <input
                                type="number"
                                name="maxBetAmount"
                                value={data.maxBetAmount}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 1000"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum amount users can bet per round</p>
                        </div>

                        {/* Min Recharge */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Recharge (⭐ Stars)
                            </label>
                            <input
                                type="number"
                                name="minRecharge"
                                value={data.minRecharge}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 50"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum amount for recharge transactions</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AviatorSetting;
