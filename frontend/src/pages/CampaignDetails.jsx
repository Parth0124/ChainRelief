import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { CountBox, CustomButton, Loader } from "../components";
import { calculateBarPercentage, daysLeft } from "../utils";
import { thirdweb } from "../assets";
import MaterialDonationStatusManager from "../components/MaterialDonationStatusManager";

const CampaignDetails = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    donate,
    getDonations,
    contract,
    address,
    getCampaignMaterialDonations,
    getCampaigns,
  } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [donators, setDonators] = useState([]);
  const [materialDonations, setMaterialDonations] = useState([]);
  const [campaignData, setCampaignData] = useState(state);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showStatusManager, setShowStatusManager] = useState(false);

  useEffect(() => {
    const fetchCampaignIfNeeded = async () => {
      if (!campaignData && contract) {
        setIsLoading(true);
        try {
          const campaigns = await getCampaigns();
          const campaign = campaigns.find((c) => c.pId.toString() === id);

          if (campaign) {
            setCampaignData(campaign);
          } else {
            console.error("Campaign not found with ID:", id);
          }
        } catch (error) {
          console.error("Failed to fetch campaign:", error);
        }
        setIsLoading(false);
      }
    };

    fetchCampaignIfNeeded();
  }, [contract, id, campaignData, getCampaigns]);

  const remainingDays = campaignData ? daysLeft(campaignData.deadline) : 0;

  const fetchDonators = async () => {
    if (!campaignData) return;

    const data = await getDonations(campaignData.pId);
    setDonators(data);
  };

  const fetchMaterialDonations = async () => {
    if (!campaignData || !campaignData.acceptsMaterialDonations) return;

    const data = await getCampaignMaterialDonations(campaignData.pId);
    setMaterialDonations(data);
  };

  useEffect(() => {
    if (contract && campaignData) {
      fetchDonators();
      fetchMaterialDonations();
    }
  }, [contract, address, campaignData]);

  const handleDonate = async () => {
    if (!campaignData) return;

    setIsLoading(true);
    await donate(campaignData.pId, amount);
    navigate("/");
    setIsLoading(false);
  };

  const navigateToMaterialDonation = () => {
    if (!campaignData) return;

    navigate(`/donate-materials/${campaignData.pId}`, {
      state: {
        ...campaignData,
        campaignId: campaignData.pId,
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pledged":
        return "text-yellow-500";
      case "verified":
        return "text-blue-500";
      case "in-transit":
        return "text-purple-500";
      case "delivered":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const formatExpiryDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    return new Date(parseInt(timestamp)).toLocaleDateString();
  };

  const handleManageDonation = (donation) => {
    setSelectedDonation(donation);
    setShowStatusManager(true);
  };

  const handleStatusManagerClose = () => {
    setShowStatusManager(false);
    setSelectedDonation(null);
    fetchMaterialDonations();
  };

  const isOwner = address && campaignData && address === campaignData.owner;
  const isDonor = (donation) =>
    address && donation && address === donation.donor;

  if (isLoading) {
    return <Loader />;
  }

  if (!campaignData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="font-epilogue font-bold text-[30px] text-white text-center">
          Campaign Not Found
        </h2>
        <p className="font-epilogue font-normal text-[16px] text-[#808191] mt-[10px] text-center">
          The campaign you're looking for doesn't exist or has been removed.
        </p>
        <CustomButton
          btnType="button"
          title="Go Back to Home"
          styles="mt-[30px] bg-[#8c6dfd]"
          handleClick={() => navigate("/")}
        />
      </div>
    );
  }

  return (
    <div>
      {isLoading && <Loader />}

      {showStatusManager && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c24] p-6 rounded-[20px] max-w-xl w-full">
            <h3 className="font-epilogue font-bold text-[20px] text-white mb-4">
              Update Donation Status
            </h3>
            <MaterialDonationStatusManager
              donation={selectedDonation}
              onClose={handleStatusManagerClose}
              isOwner={isOwner}
              isDonor={isDonor(selectedDonation)}
            />
          </div>
        </div>
      )}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img
            src={campaignData.image}
            alt="campaign"
            className="w-full h-[410px] object-cover rounded-xl"
          />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div
              className="absolute h-full bg-[#4acd8d]"
              style={{
                width: `${calculateBarPercentage(
                  campaignData.target,
                  campaignData.amountCollected
                )}%`,
                maxWidth: "100%",
              }}
            ></div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox
            title={`Raised of ${campaignData.target}`}
            value={campaignData.amountCollected}
          />
          <CountBox title="Total Backers" value={donators.length} />
          {campaignData.acceptsMaterialDonations && (
            <CountBox
              title="Material Donations"
              value={materialDonations.length}
            />
          )}
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Creator
            </h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img
                  src={thirdweb}
                  alt="user"
                  className="w-[60%] h-[60%] object-contain"
                />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">
                  {campaignData.owner}
                </h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">
                  10 Campaigns
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Story
            </h4>

            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                {campaignData.description}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Campaign Type
            </h4>

            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">
                {campaignData.acceptsMaterialDonations
                  ? "This campaign accepts both monetary and material donations."
                  : "This campaign accepts only monetary donations."}
              </p>
              {campaignData.acceptsMaterialDonations && (
                <div className="mt-4 p-4 bg-[#1c1c24] rounded-[10px]">
                  <h5 className="font-epilogue font-medium text-[16px] text-white mb-2">
                    Material Donation Details
                  </h5>
                  {campaignData.itemTypes &&
                    campaignData.itemTypes.length > 0 && (
                      <div className="mb-2">
                        <p className="font-epilogue text-[14px] text-[#808191]">
                          <span className="text-white">
                            Accepting donations of:{" "}
                          </span>
                          {Array.isArray(campaignData.itemTypes)
                            ? campaignData.itemTypes.join(", ")
                            : campaignData.itemTypes}
                        </p>
                      </div>
                    )}
                  {campaignData.itemType && campaignData.quantity && (
                    <div className="mb-2">
                      <p className="font-epilogue text-[14px] text-[#808191]">
                        <span className="text-white">Currently needed: </span>
                        {campaignData.quantity} {campaignData.unit} of{" "}
                        {campaignData.itemType}
                      </p>
                    </div>
                  )}
                  {campaignData.location && (
                    <div className="mb-2">
                      <p className="font-epilogue text-[14px] text-[#808191]">
                        <span className="text-white">Primary location: </span>
                        {campaignData.location}
                      </p>
                    </div>
                  )}
                  {campaignData.acceptedLocations && (
                    <div className="mb-2">
                      <p className="font-epilogue text-[14px] text-[#808191]">
                        <span className="text-white">
                          Additional locations:{" "}
                        </span>
                        {campaignData.acceptedLocations}
                      </p>
                    </div>
                  )}
                  {campaignData.expiryDate &&
                    campaignData.expiryDate !== "0" && (
                      <div className="mb-2">
                        <p className="font-epilogue text-[14px] text-[#808191]">
                          <span className="text-white">Expiry date: </span>
                          {formatExpiryDate(campaignData.expiryDate)}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Donators
            </h4>

            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? (
                donators.map((item, index) => (
                  <div
                    key={`${item.donator}-${index}`}
                    className="flex justify-between items-center gap-4"
                  >
                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">
                      {index + 1}. {item.donator}
                    </p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">
                      {item.donation}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                  No donators yet. Be the first one!
                </p>
              )}
            </div>
          </div>
          {campaignData.acceptsMaterialDonations && (
            <div>
              <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
                Material Donations
              </h4>

              <div className="mt-[20px] flex flex-col gap-4">
                {materialDonations.length > 0 ? (
                  materialDonations.map((item, index) => (
                    <div
                      key={`${item.donor}-${index}`}
                      className="p-4 bg-[#1c1c24] rounded-[10px]"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-epilogue font-medium text-[16px] text-white leading-[26px]">
                            {item.itemType} ({item.quantity} {item.unit})
                          </p>
                          <p className="font-epilogue text-[14px] text-[#808191]">
                            {item.description}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`font-epilogue font-bold ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status.toUpperCase()}
                          </p>
                          <p className="font-epilogue text-[14px] text-[#808191]">
                            #{item.trackingCode || "No tracking"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-between">
                        <p className="font-epilogue text-[14px] text-[#808191]">
                          Location: {item.location}
                        </p>
                        <p className="font-epilogue text-[14px] text-[#808191]">
                          Value: {item.estimatedValue || "0"} ETH
                        </p>
                        {item.expiryDate && item.expiryDate !== "0" && (
                          <p className="font-epilogue text-[14px] text-[#808191]">
                            Expires: {formatExpiryDate(item.expiryDate)}
                          </p>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="font-epilogue text-[14px] text-[#808191]">
                          From: {item.donor.slice(0, 6)}...
                          {item.donor.slice(-4)}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#3a3a43]">
                        <h6 className="font-epilogue font-medium text-[14px] text-white mb-2">
                          Supply Chain Status
                        </h6>
                        <div className="flex flex-wrap gap-2">
                          <div
                            className={`px-2 py-1 rounded-lg ${
                              item.status === "pledged"
                                ? "bg-yellow-900/30"
                                : "bg-[#2c2f32]"
                            }`}
                          >
                            <p
                              className={`text-xs ${
                                item.status === "pledged"
                                  ? "text-yellow-500"
                                  : "text-[#808191]"
                              }`}
                            >
                              Pledged
                            </p>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-lg ${
                              item.status === "verified"
                                ? "bg-blue-900/30"
                                : "bg-[#2c2f32]"
                            }`}
                          >
                            <p
                              className={`text-xs ${
                                item.status === "verified"
                                  ? "text-blue-500"
                                  : "text-[#808191]"
                              }`}
                            >
                              Verified
                            </p>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-lg ${
                              item.status === "in-transit"
                                ? "bg-purple-900/30"
                                : "bg-[#2c2f32]"
                            }`}
                          >
                            <p
                              className={`text-xs ${
                                item.status === "in-transit"
                                  ? "text-purple-500"
                                  : "text-[#808191]"
                              }`}
                            >
                              In Transit
                            </p>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-lg ${
                              item.status === "delivered"
                                ? "bg-green-900/30"
                                : "bg-[#2c2f32]"
                            }`}
                          >
                            <p
                              className={`text-xs ${
                                item.status === "delivered"
                                  ? "text-green-500"
                                  : "text-[#808191]"
                              }`}
                            >
                              Delivered
                            </p>
                          </div>
                        </div>
                      </div>
                      {(isOwner || isDonor(item)) &&
                        item.status !== "delivered" && (
                          <div className="mt-4">
                            <CustomButton
                              btnType="button"
                              title="Manage Status"
                              styles="bg-[#8c6dfd] w-full"
                              handleClick={() => handleManageDonation(item)}
                            />
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                    No material donations yet. Be the first one!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
            Fund
          </h4>

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Fund the campaign
            </p>
            <div className="mt-[30px]">
              <input
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Back it because you believe in it.
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  Support the project for no reward, just because it speaks to
                  you.
                </p>
              </div>

              <CustomButton
                btnType="button"
                title="Fund Campaign"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleDonate}
              />
              {campaignData.acceptsMaterialDonations && (
                <div className="mt-[20px]">
                  <CustomButton
                    btnType="button"
                    title="Donate Materials"
                    styles="w-full bg-[#1dc071]"
                    handleClick={navigateToMaterialDonation}
                  />
                  <p className="mt-[10px] font-epilogue font-normal text-[12px] text-center text-[#808191]">
                    {campaignData.itemTypes &&
                    Array.isArray(campaignData.itemTypes)
                      ? `This campaign accepts ${campaignData.itemTypes.join(
                          ", "
                        )} and other physical donations.`
                      : "This campaign accepts material donations."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
