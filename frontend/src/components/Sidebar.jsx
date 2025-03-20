import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo, sun } from "../assets";
import { navlinks } from "../constants";
import { useStateContext } from "../context"; // Import the context to access wallet functions

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] ${
      isActive && isActive === name && "bg-[#2c2f32]"
    } flex justify-center items-center ${
      !disabled && "cursor-pointer"
    } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
      <img src={imgUrl} alt="fund_logo" className="w-1/2 h-1/2" />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`w-1/2 h-1/2 ${isActive !== name && "grayscale"}`}
      />
    )}
  </div>
);

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, isConnected }) => {
  const { connect } = useStateContext(); // Get the connect function from context

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#1c1c24] p-6 rounded-[20px] shadow-xl w-[300px]">
        <h3 className="text-white text-lg font-bold mb-4">
          {isConnected ? "Confirm Logout" : "Wallet Connection Required"}
        </h3>
        <p className="text-gray-300 mb-6">
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

  // Get the context values similar to how Navbar does it
  const context = useStateContext();
  const address = context?.address;
  const disconnect = context?.disconnect;

  // Check if wallet is connected based on address existence
  const isWalletConnected = !!address;

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    // Only disconnect if wallet is connected and disconnect function exists
    if (isWalletConnected && disconnect) {
      disconnect();
    }

    // Close dialog
    setIsLogoutDialogOpen(false);

    // Navigate to home
    navigate("/");

    // Reset active state
    setIsActive("dashboard");
  };

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
      <Link to="/">
        <Icon styles="w-[52px] h-[52px] bg-[#2c2f32]" imgUrl={logo} />
      </Link>

      <div className="flex-1 flex flex-col justify-between items-center bg-[#1c1c24] rounded-[20px] w-[76px] py-4 mt-12">
        <div className="flex flex-col justify-center items-center gap-10">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => {
                if (link.name === "logout") {
                  // Handle logout specially, regardless of disabled status
                  handleLogoutClick();
                } else if (!link.disabled) {
                  setIsActive(link.name);
                  navigate(link.link);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        isConnected={isWalletConnected}
      />
    </div>
  );
};

export default Sidebar;
