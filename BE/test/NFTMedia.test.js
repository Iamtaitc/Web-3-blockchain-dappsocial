const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMedia", function () {
  let DXToken;
  let dxToken;
  let NFTMedia;
  let nftMedia;
  let owner;
  let creator;
  let buyer;
  let feeRecipient;

  beforeEach(async function () {
    [owner, creator, buyer, feeRecipient] = await ethers.getSigners();
    
    // Deploy DXToken
    DXToken = await ethers.getContractFactory("DXToken");
    dxToken = await DXToken.deploy();
    await dxToken.deployed();
    
    // Deploy NFTMedia
    NFTMedia = await ethers.getContractFactory("NFTMedia");
    nftMedia = await NFTMedia.deploy(dxToken.address, feeRecipient.address);
    await nftMedia.deployed();
    
    // Mint tokens cho creator
    await dxToken.mint(creator.address, ethers.utils.parseEther("1000"));
    
    // Approve tokens cho NFTMedia contract
    await dxToken.connect(creator).approve(nftMedia.address, ethers.utils.parseEther("1000"));
  });

  describe("Mint NFT", function () {
    it("Nên cho phép mint NFT mới", async function () {
      const tokenURI = "ipfs://QmTest";
      const mediaType = "image";
      const royaltyPercent = 250; // 2.5%
      
      await expect(
        nftMedia.connect(creator).mintNFT(tokenURI, mediaType, royaltyPercent)
      ).to.emit(nftMedia, "NFTCreated")
       .withArgs(1, creator.address, tokenURI);
      
      // Kiểm tra owner của NFT
      expect(await nftMedia.ownerOf(1)).to.equal(creator.address);
      
      // Kiểm tra thông tin NFT
      const nft = await nftMedia.nfts(1);
      expect(nft.creator).to.equal(creator.address);
      expect(nft.mediaType).to.equal(mediaType);
      expect(nft.royaltyPercent).to.equal(royaltyPercent);
    });

    it("Không nên cho phép royalty vượt quá 10%", async function () {
      const tokenURI = "ipfs://QmTest";
      const mediaType = "image";
      const invalidRoyalty = 1001; // 10.01%
      
      await expect(
        nftMedia.connect(creator).mintNFT(tokenURI, mediaType, invalidRoyalty)
      ).to.be.revertedWith("Max royalty 10%");
    });
  });

  describe("Royalty info", function () {
    beforeEach(async function () {
      // Mint NFT
      await nftMedia.connect(creator).mintNFT(
        "ipfs://QmTest",
        "image",
        250 // 2.5%
      );
    });

    it("Nên trả về thông tin royalty chính xác", async function () {
      const [royaltyReceiver, royaltyAmount] = await nftMedia.getRoyaltyInfo(1);
      
      expect(royaltyReceiver).to.equal(creator.address);
      expect(royaltyAmount).to.equal(250);
    });
  });
});