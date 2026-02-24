import {
  Home,
  History,
  Settings,
  ChevronRight,
  LogOut,
  Settings2,
} from "lucide-react";

import imageLogo from "@/assets/logo.png";
import { useAuthStore } from "@/stores/userStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import { useUserDataStore } from "@/stores/userDataStore";

export const Sidebar = ({ setMenu, activeMenu }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const { userData } = useUserDataStore();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`);
      localStorage.removeItem("accessToken");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("An error occurred during logout.");
    } finally {
      logout(); // Call the store action
      navigate("/login"); // Navigate
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div className="inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" />

      {/* Sidebar */}
      <aside className=" left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:translate-x-0 -translate-x-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* logo /> */}
            <img
              src={imageLogo}
              alt="XHome Logo"
              className="w-10 h-10 object-cover rounded-xl"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">XHome</h1>
              <p className="text-xs text-gray-500">Power Protection</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1">
          <button
            onClick={() => {
              setMenu("dashboard");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeMenu == "dashboard" ? " bg-blue-50 text-blue-600 font-semibold" : "text-gray-600"} hover:bg-gray-50 transition-colors text-sm`}
          >
            <Home size={20} />
            Dashboard
          </button>
          <button
            onClick={() => {
              setMenu("history");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeMenu == "history" ? " bg-blue-50 text-blue-600 font-semibold" : "text-gray-600"} hover:bg-gray-50 transition-colors text-sm`}
          >
            <History size={20} />
            History
          </button>
          <button
            onClick={() => {
              setMenu("threshold");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeMenu == "threshold" ? " bg-blue-50 text-blue-600 font-semibold" : "text-gray-600"} hover:bg-gray-50 transition-colors text-sm`}
          >
            <Settings2 size={20} />
            Threshold
          </button>
        </nav>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <div className="space-y-1 mb-4">
            <button
              onClick={() => {
                setMenu("settings");
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl  hover:bg-gray-50 text-sm ${activeMenu == "settings" ? " bg-blue-50 text-blue-600 font-semibold" : "text-gray-600"}`}
            >
              <Settings size={18} />
              Settings
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-medium mt-2 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button className="w-full p-3 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {"U".toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {userData ? userData.username : "Guest"}
                </p>
                <p className="text-xs text-gray-500">
                  {userData ? userData.email : "please login to see email"}
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
