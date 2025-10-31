import './App.css';
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoute from "./components/utils/PrivateRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Error from "./components/Error";
import AuthProvider from "./context/AuthContext";

// Payment Components
import RechargeRequests from "./components/Payments/RechargeRequests";
import WithdrawalRequests from "./components/Payments/WithdrawalRequests";
import AllTransactions from "./components/Payments/AllTransactions";

// User Components
import User from "./components/User/User";
import ShowUser from "./components/User/ShowUser";

// Settings Components
import AviatorSetting from "./components/setting/aviator/AviatorSetting";
import PromocodeSetting from './components/setting/promocode/PromocodeSetting';
import CrashPercentage from "./components/crashPercent/CrashPercentage";
import AddCrashPercentage from "./components/crashPercent/AddCrashPercentage";
import EditCrashPercentage from "./components/crashPercent/EditCrashPercentage";

function App() {
    const [sideBar, setSideBar] = useState(true);
    const toggleSideBar = () => {
        setSideBar(!sideBar);
    };

    const LayoutWrapper = ({ children }) => (
        <PrivateRoute>
            <div className="flex h-screen">
                <Sidebar sidebar={sideBar} toggleSideBar={toggleSideBar} />
                <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
                    <Navbar toggleSideBar={toggleSideBar} />
                    {children}
                </div>
            </div>
        </PrivateRoute>
    );

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Login />,
        },
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/dashboard",
            element: <LayoutWrapper><Home /></LayoutWrapper>,
        },
        // Payment Routes
        {
            path: "/payments/recharge",
            element: <LayoutWrapper><RechargeRequests /></LayoutWrapper>,
        },
        {
            path: "/payments/withdraw",
            element: <LayoutWrapper><WithdrawalRequests /></LayoutWrapper>,
        },
        {
            path: "/payments/all",
            element: <LayoutWrapper><AllTransactions /></LayoutWrapper>,
        },
        // User Routes
        {
            path: "/users",
            element: <LayoutWrapper><User /></LayoutWrapper>,
        },
        {
            path: "/users/:id",
            element: <LayoutWrapper><ShowUser /></LayoutWrapper>,
        },
        // Game Control (using existing aviator setting)
        {
            path: "/gamecontrol",
            element: <LayoutWrapper><AviatorSetting /></LayoutWrapper>,
        },
        // Broadcast (placeholder - can be implemented later)
        {
            path: "/broadcast",
            element: <LayoutWrapper>
                <div className="p-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">📢 Broadcast</h2>
                    <p className="text-gray-600">Broadcast feature coming soon...</p>
                </div>
            </LayoutWrapper>,
        },
        // Settings Routes
        {
            path: "/settings/game",
            element: <LayoutWrapper><AviatorSetting /></LayoutWrapper>,
        },
        {
            path: "/settings/promo",
            element: <LayoutWrapper><PromocodeSetting /></LayoutWrapper>,
        },
        {
            path: "/settings/crash",
            element: <LayoutWrapper><CrashPercentage /></LayoutWrapper>,
        },
        {
            path: "/addcrashpercentage",
            element: <LayoutWrapper><AddCrashPercentage /></LayoutWrapper>,
        },
        {
            path: "/editcrashpercentage/:id",
            element: <LayoutWrapper><EditCrashPercentage /></LayoutWrapper>,
        },
        {
            path: "*",
            element: <Error />,
        },
    ]);

    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
