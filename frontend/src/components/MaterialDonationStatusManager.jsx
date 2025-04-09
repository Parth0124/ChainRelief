import React, { useState, useEffect } from "react";
import { useStateContext } from "../context";
import { CustomButton } from "./";

const MaterialDonationStatusManager = ({
  donation,
  onClose,
  isOwner,
  isDonor,
  onStatusChange,
}) => {
  const {
    updateDonationStatus,
    verifyDonation,
    markDonationDelivered,
    getMaterialDonation,
    contract,
    address,
  } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [trackingCode, setTrackingCode] = useState(donation.trackingCode || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStatus, setCurrentStatus] = useState(donation.status);
  const [refreshedDonation, setRefreshedDonation] = useState(null);

  useEffect(() => {
    console.log("Donation object received:", donation);
    console.log("Donation ID:", donation.id);
  }, [donation]);

  const refreshDonationData = async () => {
    try {
      if (!contract || donation.id === undefined || donation.id === null) {
        return;
      }

      const updatedDonation = await getMaterialDonation(donation.id);
      console.log("Refreshed donation data:", updatedDonation);
      setRefreshedDonation(updatedDonation);
      setCurrentStatus(updatedDonation.status);
    } catch (error) {
      console.error("Failed to refresh donation data:", error);
    }
  };

  useEffect(() => {
    refreshDonationData();
  }, [contract, donation.id]);

  const notifyStatusChange = (donationId, newStatus, trackingCode = null) => {
    const updatedDonation = {
      ...donation,
      status: newStatus,
      ...(trackingCode && { trackingCode }),
    };

    if (onStatusChange) onStatusChange(donationId, newStatus, updatedDonation);
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        throw new Error("Contract not connected");
      }

      if (donation.id === undefined || donation.id === null) {
        throw new Error("Invalid donation ID");
      }

      await updateDonationStatus(donation.id, newStatus);

      setCurrentStatus(newStatus);
      setSuccess(`Donation status updated to ${newStatus.toUpperCase()}`);
      notifyStatusChange(donation.id, newStatus);
      await refreshDonationData();

      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to update donation status:", error);
      setError(error.message || "Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDonation = async () => {
    if (!verificationNotes.trim()) {
      setError("Please provide verification notes");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        throw new Error("Contract not connected");
      }
      if (donation.id === undefined || donation.id === null) {
        console.error("Donation ID is invalid:", donation.id);
        throw new Error("Invalid donation ID");
      }

      console.log("Attempting to verify donation with ID:", donation.id);
      console.log("Connected wallet address:", address);
      await verifyDonation(parseInt(donation.id), verificationNotes);

      setCurrentStatus("verified");
      setSuccess("Donation verified successfully");
      await refreshDonationData();
      notifyStatusChange(donation.id, "verified");

      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to verify donation:", error);
      setError(error.message || "Failed to verify donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        throw new Error("Contract not connected");
      }

      if (donation.id === undefined || donation.id === null) {
        throw new Error("Invalid donation ID");
      }

      await markDonationDelivered(parseInt(donation.id));

      setCurrentStatus("delivered");
      setSuccess("Donation marked as delivered");

      await refreshDonationData();

      notifyStatusChange(donation.id, "delivered");

      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to mark donation as delivered:", error);
      setError(
        error.message || "Failed to mark as delivered. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTrackingCode = async () => {
    if (!trackingCode.trim()) {
      setError("Please provide a tracking code");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        throw new Error("Contract not connected");
      }

      if (donation.id === undefined || donation.id === null) {
        throw new Error("Invalid donation ID");
      }

      await updateDonationStatus(
        parseInt(donation.id),
        "in-transit",
        trackingCode
      );

      setCurrentStatus("in-transit");
      setSuccess("Tracking code updated and status changed to IN-TRANSIT");

      await refreshDonationData();

      notifyStatusChange(donation.id, "in-transit", trackingCode);

      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to update tracking code:", error);
      setError(
        error.message || "Failed to update tracking code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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
        return "text-white";
    }
  };

  const renderStatusOptions = () => {
    switch (currentStatus) {
      case "pledged":
        return (
          <div className="flex flex-col gap-3">
            <p className="font-epilogue text-[14px] text-[#808191] mb-2">
              Verify this donation by confirming you accept the pledged items
            </p>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Verification notes (e.g., items quality, condition, etc.)"
              className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] leading-[24px] placeholder:text-[#4b5264] rounded-[10px] min-h-[100px]"
            />
            <CustomButton
              btnType="button"
              title={isLoading ? "Processing..." : "Verify Donation"}
              styles="bg-blue-500 w-full"
              handleClick={handleVerifyDonation}
              disabled={isLoading}
            />
            <CustomButton
              btnType="button"
              title="Cancel Donation"
              styles="bg-red-500 w-full mt-2"
              handleClick={() => handleUpdateStatus("cancelled")}
              disabled={isLoading}
            />
          </div>
        );

      case "verified":
        return (
          <div className="flex flex-col gap-3">
            <p className="font-epilogue text-[14px] text-[#808191] mb-2">
              This donation has been verified. Update the status to "In Transit"
              when items are shipped.
            </p>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Tracking code (optional)"
              className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] leading-[24px] placeholder:text-[#4b5264] rounded-[10px]"
            />
            <CustomButton
              btnType="button"
              title={isLoading ? "Processing..." : "Mark as In Transit"}
              styles="bg-purple-500 w-full"
              handleClick={handleUpdateTrackingCode}
              disabled={isLoading}
            />
            <CustomButton
              btnType="button"
              title="Cancel Donation"
              styles="bg-red-500 w-full mt-2"
              handleClick={() => handleUpdateStatus("cancelled")}
              disabled={isLoading}
            />
          </div>
        );

      case "in-transit":
        return (
          <div className="flex flex-col gap-3">
            <p className="font-epilogue text-[14px] text-[#808191] mb-2">
              The donation is currently in transit. Mark as delivered when
              received.
            </p>
            {donation.trackingCode && (
              <p className="font-epilogue text-[14px] text-white mb-4">
                Tracking Code: {donation.trackingCode}
              </p>
            )}
            <CustomButton
              btnType="button"
              title={isLoading ? "Processing..." : "Mark as Delivered"}
              styles="bg-green-500 w-full"
              handleClick={handleMarkDelivered}
              disabled={isLoading}
            />
            <CustomButton
              btnType="button"
              title="Cancel Donation"
              styles="bg-red-500 w-full mt-2"
              handleClick={() => handleUpdateStatus("cancelled")}
              disabled={isLoading}
            />
          </div>
        );

      case "delivered":
        return (
          <div>
            <p className="font-epilogue text-[16px] text-green-500 font-semibold mb-2">
              Donation Completed Successfully
            </p>
            <p className="font-epilogue text-[14px] text-[#808191]">
              This donation has been delivered and marked as complete. Thank you
              for your contribution to this campaign!
            </p>
            <CustomButton
              btnType="button"
              title="Close"
              styles="bg-[#3a3a43] w-full mt-4"
              handleClick={onClose}
            />
          </div>
        );

      case "cancelled":
        return (
          <div>
            <p className="font-epilogue text-[16px] text-red-500 font-semibold mb-2">
              Donation Cancelled
            </p>
            <p className="font-epilogue text-[14px] text-[#808191]">
              This donation has been cancelled and is no longer active.
            </p>
            <CustomButton
              btnType="button"
              title="Close"
              styles="bg-[#3a3a43] w-full mt-4"
              handleClick={onClose}
            />
          </div>
        );

      default:
        return (
          <p className="font-epilogue text-[14px] text-[#808191]">
            Unknown donation status. Please contact support.
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-[#13131a] p-4 rounded-[10px] mb-4">
        <h4 className="font-epilogue font-semibold text-[16px] text-white mb-2">
          Donation Information
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[14px]">
          <div className="font-epilogue text-[#808191]">Item Type:</div>
          <div className="font-epilogue text-white">{donation.itemType}</div>

          <div className="font-epilogue text-[#808191]">Quantity:</div>
          <div className="font-epilogue text-white">
            {donation.quantity} {donation.unit}
          </div>

          <div className="font-epilogue text-[#808191]">Status:</div>
          <div
            className={`font-epilogue font-semibold ${getStatusColor(
              currentStatus
            )}`}
          >
            {currentStatus.toUpperCase()}
          </div>

          <div className="font-epilogue text-[#808191]">Location:</div>
          <div className="font-epilogue text-white">{donation.location}</div>

          {donation.estimatedValue && (
            <>
              <div className="font-epilogue text-[#808191]">Est. Value:</div>
              <div className="font-epilogue text-white">
                {donation.estimatedValue} ETH
              </div>
            </>
          )}

          <div className="font-epilogue text-[#808191]">Donation ID:</div>
          <div className="font-epilogue text-white">
            {donation.id !== undefined ? donation.id : "Not assigned"}
          </div>
        </div>
      </div>
      {error && (
        <div className="bg-red-900/30 p-3 rounded-[10px] mb-4">
          <p className="font-epilogue text-[14px] text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 p-3 rounded-[10px] mb-4">
          <p className="font-epilogue text-[14px] text-green-500">{success}</p>
        </div>
      )}
      {renderStatusOptions()}
      {currentStatus !== "delivered" && currentStatus !== "cancelled" && (
        <CustomButton
          btnType="button"
          title="Cancel"
          styles="bg-[#3a3a43] w-full mt-4"
          handleClick={onClose}
          disabled={isLoading}
        />
      )}
    </div>
  );
};

export default MaterialDonationStatusManager;
