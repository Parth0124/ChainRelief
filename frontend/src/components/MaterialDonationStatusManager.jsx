import React, { useState } from "react";
import { useStateContext } from "../context";
import { CustomButton } from "./";

const MaterialDonationStatusManager = ({
  donation,
  onClose,
  isOwner,
  isDonor,
}) => {
  const { updateDonationStatus, verifyDonation, markDonationDelivered } =
    useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [trackingCode, setTrackingCode] = useState(donation.trackingCode || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateStatus = async (newStatus) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateDonationStatus(donation.id, newStatus);
      setSuccess(`Donation status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to update donation status:", error);
      setError("Failed to update status. Please try again.");
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
      await verifyDonation(donation.id, verificationNotes);
      setSuccess("Donation verified successfully");
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to verify donation:", error);
      setError("Failed to verify donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await markDonationDelivered(donation.id);
      setSuccess("Donation marked as delivered");
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to mark donation as delivered:", error);
      setError("Failed to mark as delivered. Please try again.");
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
      await updateDonationStatus(donation.id, "in-transit", trackingCode);
      setSuccess("Tracking code updated and status changed to IN-TRANSIT");
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to update tracking code:", error);
      setError("Failed to update tracking code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusOptions = () => {
    switch (donation.status) {
      case "pledged":
        return isOwner ? (
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
          </div>
        ) : isDonor ? (
          <div>
            <p className="font-epilogue text-[14px] text-[#808191] mb-4">
              Your donation is waiting for verification by the campaign owner.
            </p>
            <CustomButton
              btnType="button"
              title="Cancel Donation"
              styles="bg-red-500 w-full"
              handleClick={() => handleUpdateStatus("cancelled")}
              disabled={isLoading}
            />
          </div>
        ) : (
          <p className="font-epilogue text-[14px] text-[#808191]">
            Only the campaign owner can verify this donation.
          </p>
        );

      case "verified":
        return isDonor ? (
          <div className="flex flex-col gap-3">
            <p className="font-epilogue text-[14px] text-[#808191] mb-2">
              Your donation has been verified. Update the status to "In Transit"
              when you ship the items.
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
          </div>
        ) : isOwner ? (
          <p className="font-epilogue text-[14px] text-[#808191]">
            Waiting for the donor to ship the items.
          </p>
        ) : (
          <p className="font-epilogue text-[14px] text-[#808191]">
            This donation has been verified and is awaiting shipment.
          </p>
        );

      case "in-transit":
        return isOwner ? (
          <div className="flex flex-col gap-3">
            <p className="font-epilogue text-[14px] text-[#808191] mb-2">
              The donation is on its way to you. Mark as delivered when you
              receive it.
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
          </div>
        ) : isDonor ? (
          <div>
            <p className="font-epilogue text-[14px] text-[#808191] mb-2">
              Your donation is in transit. The campaign owner will mark it as
              delivered when received.
            </p>
            {donation.trackingCode && (
              <p className="font-epilogue text-[14px] text-white mb-4">
                Tracking Code: {donation.trackingCode}
              </p>
            )}
            <p className="font-epilogue text-[14px] text-[#808191]">
              Keep track of your shipment and let the campaign owner know if
              there are any issues.
            </p>
          </div>
        ) : (
          <p className="font-epilogue text-[14px] text-[#808191]">
            This donation is in transit to the campaign owner.
          </p>
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

          <div className="font-epilogue text-[#808191]">Current Status:</div>
          <div
            className={`font-epilogue font-semibold ${
              donation.status === "pledged"
                ? "text-yellow-500"
                : donation.status === "verified"
                ? "text-blue-500"
                : donation.status === "in-transit"
                ? "text-purple-500"
                : donation.status === "delivered"
                ? "text-green-500"
                : donation.status === "cancelled"
                ? "text-red-500"
                : "text-white"
            }`}
          >
            {donation.status.toUpperCase()}
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
      {donation.status !== "delivered" && donation.status !== "cancelled" && (
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
