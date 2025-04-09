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
    console.log("Fetched material donations:", data); // Debug
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
      case "cancelled":
        return "text-red-500";
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

  const handleStatusChange = (donationId, newStatus, updatedDonation) => {
    console.log("Status changed for donation:", donationId, "to:", newStatus);
    console.log("Updated donation object:", updatedDonation);

    setMaterialDonations((prevDonations) =>
      prevDonations.map((donation) =>
        donation.id === donationId ? updatedDonation : donation
      )
    );
  };

  const isOwner = address && campaignData && address === campaignData.owner;
  const isDonor = (donation) =>
    address && donation && address === donation.donor;

  if (isLoading) {
    return <Loader />;
  }

  if (!campaignData) {
    return (
      <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] text-white text-center">
          Campaign Not Found
        </h1>
        <p className="font-epilogue font-semibold text-[14px] text-[#808191] text-center mt-[10px]">
          The campaign you're looking for doesn't exist or has been removed.
        </p>
        <CustomButton
          btnType="button"
          title="Go Home"
          styles="bg-[#8c6dfd] mt-[20px]"
          handleClick={() => navigate("/")}
        />
      </div>
    );
  }

  return (
    <div>
      {isLoading && <Loader />}
      {showStatusManager && selectedDonation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1c1c24] p-5 rounded-[10px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="font-epilogue font-bold text-white text-[18px] mb-4">
              Update Donation Status
            </h2>
            <MaterialDonationStatusManager
              donation={selectedDonation}
              onClose={handleStatusManagerClose}
              isOwner={isOwner}
              isDonor={isDonor(selectedDonation)}
              onStatusChange={handleStatusChange}
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
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                {campaignData.acceptsMaterialDonations
                  ? "This campaign accepts both monetary and material donations."
                  : "This campaign accepts only monetary donations."}
              </p>
            </div>
          </div>

          {campaignData.acceptsMaterialDonations && (
            <div>
              <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
                Material Donation Details
              </h4>
              <div className="mt-[20px] flex flex-col gap-[10px]">
                {campaignData.itemTypes &&
                  campaignData.itemTypes.length > 0 && (
                    <div className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">
                      <span className="font-semibold">
                        Accepting donations of:{" "}
                      </span>
                      {Array.isArray(campaignData.itemTypes)
                        ? campaignData.itemTypes.join(", ")
                        : campaignData.itemTypes}
                    </div>
                  )}
                {campaignData.itemType && campaignData.quantity && (
                  <div className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">
                    <span className="font-semibold">Currently needed: </span>
                    {campaignData.quantity} {campaignData.unit} of{" "}
                    {campaignData.itemType}
                  </div>
                )}
                {campaignData.location && (
                  <div className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">
                    <span className="font-semibold">Primary location: </span>
                    {campaignData.location}
                  </div>
                )}
                {campaignData.acceptedLocations && (
                  <div className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">
                    <span className="font-semibold">
                      Additional locations:{" "}
                    </span>
                    {campaignData.acceptedLocations}
                  </div>
                )}
                {campaignData.expiryDate && campaignData.expiryDate !== "0" && (
                  <div className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">
                    <span className="font-semibold">Expiry date: </span>
                    {formatExpiryDate(campaignData.expiryDate)}
                  </div>
                )}
              </div>
            </div>
          )}

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
                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-all">
                      {index + 1}. {item.donator}
                    </p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-all">
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
                      key={`${item.id}-${index}`}
                      className="flex flex-col gap-[10px] bg-[#1c1c24] p-4 rounded-[10px]"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-epilogue font-semibold text-[16px] text-white">
                          {item.itemType} ({item.quantity} {item.unit})
                        </p>
                        <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                          {item.description || "No description"}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        {item.trackingCode && (
                          <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                            Tracking: {item.trackingCode}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-[5px]">
                        <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                          Location: {item.location}
                        </p>
                        {item.estimatedValue && (
                          <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                            Value: {item.estimatedValue} ETH
                          </p>
                        )}
                        {item.expiryDate && item.expiryDate !== "0" && (
                          <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                            Expires: {formatExpiryDate(item.expiryDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-[5px]">
                        <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                          From:{" "}
                          {item.donor
                            ? `${item.donor.slice(0, 6)}...${item.donor.slice(
                                -4
                              )}`
                            : "Unknown"}
                        </p>
                        <CustomButton
                          btnType="button"
                          title="Manage Status"
                          styles="bg-[#8c6dfd] min-h-[36px] py-[5px]"
                          handleClick={() => handleManageDonation(item)}
                        />
                      </div>
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
            </div>
          </div>

          {campaignData.acceptsMaterialDonations && (
            <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
              <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
                {campaignData.itemTypes && Array.isArray(campaignData.itemTypes)
                  ? `This campaign accepts ${campaignData.itemTypes.join(
                      ", "
                    )} and other physical donations.`
                  : "This campaign accepts material donations."}
              </p>
              <div className="mt-[30px]">
                <CustomButton
                  btnType="button"
                  title="Donate Materials"
                  styles="w-full bg-[#8c6dfd]"
                  handleClick={navigateToMaterialDonation}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
