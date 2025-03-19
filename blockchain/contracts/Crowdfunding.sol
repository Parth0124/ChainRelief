// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

contract CrowdFunding {
    // Existing Campaign struct for monetary donations
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        // New fields to indicate if campaign accepts material donations
        bool acceptsMaterialDonations;
        uint256[] materialDonationIds;
    }

    // New struct for material donations
    struct MaterialDonation {
        uint256 campaignId;
        address donor;
        string itemType; // "food", "medicine", "clothing", etc.
        string description;
        uint256 quantity;
        string unit; // "kg", "items", "boxes", etc.
        uint256 estimatedValue;
        string location; // Pickup location
        uint256 expiryDate; // Relevant for food and medicine
        // Supply chain tracking
        uint256 timestamp;
        string status; // "pledged", "verified", "in-transit", "delivered"
        address[] verifiers;
        string[] verificationNotes;
        uint256[] verificationTimestamps;
        string trackingCode;
        string imageUri; // Optional image of the donation
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    // New mapping for material donations
    mapping(uint256 => MaterialDonation) public materialDonations;
    uint256 public numberOfMaterialDonations = 0;

    // Events for supply chain tracking
    event MaterialDonationPledged(uint256 donationId, uint256 campaignId, address donor);
    event MaterialDonationStatusUpdated(uint256 donationId, string newStatus);
    event MaterialDonationVerified(uint256 donationId, address verifier, string notes);
    event MaterialDonationDelivered(uint256 donationId, uint256 campaignId);

    // Existing functions
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image,
        bool _acceptsMaterialDonations
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];
        require(_deadline > block.timestamp, "The deadline should be a date in the future!");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.acceptsMaterialDonations = _acceptsMaterialDonations;

        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;
        Campaign storage campaign = campaigns[_id];
        
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
        
        (bool sent,) = payable(campaign.owner).call{value: amount}("");
        if(sent) {
            campaign.amountCollected = campaign.amountCollected + amount;
        }
    }

    function getDonors(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for (uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }
        return allCampaigns;
    }

    // New functions for material donations and supply chain tracking

    function pledgeMaterialDonation(
        uint256 _campaignId,
        string memory _itemType,
        string memory _description,
        uint256 _quantity,
        string memory _unit,
        uint256 _estimatedValue,
        string memory _location,
        uint256 _expiryDate,
        string memory _imageUri
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.acceptsMaterialDonations, "This campaign does not accept material donations");
        require(campaign.deadline > block.timestamp, "Campaign deadline has passed");

        MaterialDonation storage donation = materialDonations[numberOfMaterialDonations];
        donation.campaignId = _campaignId;
        donation.donor = msg.sender;
        donation.itemType = _itemType;
        donation.description = _description;
        donation.quantity = _quantity;
        donation.unit = _unit;
        donation.estimatedValue = _estimatedValue;
        donation.location = _location;
        donation.expiryDate = _expiryDate;
        donation.timestamp = block.timestamp;
        donation.status = "pledged";
        donation.imageUri = _imageUri;
        
        // Generate a unique tracking code
        donation.trackingCode = generateTrackingCode(_campaignId, numberOfMaterialDonations);
        
        // Add donation ID to campaign
        campaign.materialDonationIds.push(numberOfMaterialDonations);
        
        emit MaterialDonationPledged(numberOfMaterialDonations, _campaignId, msg.sender);
        
        numberOfMaterialDonations++;
        return numberOfMaterialDonations - 1;
    }

    function updateMaterialDonationStatus(
        uint256 _donationId, 
        string memory _newStatus
    ) public {
        MaterialDonation storage donation = materialDonations[_donationId];
        Campaign storage campaign = campaigns[donation.campaignId];
        
        // Only campaign owner or donation donor can update status
        require(
            msg.sender == campaign.owner || msg.sender == donation.donor,
            "Only campaign owner or donor can update status"
        );
        
        donation.status = _newStatus;
        emit MaterialDonationStatusUpdated(_donationId, _newStatus);
    }

    function verifyMaterialDonation(
        uint256 _donationId,
        string memory _notes
    ) public {
        MaterialDonation storage donation = materialDonations[_donationId];
        Campaign storage campaign = campaigns[donation.campaignId];
        
        // Only campaign owner can verify donations
        require(msg.sender == campaign.owner, "Only campaign owner can verify donations");
        
        donation.verifiers.push(msg.sender);
        donation.verificationNotes.push(_notes);
        donation.verificationTimestamps.push(block.timestamp);
        donation.status = "verified";
        
        emit MaterialDonationVerified(_donationId, msg.sender, _notes);
    }

    function markMaterialDonationDelivered(uint256 _donationId) public {
        MaterialDonation storage donation = materialDonations[_donationId];
        Campaign storage campaign = campaigns[donation.campaignId];
        
        // Only campaign owner can mark as delivered
        require(msg.sender == campaign.owner, "Only campaign owner can mark donation as delivered");
        
        donation.status = "delivered";
        
        emit MaterialDonationDelivered(_donationId, donation.campaignId);
    }

    function getMaterialDonation(uint256 _donationId) public view returns (MaterialDonation memory) {
        return materialDonations[_donationId];
    }

    function getCampaignMaterialDonations(uint256 _campaignId) public view returns (MaterialDonation[] memory) {
        Campaign storage campaign = campaigns[_campaignId];
        MaterialDonation[] memory donations = new MaterialDonation[](campaign.materialDonationIds.length);
        
        for (uint i = 0; i < campaign.materialDonationIds.length; i++) {
            donations[i] = materialDonations[campaign.materialDonationIds[i]];
        }
        
        return donations;
    }

    // Helper function to generate unique tracking codes
    function generateTrackingCode(uint256 _campaignId, uint256 _donationId) internal pure returns (string memory) {
        return string(abi.encodePacked("MAT", uint2str(_campaignId), "-", uint2str(_donationId)));
    }
    
    // Helper function to convert uint to string
    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}