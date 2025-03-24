import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useStateContext } from "../context";
import { CustomButton } from "./";
import { logo, menu, search, user } from "../assets";
import { navlinks } from "../constants";

const Navbar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState("dashboard");
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  const context = useStateContext();
  const address = context?.address;
  const connect = context?.connect;
  const getCampaigns = context?.getCampaigns;

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (getCampaigns) {
        try {
          const allCampaigns = await getCampaigns();
          setSearchResults([]);
        } catch (error) {
          console.error("Failed to fetch campaigns:", error);
        }
      }
    };

    fetchCampaigns();
  }, [getCampaigns]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const allCampaigns = await getCampaigns();
      const filteredCampaigns = allCampaigns.filter((campaign) => {
        const titleMatch = campaign.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const descriptionMatch = campaign.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return titleMatch || descriptionMatch;
      });

      setSearchResults(filteredCampaigns);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleResultClick = (id) => {
    setShowResults(false);
    navigate(`/campaign-details/${id}`);
  };

  const handleProfileClick = () => {
    if (address) {
      navigate("/profile");
    } else {
      setShowWalletPopup(true);
    }
  };

  const handleConnect = async () => {
    if (connect) {
      try {
        await connect();
        setShowWalletPopup(false);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  return (
    <div className="flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6">
      <div className="lg:flex-1 flex flex-col relative">
        <div className="flex flex-row max-w-full py-2 pl-4 pr-2 h-[52px] bg-[#1c1c24] rounded-[100px]">
          <input
            type="text"
            placeholder="Search for campaigns"
            className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />

          <div
            className="w-[72px] h-full rounded-[20px] bg-[#4acd8d] flex justify-center items-center cursor-pointer"
            onClick={handleSearch}
          >
            <img
              src={search}
              alt="search"
              className="w-[15px] h-[15px] object-contain"
            />
          </div>
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-[60px] left-0 right-0 max-h-[300px] overflow-y-auto bg-[#1c1c24] z-20 rounded-[20px] shadow-lg">
            {searchResults.map((campaign) => (
              <div
                key={campaign.pId}
                className="p-4 border-b border-[#3a3a43] hover:bg-[#3a3a43] cursor-pointer transition-all"
                onClick={() => handleResultClick(campaign.pId)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-[40px] h-[40px] rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-epilogue font-semibold text-[14px] text-white">
                      {campaign.title}
                    </h4>
                    <p className="font-epilogue font-normal text-[12px] text-[#808191] truncate">
                      {campaign.description.length > 60
                        ? campaign.description.substring(0, 60) + "..."
                        : campaign.description}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                    Target: {campaign.target} ETH
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && searchTerm && (
          <div className="absolute top-[60px] left-0 right-0 bg-[#1c1c24] z-20 rounded-[20px] shadow-lg p-4">
            <p className="font-epilogue font-normal text-[14px] text-center text-[#808191]">
              No campaigns found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      <div className="sm:flex hidden flex-row justify-end gap-4">
        <CustomButton
          btnType="button"
          title={address ? "Create a campaign" : "Connect"}
          styles={address ? "bg-[#1dc071]" : "bg-[#8c6dfd]"}
          handleClick={() => {
            if (address) navigate("create-campaign");
            else if (connect) connect();
          }}
        />

        <div
          className="w-[52px] h-[52px] rounded-full bg-[#2c2f32] flex justify-center items-center cursor-pointer"
          onClick={handleProfileClick}
        >
          <img
            src={user}
            alt="user"
            className="w-[60%] h-[60%] object-contain"
          />
        </div>
      </div>

      <div className="sm:hidden flex justify-between items-center relative">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#2c2f32] flex justify-center items-center cursor-pointer">
          <img
            src={logo}
            alt="user"
            className="w-[60%] h-[60%] object-contain"
          />
        </div>

        <img
          src={menu}
          alt="menu"
          className="w-[34px] h-[34px] object-contain cursor-pointer"
          onClick={() => setToggleDrawer((prev) => !prev)}
        />

        <div
          className={`absolute top-[60px] right-0 left-0 bg-[#1c1c24] z-10 shadow-secondary py-4 ${
            !toggleDrawer ? "-translate-y-[100vh]" : "translate-y-0"
          } transition-all duration-700`}
        >
          <ul className="mb-4">
            {navlinks.map((link) => (
              <li
                key={link.name}
                className={`flex p-4 ${
                  isActive === link.name && "bg-[#3a3a43]"
                }`}
                onClick={() => {
                  setIsActive(link.name);
                  setToggleDrawer(false);
                  navigate(link.link);
                }}
              >
                <img
                  src={link.imgUrl}
                  alt={link.name}
                  className={`w-[24px] h-[24px] object-contain ${
                    isActive === link.name ? "grayscale-0" : "grayscale"
                  }`}
                />
                <p
                  className={`ml-[20px] font-epilogue font-semibold text-[14px] ${
                    isActive === link.name ? "text-[#1dc071]" : "text-[#808191]"
                  }`}
                >
                  {link.name}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex mx-4">
            <CustomButton
              btnType="button"
              title={address ? "Create a campaign" : "Connect"}
              styles={address ? "bg-[#1dc071]" : "bg-[#8c6dfd]"}
              handleClick={() => {
                if (address) navigate("create-campaign");
                else if (connect) connect();
              }}
            />
          </div>
        </div>
      </div>

      {showWalletPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1c1c24] rounded-[20px] p-6 w-[90%] max-w-[400px] shadow-xl">
            <h3 className="font-epilogue font-bold text-[20px] text-white text-center mb-4">
              Connect Wallet
            </h3>
            <p className="font-epilogue font-normal text-[16px] text-[#808191] text-center mb-6">
              Please connect your wallet to access your profile
            </p>

            <div className="flex flex-row gap-4">
              <button
                onClick={() => setShowWalletPopup(false)}
                className="flex-1 px-4 py-2 rounded-[10px] bg-gray-600 text-white hover:bg-gray-700 transition font-epilogue"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (connect) connect();
                  setShowWalletPopup(false);
                }}
                className="flex-1 px-4 py-2 rounded-[10px] bg-[#8c6dfd] text-white hover:bg-[#7c5ffd] transition font-epilogue"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
