// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./DXToken.sol";
import "./NFTMedia.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    DXToken public dxToken;
    NFTMedia public nftMedia;

    using SafeERC20 for DXToken;
    
    // Cấu trúc Listing
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }
    
    // Fee
    uint256 public marketplaceFee = 250; // 2.5%
    address public feeRecipient;
    
    // Mapping
    mapping(uint256 => Listing) public listings;
    
    // Events
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTUnlisted(uint256 indexed tokenId, address indexed seller);
    
    constructor(address _dxToken, address _nftMedia, address _feeRecipient) Ownable(msg.sender) {
        dxToken = DXToken(_dxToken);
        nftMedia = NFTMedia(_nftMedia);
        feeRecipient = _feeRecipient;
    }
    
    function listNFT(uint256 _tokenId, uint256 _price) external nonReentrant {
        require(nftMedia.ownerOf(_tokenId) == msg.sender, "Not owner");
        require(_price > 0, "Price must be > 0");
        require(nftMedia.getApproved(_tokenId) == address(this), "Not approved");
        
        listings[_tokenId] = Listing({
            tokenId: _tokenId,
            seller: msg.sender,
            price: _price,
            active: true
        });
        
        emit NFTListed(_tokenId, msg.sender, _price);
    }
    
    function buyNFT(uint256 _tokenId) external nonReentrant {
        Listing memory listing = listings[_tokenId];
        require(listing.active, "Not for sale");
        
        // Tính phí & royalties
        uint256 marketFee = (listing.price * marketplaceFee) / 10000;
        
        (address creator, uint256 royaltyPercent) = nftMedia.getRoyaltyInfo(_tokenId);
        uint256 royaltyFee = 0;
        
        if (creator != listing.seller) {
            royaltyFee = (listing.price * royaltyPercent) / 10000;
        }
        
        uint256 sellerAmount = listing.price - marketFee - royaltyFee;
        
        // Chuyển token
        dxToken.safeTransferFrom(msg.sender, listing.seller, sellerAmount);
        
        if (marketFee > 0) {
            dxToken.safeTransferFrom(msg.sender, feeRecipient, marketFee);
        }
        
        if (royaltyFee > 0) {
            dxToken.safeTransferFrom(msg.sender, creator, royaltyFee);
        }
        
        // Chuyển NFT
        nftMedia.safeTransferFrom(listing.seller, msg.sender, _tokenId);
        
        // Cập nhật trạng thái
        listings[_tokenId].active = false;
        
        emit NFTSold(_tokenId, listing.seller, msg.sender, listing.price);
    }
    
    function unlistNFT(uint256 _tokenId) external {
        require(listings[_tokenId].seller == msg.sender, "Not seller");
        require(listings[_tokenId].active, "Not active");
        
        listings[_tokenId].active = false;
        
        emit NFTUnlisted(_tokenId, msg.sender);
    }
    
    function setMarketplaceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Max fee 10%");
        marketplaceFee = _fee;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
}