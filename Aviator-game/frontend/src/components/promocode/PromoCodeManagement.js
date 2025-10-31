import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PromoCodeManagement = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        reward: '',
        referrerReward: '',
        maxUses: '',
        expirationDate: '',
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/promocodes`);
            const response = await res.json();
            if (response.success) {
                setPromoCodes(response.result);
            }
        } catch (error) {
            console.error('Error fetching promo codes:', error);
            toast.error('Failed to fetch promo codes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.reward) {
            toast.error('Code and reward are required');
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/promocodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const response = await res.json();

            if (response.success) {
                toast.success('Promo code created successfully!');
                setShowForm(false);
                setFormData({ code: '', reward: '', referrerReward: '', maxUses: '', expirationDate: '' });
                fetchPromoCodes();
            } else {
                toast.error(response.message || 'Failed to create promo code');
            }
        } catch (error) {
            console.error('Error creating promo code:', error);
            toast.error('Failed to create promo code');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promo code?')) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/promocodes/${id}`, {
                method: 'DELETE',
            });
            const response = await res.json();

            if (response.success) {
                toast.success('Promo code deleted successfully!');
                fetchPromoCodes();
            } else {
                toast.error(response.message || 'Failed to delete promo code');
            }
        } catch (error) {
            console.error('Error deleting promo code:', error);
            toast.error('Failed to delete promo code');
        }
    };

    const toggleActive = async (id, isActive) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/promocodes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            });
            const response = await res.json();

            if (response.success) {
                toast.success('Promo code updated successfully!');
                fetchPromoCodes();
            } else {
                toast.error(response.message || 'Failed to update promo code');
            }
        } catch (error) {
            console.error('Error updating promo code:', error);
            toast.error('Failed to update promo code');
        }
    };

    return (
        <div className="p-6">
            <ToastContainer position="top-right" autoClose={2000} theme="light" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">🎁 Promo Code Management</h2>
                    <p className="text-gray-600">Create and manage promotional codes</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : '+ New Promo Code'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-semibold mb-4">Create New Promo Code</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Code *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., WELCOME100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Reward (⭐ Stars) *</label>
                                <input
                                    type="number"
                                    value={formData.reward}
                                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 100"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Referrer Reward (⭐ Stars)</label>
                                <input
                                    type="number"
                                    value={formData.referrerReward}
                                    onChange={(e) => setFormData({ ...formData, referrerReward: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 50"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Max Uses (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.maxUses}
                                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Leave empty for unlimited"
                                    min="1"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Expiration Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expirationDate}
                                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Create Promo Code
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-e-transparent" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {promoCodes.map((code) => (
                                <tr key={code._id}>
                                    <td className="px-6 py-4 font-mono font-bold">{code.code}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${code.type === 'referral' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {code.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">⭐ {code.reward}</td>
                                    <td className="px-6 py-4">
                                        {code.currentUses} / {code.maxUses || '∞'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(code._id, code.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {code.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {code.expirationDate ? new Date(code.expirationDate).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {code.type === 'admin' && (
                                            <button
                                                onClick={() => handleDelete(code._id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {promoCodes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No promo codes yet. Create one to get started!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PromoCodeManagement;
