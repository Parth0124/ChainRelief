import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useStateContext } from "../context";
import { money } from "../assets";
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage } from "../utils";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign } = useStateContext();
  const [campaignType, setCampaignType] = useState("monetary");
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
    acceptsMaterialDonations: false,
  });

  const [materialForm, setMaterialForm] = useState({
    name: "",
    title: "",
    description: "",
    deadline: "",
    image: "",
    acceptsMaterialDonations: true,
    itemTypes: ["Food", "Medicine", "Clothing", "Education", "Shelter"],
    acceptedLocations: "",
    itemType: "Food",
    quantity: "",
    unit: "items",
    estimatedValue: "0",
    location: "",
    expiryDate: "",
  });

  const dateInputStyles = `
    ::-webkit-calendar-picker-indicator {
      filter: invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%);
      cursor: pointer;
    }
    
    /* Reset any custom colors to match other input placeholders */
    input[type="date"].date-input::-webkit-datetime-edit {
      color: inherit;
      opacity: 0.6;
    }
    
    input[type="date"].date-input::-webkit-datetime-edit-fields-wrapper,
    input[type="date"].date-input::-webkit-datetime-edit-text,
    input[type="date"].date-input::-webkit-datetime-edit-month-field,
    input[type="date"].date-input::-webkit-datetime-edit-day-field,
    input[type="date"].date-input::-webkit-datetime-edit-year-field {
      color: inherit;
    }
  `;

  const handleFormFieldChange = (fieldName, e) => {
    if (fieldName === "acceptsMaterialDonations") {
      setForm({ ...form, [fieldName]: e.target.checked });
    } else {
      setForm({ ...form, [fieldName]: e.target.value });
    }
  };

  const handleMaterialFormFieldChange = (fieldName, e) => {
    if (fieldName === "itemTypes") {
      const itemTypes = [...materialForm.itemTypes];
      const value = e.target.value;

      if (e.target.checked) {
        if (!itemTypes.includes(value)) {
          itemTypes.push(value);
        }
      } else {
        const index = itemTypes.indexOf(value);
        if (index > -1) {
          itemTypes.splice(index, 1);
        }
      }
      setMaterialForm({ ...materialForm, itemTypes });
    } else {
      setMaterialForm({ ...materialForm, [fieldName]: e.target.value });
    }
  };

  const handleCampaignTypeChange = (e) => {
    setCampaignType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentForm = campaignType === "monetary" ? form : materialForm;

    checkIfImage(currentForm.image, async (exists) => {
      if (exists) {
        setIsLoading(true);

        if (campaignType === "monetary") {
          await createCampaign({
            ...form,
            target: ethers.utils.parseUnits(form.target, 18),
          });
        } else {
          const expiryTimestamp = materialForm.expiryDate
            ? new Date(materialForm.expiryDate).getTime()
            : 0;

          await createCampaign({
            ...materialForm,
            expiryDate: expiryTimestamp,
            target: ethers.utils.parseUnits(
              materialForm.estimatedValue || "0",
              18
            ),
          });
        }

        setIsLoading(false);
        navigate("/");
      } else {
        alert("Provide valid image URL");
        if (campaignType === "monetary") {
          setForm({ ...form, image: "" });
        } else {
          setMaterialForm({ ...materialForm, image: "" });
        }
      }
    });
  };

  const renderMonetaryForm = () => (
    <>
      <div className="flex flex-wrap gap-[40px]">
        <FormField
          labelName="Your Name *"
          placeholder="John Doe"
          inputType="text"
          value={form.name}
          handleChange={(e) => handleFormFieldChange("name", e)}
        />
        <FormField
          labelName="Campaign Title *"
          placeholder="Write a title"
          inputType="text"
          value={form.title}
          handleChange={(e) => handleFormFieldChange("title", e)}
        />
      </div>
      <FormField
        labelName="Story *"
        placeholder="Write your story"
        isTextArea
        value={form.description}
        handleChange={(e) => handleFormFieldChange("description", e)}
      />
      <div className="flex flex-wrap gap-[40px]">
        <FormField
          labelName="Goal *"
          placeholder="ETH 0.50"
          inputType="text"
          value={form.target}
          handleChange={(e) => handleFormFieldChange("target", e)}
        />
        <div className="date-input-container">
          <style>{dateInputStyles}</style>
          <FormField
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange("deadline", e)}
            additionalClass="date-input"
          />
        </div>
      </div>
      <FormField
        labelName="Campaign image *"
        placeholder="Place image URL of your campaign"
        inputType="url"
        value={form.image}
        handleChange={(e) => handleFormFieldChange("image", e)}
      />
    </>
  );

  const renderMaterialForm = () => (
    <>
      <div className="flex flex-wrap gap-[40px]">
        <FormField
          labelName="Your Name *"
          placeholder="John Doe"
          inputType="text"
          value={materialForm.name}
          handleChange={(e) => handleMaterialFormFieldChange("name", e)}
        />
        <FormField
          labelName="Campaign Title *"
          placeholder="Write a title"
          inputType="text"
          value={materialForm.title}
          handleChange={(e) => handleMaterialFormFieldChange("title", e)}
        />
      </div>
      <FormField
        labelName="Story *"
        placeholder="Write your story about needed material donations"
        isTextArea
        value={materialForm.description}
        handleChange={(e) => handleMaterialFormFieldChange("description", e)}
      />
      <div className="w-full">
        <label className="font-epilogue font-medium text-[14px] leading-[22px] text-white mb-[10px] block">
          Item Type *
        </label>
        <select
          value={materialForm.itemType}
          onChange={(e) => handleMaterialFormFieldChange("itemType", e)}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px] w-full"
        >
          <option value="Food" className="bg-[#1c1c24]">
            Food
          </option>
          <option value="Medicine" className="bg-[#1c1c24]">
            Medicine
          </option>
          <option value="Clothing" className="bg-[#1c1c24]">
            Clothing
          </option>
          <option value="Education" className="bg-[#1c1c24]">
            Education
          </option>
          <option value="Shelter" className="bg-[#1c1c24]">
            Shelter
          </option>
          <option value="Other" className="bg-[#1c1c24]">
            Other
          </option>
        </select>
      </div>

      <div className="flex flex-wrap gap-[40px]">
        <FormField
          labelName="Quantity *"
          placeholder="10"
          inputType="number"
          value={materialForm.quantity}
          handleChange={(e) => handleMaterialFormFieldChange("quantity", e)}
        />
        <FormField
          labelName="Unit *"
          placeholder="items, kg, boxes, etc."
          inputType="text"
          value={materialForm.unit}
          handleChange={(e) => handleMaterialFormFieldChange("unit", e)}
        />
      </div>

      <div className="flex flex-wrap gap-[40px]">
        <FormField
          labelName="Estimated Value (ETH)"
          placeholder="0.01"
          inputType="number"
          step="0.001"
          value={materialForm.estimatedValue}
          handleChange={(e) =>
            handleMaterialFormFieldChange("estimatedValue", e)
          }
        />
      </div>

      <FormField
        labelName="Pickup Location *"
        placeholder="Where can the donation be collected?"
        inputType="text"
        value={materialForm.location}
        handleChange={(e) => handleMaterialFormFieldChange("location", e)}
      />

      <div className="date-input-container">
        <style>{dateInputStyles}</style>
        <FormField
          labelName="Campaign End Date *"
          placeholder="End Date"
          inputType="date"
          value={materialForm.deadline}
          handleChange={(e) => handleMaterialFormFieldChange("deadline", e)}
          additionalClass="date-input"
        />
      </div>

      <FormField
        labelName="Campaign image *"
        placeholder="Place image URL of your campaign"
        inputType="url"
        value={materialForm.image}
        handleChange={(e) => handleMaterialFormFieldChange("image", e)}
      />
      <div className="flex flex-col gap-[15px]">
        <label className="font-epilogue font-medium text-[14px] leading-[22px] text-white">
          What other types of donations are you accepting? *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            "Food",
            "Medicine",
            "Clothing",
            "Education",
            "Shelter",
            "Other",
          ].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`item-${type}`}
                value={type}
                className="w-4 h-4 bg-transparent border-[1px] border-[#3a3a43]"
                checked={materialForm.itemTypes.includes(type)}
                onChange={(e) => handleMaterialFormFieldChange("itemTypes", e)}
              />
              <label
                htmlFor={`item-${type}`}
                className="font-epilogue font-medium text-[14px] leading-[22px] text-white"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>
      <FormField
        labelName="Accepted Delivery Locations (incase anyone wants to deliver donations through post,amazon,etc)"
        placeholder="e.g., New York City, Boston, Remote"
        inputType="text"
        value={materialForm.acceptedLocations}
        handleChange={(e) =>
          handleMaterialFormFieldChange("acceptedLocations", e)
        }
      />
    </>
  );

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Start a Campaign
        </h1>
      </div>
      <div className="w-full mt-[65px] mb-[30px]">
        <label className="font-epilogue font-medium text-[14px] leading-[22px] text-white mb-[10px] block">
          Campaign Type *
        </label>
        <select
          value={campaignType}
          onChange={handleCampaignTypeChange}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px] w-full"
        >
          <option value="monetary" className="bg-[#1c1c24]">
            Monetary
          </option>
          <option value="material" className="bg-[#1c1c24]">
            Material
          </option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[30px]">
        {campaignType === "monetary"
          ? renderMonetaryForm()
          : renderMaterialForm()}

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton
            btnType="submit"
            title={`Submit new ${campaignType} campaign`}
            styles="bg-[#1dc071]"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
