import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../assets";
import { navlinks } from "../constants";
import { useStateContext } from "../context";
import { FiSun, FiMoon } from "react-icons/fi"; // Import sun and moon icons
import { ThemeContext } from "../context/ThemeProvider"; // Import your ThemeContext

const Icon = ({
  styles,
  name,
  imgUrl,
  isActive,
  disabled,
  handleClick,
  darkMode,
}) => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] ${
      isActive &&
      isActive === name &&
      (darkMode ? "bg-[#2c2f32]" : "bg-gray-200")
    } flex justify-center items-center ${
      !disabled && "cursor-pointer"
    } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`w-1/2 h-1/2 ${!darkMode && "filter invert"}`}
      />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`w-1/2 h-1/2 ${isActive !== name && "grayscale"} ${
          !darkMode && "filter invert"
        }`}
      />
    )}
  </div>
);

// Confirmation Dialog Component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isConnected,
  darkMode,
}) => {
  const { connect } = useStateContext();

  if (!isOpen) return null;

  const bgColor = darkMode ? "bg-[#1c1c24]" : "bg-white";
  const textColor = darkMode ? "text-white" : "text-[#1c1c24]";
  const subTextColor = darkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`${bgColor} p-6 rounded-[20px] shadow-xl w-[300px]`}>
        <h3 className={`${textColor} text-lg font-bold mb-4`}>
          {isConnected ? "Confirm Logout" : "Wallet Connection Required"}
        </h3>
        <p className={`${subTextColor} mb-6`}>
          {isConnected
            ? "Are you sure you want to disconnect your wallet?"
            : "Please connect to the MetaMask wallet"}
        </p>
        <div className="flex justify-between gap-4">
          {isConnected ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-[10px] bg-gray-600 text-white hover:bg-gray-700 transition"
              >
                No
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 rounded-[10px] bg-[#8c6dfd] text-white hover:bg-[#7c5ffd] transition"
              >
                Yes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-[10px] bg-gray-600 text-white hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  connect();
                  onClose();
                }}
                className="flex-1 px-4 py-2 rounded-[10px] bg-[#8c6dfd] text-white hover:bg-[#7c5ffd] transition"
              >
                Connect
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState("dashboard");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Use the ThemeContext instead of local state
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  // Get the context values
  const context = useStateContext();
  const address = context?.address;
  const disconnect = context?.disconnect;

  // Check if wallet is connected based on address existence
  const isWalletConnected = !!address;

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    if (isWalletConnected && disconnect) {
      disconnect();
    }
    setIsLogoutDialogOpen(false);
    navigate("/");
    setIsActive("dashboard");
  };

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
      <Link to="/">
        <Icon
          styles={`w-[52px] h-[52px] ${
            darkMode ? "bg-[#2c2f32]" : "bg-gray-200"
          }`}
          imgUrl={logo}
          darkMode={darkMode}
        />
      </Link>

      <div
        className={`flex-1 flex flex-col justify-between items-center ${
          darkMode ? "bg-[#1c1c24]" : "bg-white"
        } rounded-[20px] w-[76px] py-4 mt-12`}
      >
        <div className="flex flex-col justify-center items-center gap-10">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              darkMode={darkMode}
              handleClick={() => {
                if (link.name === "logout") {
                  handleLogoutClick();
                } else if (!link.disabled) {
                  setIsActive(link.name);
                  navigate(link.link);
                }
              }}
            />
          ))}
        </div>

        {/* Theme toggle button */}
        <div
          className={`w-[48px] h-[48px] rounded-[10px] ${
            darkMode ? "bg-[#2c2f32]" : "bg-gray-200"
          } flex justify-center items-center cursor-pointer mt-10`}
          onClick={toggleTheme}
        >
          {darkMode ? (
            <FiSun className="w-1/2 h-1/2 text-white" />
          ) : (
            <FiMoon className="w-1/2 h-1/2 text-[#1c1c24]" />
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        isConnected={isWalletConnected}
        darkMode={darkMode}
      />
    </div>
  );
};

export default Sidebar;
