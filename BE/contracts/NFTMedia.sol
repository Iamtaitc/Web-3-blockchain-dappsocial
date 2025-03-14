// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMedia is ERC721URIStorage, Ownable {
    // NFT ID counter
    uint256 private _tokenIdCounter;
    
    // Cấu trúc NFT
    struct NFT {
        uint256 tokenId;
        address creator;
        string mediaType; // image, video, audio
        uint256 royaltyPercent; // phần trăm * 100 (250 = 2.5%)
    }
    
    // Mapping với tokenId
    mapping(uint256 => NFT) public nfts;
    
    // Events
    event NFTCreated(uint256 indexed tokenId, address indexed creator, string tokenURI);
    
    constructor() ERC721("DeSo NFT", "DNFT") Ownable(msg.sender) {}
    
    function mintNFT(
        string memory _tokenURI, 
        string memory _mediaType,
        uint256 _royaltyPercent
    ) external returns (uint256) {
        require(_royaltyPercent <= 1000, "Max royalty 10%");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        nfts[tokenId] = NFT({
            tokenId: tokenId,
            creator: msg.sender,
            mediaType: _mediaType,
            royaltyPercent: _royaltyPercent
        });
        
        emit NFTCreated(tokenId, msg.sender, _tokenURI);
        
        return tokenId;
    }
    
    function getRoyaltyInfo(uint256 _tokenId) external view returns (address, uint256) {
        NFT memory nft = nfts[_tokenId];
        return (nft.creator, nft.royaltyPercent);
    }
}

