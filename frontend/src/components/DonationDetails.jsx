import React, { useState, useEffect } from "react";
import { useStateContext } from "../context";
import MaterialDonationStatusManager from "./MaterialDonationStatusManager";

const DonationDetailsModal = ({
  donation: initialDonation,
  onClose,
  isOwner,
  isDonor,
}) => {
  const { getMaterialDonation } = useStateContext();
  const [donation, setDonation] = useState(initialDonation);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (donationId, newStatus, trackingCode) => {
    setDonation((prevDonation) => ({
      ...prevDonation,
      status: newStatus,
      ...(trackingCode ? { trackingCode } : {}),
    }));

    try {
      const updatedDonation = await getMaterialDonation(donationId);
      setDonation(updatedDonation);
    } catch (error) {
      console.error("Failed to refresh donation data:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const updatedDonation = await getMaterialDonation(initialDonation.id);
        setDonation(updatedDonation);
      } catch (error) {
        console.error("Failed to fetch updated donation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialDonation.id]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 p-4">
      <div className="bg-[#1c1c24] rounded-[20px] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="font-epilogue font-bold text-white text-[18px] mb-4">
          Material Donation Details
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="font-epilogue text-white">
              Loading donation details...
            </p>
          </div>
        ) : (
          <MaterialDonationStatusManager
            donation={donation}
            onClose={onClose}
            isOwner={isOwner}
            isDonor={isDonor}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
};

export default DonationDetailsModal;