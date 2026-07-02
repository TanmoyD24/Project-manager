import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PM</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">ProjectManager</span>
            </NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Projects
            </NavLink>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;