import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { CustomButton, FormField, Loader } from "../components";

const DonateMaterials = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { createMaterialDonation, contract, address } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    itemType: "",
    quantity: "1",
    unit: "pcs",
    description: "",
    location: "",
    estimatedValue: "0",
    expiryDate: "",
    imageUri: "",
  });

  // Load campaign details if not in state
  useEffect(() => {
    if (!state) {
      navigate(`/campaign-details/${id}`);
    }
  }, [state, id, navigate]);

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.itemType || !form.quantity || !form.location) {
      alert("Please fill all required fields");
      return;
    }

    // Parse expiry date to Unix timestamp if provided
    let expiryTimestamp = 0;
    if (form.expiryDate) {
      expiryTimestamp = Math.floor(new Date(form.expiryDate).getTime() / 1000);
    }

    // Format donation data
    const materialDonation = {
      itemType: form.itemType,
      quantity: form.quantity,
      unit: form.unit,
      description:
        form.description || `${form.quantity} ${form.unit} of ${form.itemType}`,
      location: form.location,
      imageUri: form.imageUri || "",
      expiryDate: expiryTimestamp,
    };

    // Validate and convert estimatedValue to wei
    try {
      if (form.estimatedValue && !isNaN(form.estimatedValue)) {
        materialDonation.estimatedValue = ethers.utils
          .parseEther(form.estimatedValue)
          .toString();
      } else {
        materialDonation.estimatedValue = "0";
      }
    } catch (error) {
      console.error("Invalid ETH value:", error);
      alert("Please enter a valid ETH amount");
      return;
    }

    setIsLoading(true);
    try {
      await createMaterialDonation(state.pId || parseInt(id), materialDonation);
      navigate(`/campaign-details/${state.pId || id}`);
    } catch (error) {
      console.error("Error donating materials:", error);
      alert("Something went wrong while donating materials");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  // If no state is available, don't render the form yet
  if (!state) {
    return <Loader />;
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Donate Materials
        </h1>
      </div>

      <div className="w-full mt-[20px] mb-[10px] flex flex-col gap-[20px]">
        <div className="flex flex-col gap-[30px]">
          <div className="bg-[#13131a] p-4 rounded-[10px]">
            <h3 className="font-epilogue font-semibold text-[16px] text-white mb-2">
              Campaign: {state.title}
            </h3>
            <p className="font-epilogue text-[14px] text-[#808191]">
              {state.acceptsMaterialDonations
                ? `This campaign is accepting material donations${
                    state.itemTypes && Array.isArray(state.itemTypes)
                      ? ` of: ${state.itemTypes.join(", ")}`
                      : ""
                  }`
                : "This campaign does not accept material donations."}
            </p>
            {state.location && (
              <p className="font-epilogue text-[14px] text-[#808191] mt-1">
                Primary location: {state.location}
              </p>
            )}
          </div>

          <FormField
            labelName="What are you donating? *"
            placeholder="e.g. Clothes, Food, Medical Supplies"
            inputType="text"
            value={form.itemType}
            handleChange={(e) => handleFormFieldChange("itemType", e)}
          />

          <div className="flex flex-wrap gap-[40px]">
            <FormField
              labelName="Quantity *"
              placeholder="e.g. 10"
              inputType="number"
              value={form.quantity}
              handleChange={(e) => handleFormFieldChange("quantity", e)}
              styles="flex-1"
            />

            <FormField
              labelName="Unit"
              placeholder="e.g. pcs, kg, boxes"
              inputType="text"
              value={form.unit}
              handleChange={(e) => handleFormFieldChange("unit", e)}
              styles="flex-1"
            />
          </div>

          <FormField
            labelName="Brief Description"
            placeholder="e.g. New winter clothes for children"
            isTextArea
            value={form.description}
            handleChange={(e) => handleFormFieldChange("description", e)}
          />

          <FormField
            labelName="Your Location (for pickup/delivery) *"
            placeholder="e.g. New York, NY"
            inputType="text"
            value={form.location}
            handleChange={(e) => handleFormFieldChange("location", e)}
          />

          <div className="flex flex-wrap gap-[40px]">
            <FormField
              labelName="Estimated Value (ETH)"
              placeholder="e.g. 0.1"
              inputType="number"
              step="0.0001"
              min="0"
              value={form.estimatedValue}
              handleChange={(e) => handleFormFieldChange("estimatedValue", e)}
              styles="flex-1"
            />

            <FormField
              labelName="Expiry Date (if applicable)"
              inputType="date"
              value={form.expiryDate}
              handleChange={(e) => handleFormFieldChange("expiryDate", e)}
              styles="flex-1"
            />
          </div>

          <FormField
            labelName="Image URL (optional)"
            placeholder="e.g. https://example.com/image.jpg"
            inputType="text"
            value={form.imageUri}
            handleChange={(e) => handleFormFieldChange("imageUri", e)}
          />

          <div className="bg-[#13131a] p-4 rounded-[10px]">
            <h4 className="font-epilogue font-semibold text-[14px] text-white">
              Material Donation Process
            </h4>
            <p className="mt-[10px] font-epilogue font-normal text-[14px] text-[#808191]">
              1. <span className="text-yellow-500">Pledged</span>: Your initial
              material donation commitment
            </p>
            <p className="mt-[5px] font-epilogue font-normal text-[14px] text-[#808191]">
              2. <span className="text-blue-500">Verified</span>: Campaign owner
              verifies and accepts the donation
            </p>
            <p className="mt-[5px] font-epilogue font-normal text-[14px] text-[#808191]">
              3. <span className="text-purple-500">In-transit</span>: Materials
              are being shipped or transferred
            </p>
            <p className="mt-[5px] font-epilogue font-normal text-[14px] text-[#808191]">
              4. <span className="text-green-500">Delivered</span>: Materials
              successfully received by campaign
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton
            btnType="submit"
            title="Pledge Material Donation"
            styles="bg-[#1dc071]"
            handleClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default DonateMaterials;
