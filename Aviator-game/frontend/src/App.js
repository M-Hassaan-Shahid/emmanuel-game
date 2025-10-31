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

// Transaction Component
import AllTransactions from "./components/Payments/AllTransactions";

// User Components
import User from "./components/User/User";
import ShowUser from "./components/User/ShowUser";

// Settings Components
import AviatorSetting from "./components/setting/aviator/AviatorSettingSimple";
import BroadcastManagement from './components/broadcast/BroadcastManagement';

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
    // Transactions (automated via Telegram Stars)
    {
      path: "/transactions",
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
    // Game Control
    {
      path: "/gamecontrol",
      element: <LayoutWrapper><AviatorSetting /></LayoutWrapper>,
    },
    // Broadcast
    {
      path: "/broadcast",
      element: <LayoutWrapper><BroadcastManagement /></LayoutWrapper>,
    },
    // Settings Routes
    {
      path: "/settings/game",
      element: <LayoutWrapper><AviatorSetting /></LayoutWrapper>,
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
