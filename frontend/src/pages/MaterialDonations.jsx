import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { CustomButton, FormField, Loader } from "../components";
import { MaterialDonationCard } from "../components";

const MaterialDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    createMaterialDonation,
    getCampaignMaterialDonations,
    updateDonationStatus,
    verifyDonation,
    markDonationDelivered,
    address,
  } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [materialDonations, setMaterialDonations] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    itemType: "",
    description: "",
    quantity: "",
    unit: "",
    estimatedValue: "",
    location: "",
    expiryDate: "",
    imageUri: "",
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const fetchCampaignDetails = async () => {
    const { getCampaigns } = useStateContext();
    const campaigns = await getCampaigns();
    const campaignDetails = campaigns.find(
      (campaign) => campaign.pId === parseInt(id)
    );
    setCampaign(campaignDetails);
  };

  const fetchMaterialDonations = async () => {
    try {
      const donations = await getCampaignMaterialDonations(id);
      setMaterialDonations(donations);
    } catch (error) {
      console.log("Error fetching material donations:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaignDetails();
      fetchMaterialDonations();
    }
  }, [id, address]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      await createMaterialDonation(id, {
        ...form,
        quantity: parseInt(form.quantity),
        estimatedValue: form.estimatedValue
          ? ethers.utils.parseEther(form.estimatedValue).toString()
          : "0",
        expiryDate: form.expiryDate ? new Date(form.expiryDate).getTime() : 0,
      });

      setIsLoading(false);
      setIsCreating(false);
      fetchMaterialDonations();
      setForm({
        itemType: "",
        description: "",
        quantity: "",
        unit: "",
        estimatedValue: "",
        location: "",
        expiryDate: "",
        imageUri: "",
      });
    } catch (error) {
      console.log("Error creating material donation:", error);
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (donationId, newStatus) => {
    setIsLoading(true);
    try {
      await updateDonationStatus(donationId, newStatus);
      setIsLoading(false);
      fetchMaterialDonations();
    } catch (error) {
      console.log("Error updating status:", error);
      setIsLoading(false);
    }
  };

  const handleVerify = async (donationId, notes) => {
    setIsLoading(true);
    try {
      await verifyDonation(donationId, notes);
      setIsLoading(false);
      fetchMaterialDonations();
    } catch (error) {
      console.log("Error verifying donation:", error);
      setIsLoading(false);
    }
  };

  const handleMarkDelivered = async (donationId) => {
    setIsLoading(true);
    try {
      await markDonationDelivered(donationId);
      setIsLoading(false);
      fetchMaterialDonations();
    } catch (error) {
      console.log("Error marking as delivered:", error);
      setIsLoading(false);
    }
  };

  if (!campaign)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader />
      </div>
    );

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex flex-col">
          <h1 className="font-epilogue font-bold text-[18px] text-white uppercase">
            Material Donations for {campaign.title}
          </h1>

          {!isCreating ? (
            <div className="mt-[20px]">
              <CustomButton
                btnType="button"
                title="Donate Materials"
                styles="bg-[#1dc071] w-fit"
                handleClick={() => setIsCreating(true)}
              />
            </div>
          ) : (
            <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4 mt-[20px]">
              <div className="flex justify-between items-center w-full">
                <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
                  Donate Materials
                </h1>
                <button
                  onClick={() => setIsCreating(false)}
                  className="font-epilogue font-bold text-[16px] text-[#1dc071]"
                >
                  Cancel
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="w-full mt-[20px] flex flex-col gap-[20px]"
              >
                <div className="flex flex-wrap gap-[30px]">
                  <FormField
                    labelName="Item Type *"
                    placeholder="Food, Clothing, Medicine, etc."
                    inputType="text"
                    value={form.itemType}
                    handleChange={(e) => handleFormFieldChange("itemType", e)}
                  />
                  <FormField
                    labelName="Quantity *"
                    placeholder="10"
                    inputType="number"
                    value={form.quantity}
                    handleChange={(e) => handleFormFieldChange("quantity", e)}
                  />
                </div>

                <div className="flex flex-wrap gap-[30px]">
                  <FormField
                    labelName="Unit *"
                    placeholder="kg, boxes, items"
                    inputType="text"
                    value={form.unit}
                    handleChange={(e) => handleFormFieldChange("unit", e)}
                  />
                  <FormField
                    labelName="Estimated Value (ETH)"
                    placeholder="0.1"
                    inputType="text"
                    value={form.estimatedValue}
                    handleChange={(e) =>
                      handleFormFieldChange("estimatedValue", e)
                    }
                  />
                </div>

                <FormField
                  labelName="Description *"
                  placeholder="Describe your donation"
                  isTextArea
                  value={form.description}
                  handleChange={(e) => handleFormFieldChange("description", e)}
                />

                <FormField
                  labelName="Pickup Location *"
                  placeholder="Where can the donation be picked up"
                  inputType="text"
                  value={form.location}
                  handleChange={(e) => handleFormFieldChange("location", e)}
                />

                <FormField
                  labelName="Expiry Date (if applicable)"
                  placeholder="When will the items expire"
                  inputType="date"
                  value={form.expiryDate}
                  handleChange={(e) => handleFormFieldChange("expiryDate", e)}
                />

                <FormField
                  labelName="Image URL"
                  placeholder="Image of the donation (optional)"
                  inputType="url"
                  value={form.imageUri}
                  handleChange={(e) => handleFormFieldChange("imageUri", e)}
                />

                <div className="flex justify-center items-center mt-[30px]">
                  <CustomButton
                    btnType="submit"
                    title="Submit Donation"
                    styles="bg-[#1dc071]"
                  />
                </div>
              </form>
            </div>
          )}

          <div className="mt-[60px] flex flex-col gap-[20px]">
            <h2 className="font-epilogue font-bold text-[18px] text-white">
              Material Donations ({materialDonations.length})
            </h2>

            <div className="flex flex-wrap gap-[26px]">
              {materialDonations.length > 0 ? (
                materialDonations.map((donation) => (
                  <MaterialDonationCard
                    key={`${donation.id}-${donation.donor}`}
                    donation={donation}
                    campaign={campaign}
                    handleUpdateStatus={handleUpdateStatus}
                    handleVerify={handleVerify}
                    handleMarkDelivered={handleMarkDelivered}
                    isOwner={campaign.owner === address}
                    isDonor={donation.donor === address}
                  />
                ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                  No material donations yet. Be the first to donate!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDonation;
