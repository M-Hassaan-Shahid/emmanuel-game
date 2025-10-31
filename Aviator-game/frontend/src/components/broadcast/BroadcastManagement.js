import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BroadcastManagement = () => {
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        message: '',
        type: 'info',
        expiresAt: '',
    });

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        const token = localStorage.getItem('token');
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            const response = await axios.get(`${backendUrl}/api/broadcasts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBroadcasts(response.data.broadcasts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching broadcasts:', error);
            console.error('Token:', token ? 'Present' : 'Missing');
            toast.error('Failed to fetch broadcasts');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            await axios.post(
                `${backendUrl}/api/broadcasts`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Broadcast created successfully!');
            setShowForm(false);
            setFormData({ message: '', type: 'info', expiresAt: '' });
            fetchBroadcasts();
        } catch (error) {
            console.error('Error creating broadcast:', error);
            toast.error('Failed to create broadcast');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this broadcast?')) return;

        try {
            const token = localStorage.getItem('token');
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            await axios.delete(`${backendUrl}/api/broadcasts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Broadcast deleted successfully!');
            fetchBroadcasts();
        } catch (error) {
            console.error('Error deleting broadcast:', error);
            toast.error('Failed to delete broadcast');
        }
    };

    const toggleActive = async (id, isActive) => {
        try {
            const token = localStorage.getItem('token');
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            await axios.put(
                `${backendUrl}/api/broadcasts/${id}`,
                { isActive: !isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Broadcast updated successfully!');
            fetchBroadcasts();
        } catch (error) {
            console.error('Error updating broadcast:', error);
            toast.error('Failed to update broadcast');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'error': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading broadcasts...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📢 Broadcast Management</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : '+ New Broadcast'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-semibold mb-4">Create New Broadcast</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                required
                                placeholder="Enter broadcast message..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="info">Info (📢)</option>
                                <option value="success">Success (✅)</option>
                                <option value="warning">Warning (⚠️)</option>
                                <option value="error">Error (❌)</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Expires At (Optional)</label>
                            <input
                                type="datetime-local"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Create Broadcast
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {broadcasts.map((broadcast) => (
                            <tr key={broadcast._id}>
                                <td className="px-6 py-4 text-sm">{broadcast.message}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(broadcast.type)}`}>
                                        {broadcast.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleActive(broadcast._id, broadcast.isActive)}
                                        className={`px-3 py-1 rounded-full text-xs ${broadcast.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {broadcast.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {broadcast.expiresAt
                                        ? new Date(broadcast.expiresAt).toLocaleString()
                                        : 'Never'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(broadcast._id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {broadcasts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No broadcasts yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};

export default BroadcastManagement;
