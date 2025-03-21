import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { thirdweb } from "../assets";
import { CustomButton, FormField } from ".";

const MaterialDonationCard = ({
  donation,
  campaign,
  handleUpdateStatus,
  handleVerify,
  handleMarkDelivered,
  isOwner,
  isDonor,
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  const statusBgColor = (status) => {
    switch (status) {
      case "pledged":
        return "bg-[#FFCA28]";
      case "verified":
        return "bg-[#29B6F6]";
      case "in-transit":
        return "bg-[#8C9EFF]";
      case "delivered":
        return "bg-[#66BB6A]";
      default:
        return "bg-[#757575]";
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus) {
      handleUpdateStatus(donation.id, newStatus);
      setIsUpdating(false);
      setNewStatus("");
    }
  };

  const handleVerification = () => {
    if (verificationNotes) {
      handleVerify(donation.id, verificationNotes);
      setIsVerifying(false);
      setVerificationNotes("");
    }
  };

  return (
    <div className="bg-[#1c1c24] rounded-[15px] w-full sm:w-[288px] overflow-hidden">
      <div className="flex flex-col p-4">
        <div className="flex items-center mb-[18px]">
          <img
            src={thirdweb}
            alt="donor"
            className="w-[40px] h-[40px] rounded-full object-cover"
          />
          <div className="ml-[12px] flex-1">
            <h4 className="font-epilogue font-semibold text-[14px] text-white">
              {donation.itemType}
            </h4>
            <p className="font-epilogue font-normal text-[12px] text-[#808191] truncate">
              {donation.donor.slice(0, 5)}...{donation.donor.slice(-5)}
            </p>
          </div>
        </div>

        {donation.imageUri && (
          <div className="w-full h-[158px] rounded-[15px] mb-[16px] overflow-hidden">
            <img
              src={donation.imageUri}
              alt="donation"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
            {donation.quantity} {donation.unit} {donation.itemType}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {donation.description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd]">
              Value
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] text-[#808191]">
              {donation.estimatedValue} ETH
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd]">
              Location
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] text-[#808191] truncate max-w-[120px]">
              {donation.location}
            </p>
          </div>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd]">
              Pledged
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] text-[#808191]">
              {formatDate(donation.timestamp)}
            </p>
          </div>
          {donation.expiryDate > 0 && (
            <div className="flex flex-col">
              <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd]">
                Expires
              </h4>
              <p className="mt-[3px] font-epilogue font-normal text-[12px] text-[#808191]">
                {formatDate(donation.expiryDate)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-[20px] flex items-center">
          <div
            className={`${statusBgColor(
              donation.status
            )} py-[6px] px-[10px] rounded-full`}
          >
            <p className="font-epilogue font-semibold text-[12px] text-white">
              {donation.status.charAt(0).toUpperCase() +
                donation.status.slice(1)}
            </p>
          </div>
          {donation.trackingCode && (
            <p className="ml-[12px] font-epilogue font-normal text-[12px] text-[#808191]">
              ID: {donation.trackingCode}
            </p>
          )}
        </div>

        <div className="mt-[20px] flex flex-col gap-[10px]">
          {/* Action buttons for different roles */}
          {(isDonor || isOwner) && donation.status !== "delivered" && (
            <>
              {!isUpdating ? (
                <CustomButton
                  btnType="button"
                  title="Update Status"
                  styles="bg-[#8c6dfd] w-full"
                  handleClick={() => setIsUpdating(true)}
                />
              ) : (
                <div className="flex flex-col">
                  <select
                    className="py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] rounded-[10px]"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="pledged">Pledged</option>
                    <option value="in-transit">In Transit</option>
                    <option value="verified">Verified</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <div className="flex justify-between mt-[10px]">
                    <CustomButton
                      btnType="button"
                      title="Update"
                      styles="bg-[#1dc071]"
                      handleClick={handleStatusUpdate}
                    />
                    <CustomButton
                      btnType="button"
                      title="Cancel"
                      styles="bg-[#8c6dfd]"
                      handleClick={() => setIsUpdating(false)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {isOwner && donation.status !== "delivered" && (
            <>
              {!isVerifying ? (
                <CustomButton
                  btnType="button"
                  title="Verify Donation"
                  styles="bg-[#1dc071] w-full"
                  handleClick={() => setIsVerifying(true)}
                />
              ) : (
                <div className="flex flex-col">
                  <FormField
                    labelName="Verification Notes"
                    placeholder="Add verification notes"
                    isTextArea
                    value={verificationNotes}
                    handleChange={(e) => setVerificationNotes(e.target.value)}
                  />
                  <div className="flex justify-between mt-[10px]">
                    <CustomButton
                      btnType="button"
                      title="Verify"
                      styles="bg-[#1dc071]"
                      handleClick={handleVerification}
                    />
                    <CustomButton
                      btnType="button"
                      title="Cancel"
                      styles="bg-[#8c6dfd]"
                      handleClick={() => setIsVerifying(false)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {isOwner && donation.status === "in-transit" && (
            <CustomButton
              btnType="button"
              title="Mark as Delivered"
              styles="bg-[#66BB6A] w-full"
              handleClick={() => handleMarkDelivered(donation.id)}
            />
          )}
        </div>

        {donation.verificationNotes &&
          donation.verificationNotes.length > 0 && (
            <div className="mt-[15px]">
              <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd]">
                Verification Notes
              </h4>
              {donation.verificationNotes.map((note, index) => (
                <div
                  key={index}
                  className="mt-[5px] bg-[#13131a] p-2 rounded-[10px]"
                >
                  <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                    {note}
                  </p>
                  <p className="font-epilogue font-normal text-[10px] text-[#4b5264] mt-1">
                    {formatDate(donation.verificationTimestamps[index])}
                  </p>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default MaterialDonationCard;
