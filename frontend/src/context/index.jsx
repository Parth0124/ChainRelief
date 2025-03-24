import React, { useContext, createContext } from "react";

import {
  useAddress,
  useContract,
  useMetamask,
  useDisconnect,
  useContractWrite,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { EditionMetadataWithOwnerOutputSchema } from "@thirdweb-dev/sdk";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(
    "0x16f4058de32ebee0e859ae48a4d29d02d4f5ba68"
  );
  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign"
  );

  const { mutateAsync: pledgeMaterialDonation } = useContractWrite(
    contract,
    "pledgeMaterialDonation"
  );

  const { mutateAsync: updateMaterialDonationStatus } = useContractWrite(
    contract,
    "updateMaterialDonationStatus"
  );

  const { mutateAsync: verifyMaterialDonation } = useContractWrite(
    contract,
    "verifyMaterialDonation"
  );

  const { mutateAsync: markMaterialDonationDelivered } = useContractWrite(
    contract,
    "markMaterialDonationDelivered"
  );

  const address = useAddress();
  const connect = useMetamask();
  const disconnect = useDisconnect();

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({
        args: [
          address,
          form.title, 
          form.description,
          form.target,
          new Date(form.deadline).getTime(),
          form.image,
          form.acceptsMaterialDonations || false,
        ],
      });

      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    const campaigns = await contract.call("getCampaigns");

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      acceptsMaterialDonations: campaign.acceptsMaterialDonations,
      materialDonationIds: campaign.materialDonationIds,
      pId: i,
    }));

    return parsedCampaings;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  const donate = async (pId, amount) => {
    const data = await contract.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };

  const getDonations = async (pId) => {
    const donations = await contract.call("getDonors", [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    return parsedDonations;
  };
  const createMaterialDonation = async (campaignId, donationData) => {
    try {
      const data = await pledgeMaterialDonation({
        args: [
          campaignId,
          donationData.itemType,
          donationData.description,
          donationData.quantity,
          donationData.unit,
          donationData.estimatedValue,
          donationData.location,
          donationData.expiryDate || 0,
          donationData.imageUri || "",
        ],
      });

      console.log("material donation pledged successfully", data);
      return data;
    } catch (error) {
      console.log("material donation pledge failed", error);
      throw error;
    }
  };

  const updateDonationStatus = async (donationId, newStatus) => {
    try {
      const data = await updateMaterialDonationStatus({
        args: [donationId, newStatus],
      });

      console.log("donation status updated successfully", data);
      return data;
    } catch (error) {
      console.log("donation status update failed", error);
      throw error;
    }
  };

  const verifyDonation = async (donationId, notes) => {
    try {
      const data = await verifyMaterialDonation({
        args: [donationId, notes],
      });

      console.log("donation verified successfully", data);
      return data;
    } catch (error) {
      console.log("donation verification failed", error);
      throw error;
    }
  };

  const markDonationDelivered = async (donationId) => {
    try {
      const data = await markMaterialDonationDelivered({
        args: [donationId],
      });

      console.log("donation marked delivered successfully", data);
      return data;
    } catch (error) {
      console.log("marking donation as delivered failed", error);
      throw error;
    }
  };

  const getMaterialDonation = async (donationId) => {
    try {
      const donation = await contract.call("getMaterialDonation", [donationId]);

      return {
        campaignId: donation.campaignId.toNumber(),
        donor: donation.donor,
        itemType: donation.itemType,
        description: donation.description,
        quantity: donation.quantity.toNumber(),
        unit: donation.unit,
        estimatedValue: ethers.utils.formatEther(
          donation.estimatedValue.toString()
        ),
        location: donation.location,
        expiryDate: donation.expiryDate.toNumber(),
        timestamp: donation.timestamp.toNumber(),
        status: donation.status,
        verifiers: donation.verifiers,
        verificationNotes: donation.verificationNotes,
        verificationTimestamps: donation.verificationTimestamps.map(
          (timestamp) => timestamp.toNumber()
        ),
        trackingCode: donation.trackingCode,
        imageUri: donation.imageUri,
        id: donationId,
      };
    } catch (error) {
      console.log("getting material donation failed", error);
      throw error;
    }
  };

  const getCampaignMaterialDonations = async (campaignId) => {
    try {
      const donations = await contract.call("getCampaignMaterialDonations", [
        campaignId,
      ]);

      return donations.map((donation, index) => ({
        campaignId: donation.campaignId.toNumber(),
        donor: donation.donor,
        itemType: donation.itemType,
        description: donation.description,
        quantity: donation.quantity.toNumber(),
        unit: donation.unit,
        estimatedValue: ethers.utils.formatEther(
          donation.estimatedValue.toString()
        ),
        location: donation.location,
        expiryDate: donation.expiryDate.toNumber(),
        timestamp: donation.timestamp.toNumber(),
        status: donation.status,
        verifiers: donation.verifiers,
        verificationNotes: donation.verificationNotes,
        verificationTimestamps: donation.verificationTimestamps.map(
          (timestamp) => timestamp.toNumber()
        ),
        trackingCode: donation.trackingCode,
        imageUri: donation.imageUri,
        id: index,
      }));
    } catch (error) {
      console.log("getting campaign material donations failed", error);
      throw error;
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        disconnect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        createMaterialDonation,
        updateDonationStatus,
        verifyDonation,
        markDonationDelivered,
        getMaterialDonation,
        getCampaignMaterialDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
