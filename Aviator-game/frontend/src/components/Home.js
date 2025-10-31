import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";

const Home = () => {
  const [loader, setLoader] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRecharge: 0,
    totalWithdraw: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoader(true);
    try {
      // Get token from cookies
      const token = Cookies.get("jwt");

      // Fetch users (no auth required)
      const usersRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAlluser`);
      const usersData = await usersRes.json();

      // Fetch transactions (requires auth)
      const transRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getpayment`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const transData = await transRes.json();

      const totalUsers = usersData.count || 0;
      const activeUsers = usersData.result?.filter(u => u.status === 1).length || 0;

      const transactions = transData.result || [];
      const totalTransactions = transactions.length;

      const approvedRecharges = transactions.filter(t => t.transactionType === 'recharge' && t.status === 'approved');
      const approvedWithdraws = transactions.filter(t => t.transactionType === 'withdraw' && t.status === 'approved');

      const totalRecharge = approvedRecharges.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalWithdraw = approvedWithdraws.reduce((sum, t) => sum + (t.amount || 0), 0);
      const revenue = totalRecharge - totalWithdraw;

      setStats({
        totalUsers,
        activeUsers,
        totalTransactions,
        totalRecharge,
        totalWithdraw,
        revenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoader(false);
    }
  };

  const StatCard = ({ to, icon, value, label, color = "bg-[#1E88E5]" }) => (
    <NavLink to={to} className="flex-1 min-w-[250px]">
      <div className="bg-white shadow-lg hover:shadow-xl transition-shadow rounded-2xl p-6 m-2">
        <div className="flex items-center">
          <div className={`inline-flex flex-shrink-0 justify-center items-center w-14 h-14 text-white ${color} rounded-lg`}>
            {icon}
          </div>
          <div className="flex-shrink-0 ml-4">
            <span className="text-3xl font-bold leading-none text-gray-900">
              {value}
            </span>
            <h3 className="text-sm font-normal text-gray-500 mt-1">{label}</h3>
          </div>
        </div>
      </div>
    </NavLink>
  );

  const UsersIcon = () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );

  const MoneyIcon = () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="p-6">
      {loader ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-e-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-800">📊 Statistics</h2>
            <p className="text-gray-600 mt-2">Platform overview and key metrics</p>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap -m-2 mb-8">
            <StatCard
              to="/users"
              icon={<UsersIcon />}
              value={stats.totalUsers}
              label="Total Users"
              color="bg-blue-500"
            />
            <StatCard
              to="/users"
              icon={<UsersIcon />}
              value={stats.activeUsers}
              label="Active Users"
              color="bg-green-500"
            />
            <StatCard
              to="/transactions"
              icon={<MoneyIcon />}
              value={stats.totalTransactions}
              label="Total Transactions"
              color="bg-purple-500"
            />
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90">Total Recharge</div>
              <div className="text-3xl font-bold mt-2">⭐ {stats.totalRecharge.toFixed(0)}</div>
              <div className="text-xs opacity-75 mt-1">Telegram Stars</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90">Revenue</div>
              <div className="text-3xl font-bold mt-2">⭐ {stats.revenue.toFixed(0)}</div>
              <div className="text-xs opacity-75 mt-1">Telegram Stars</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💫 Telegram Stars Payment System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">✅</span>
                  <h4 className="font-semibold text-green-800">Automated Recharges</h4>
                </div>
                <p className="text-sm text-green-700">All recharges are processed automatically through Telegram Stars. No manual approval needed.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">✅</span>
                  <h4 className="font-semibold text-blue-800">Automated Withdrawals</h4>
                </div>
                <p className="text-sm text-blue-700">All withdrawals are processed automatically through Telegram Stars. No manual approval needed.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
