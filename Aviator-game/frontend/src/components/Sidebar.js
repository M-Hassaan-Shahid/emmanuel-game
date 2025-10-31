import { NavLink } from "react-router-dom";
import { MdDashboard, MdPeople, MdSettings } from "react-icons/md";
import { FaMoneyBillWave, FaGamepad, FaBullhorn } from "react-icons/fa";

const Sidebar = ({ sidebar, toggleSideBar }) => {
  return (
    <div
      className={`h-full bg-gradient-to-b from-[#1e88e5] to-[#1565c0] flex-col w-[240px] overflow-y-auto overflow-x-hidden ${sidebar ? "hidden" : "flex"
        } md:block shadow-xl`}
    >
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-bold text-white">🎮 Admin Panel</h1>
          <p className="text-blue-100 text-xs mt-1">Aviator Game Control</p>
        </div>

        {/* Navigation - All items in flat list */}
        <nav className="px-3 space-y-1">
          {/* Statistics */}
          <NavLink
            to="/dashboard"
            onClick={toggleSideBar}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${isActive
                ? "bg-white text-blue-600 shadow-md"
                : "text-white hover:bg-white/10"
              }`
            }
          >
            <MdDashboard className="text-lg" />
            <span className="font-medium">Statistics</span>
          </NavLink>

          {/* All Users */}
          <NavLink
            to="/users"
            onClick={toggleSideBar}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${isActive
                ? "bg-white text-blue-600 shadow-md"
                : "text-white hover:bg-white/10"
              }`
            }
          >
            <MdPeople className="text-lg" />
            <span className="font-medium">All Users</span>
          </NavLink>

          {/* Transactions */}
          <NavLink
            to="/transactions"
            onClick={toggleSideBar}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${isActive
                ? "bg-white text-blue-600 shadow-md"
                : "text-white hover:bg-white/10"
              }`
            }
          >
            <FaMoneyBillWave className="text-lg" />
            <span className="font-medium">Transactions</span>
          </NavLink>

          {/* Broadcast */}
          <NavLink
            to="/broadcast"
            onClick={toggleSideBar}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${isActive
                ? "bg-white text-blue-600 shadow-md"
                : "text-white hover:bg-white/10"
              }`
            }
          >
            <FaBullhorn className="text-lg" />
            <span className="font-medium">Broadcast</span>
          </NavLink>

          {/* Game Settings */}
          <NavLink
            to="/settings/game"
            onClick={toggleSideBar}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${isActive
                ? "bg-white text-blue-600 shadow-md"
                : "text-white hover:bg-white/10"
              }`
            }
          >
            <FaGamepad className="text-lg" />
            <span className="font-medium">Game Settings</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
