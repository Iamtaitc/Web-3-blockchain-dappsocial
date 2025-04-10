// test/Marketplace.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let DXToken;
  let dxToken;
  let NFTMedia;
  let nftMedia;
  let Marketplace;
  let marketplace;
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
    
    // Deploy Marketplace
    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(dxToken.address, nftMedia.address, feeRecipient.address);
    await marketplace.deployed();
    
    // Mint tokens cho creator và buyer
    await dxToken.mint(creator.address, ethers.utils.parseEther("1000"));
    await dxToken.mint(buyer.address, ethers.utils.parseEther("1000"));
    
    // Approve tokens cho NFTMedia contract
    await dxToken.connect(creator).approve(nftMedia.address, ethers.utils.parseEther("100"));
    
    // Mint NFT cho creator
    await nftMedia.connect(creator).mintNFT(
      "ipfs://QmTest",
      "image",
      250 // 2.5%
    );
  });

  describe("List NFT", function () {
    it("Nên cho phép owner của NFT đăng bán", async function () {
      // Approve marketplace
      await nftMedia.connect(creator).approve(marketplace.address, 1);
      
      const price = ethers.utils.parseEther("50");
      
      await expect(
        marketplace.connect(creator).listNFT(1, price)
      ).to.emit(marketplace, "NFTListed")
       .withArgs(1, creator.address, price);
      
      // Kiểm tra thông tin listing
      const listing = await marketplace.listings(1);
      expect(listing.tokenId).to.equal(1);
      expect(listing.seller).to.equal(creator.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("Không nên cho phép non-owner đăng bán NFT", async function () {
      await expect(
        marketplace.connect(buyer).listNFT(1, ethers.utils.parseEther("50"))
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Buy NFT", function () {
    beforeEach(async function () {
      // Approve marketplace
      await nftMedia.connect(creator).approve(marketplace.address, 1);
      
      // List NFT
      await marketplace.connect(creator).listNFT(
        1,
        ethers.utils.parseEther("50")
      );
      
      // Approve tokens cho marketplace
      await dxToken.connect(buyer).approve(
        marketplace.address,
        ethers.utils.parseEther("100")
      );
    });

    it("Nên cho phép mua NFT đã đăng bán", async function () {
      await expect(
        marketplace.connect(buyer).buyNFT(1)
      ).to.emit(marketplace, "NFTSold")
       .withArgs(1, creator.address, buyer.address, ethers.utils.parseEther("50"));
      
      // Kiểm tra owner mới của NFT
      expect(await nftMedia.ownerOf(1)).to.equal(buyer.address);
      
      // Kiểm tra listing đã bị hủy
      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;
    });

    it("Nên tính phí marketplace và royalty chính xác", async function () {
      // Lấy balance ban đầu
      const creatorInitialBalance = await dxToken.balanceOf(creator.address);
      const buyerInitialBalance = await dxToken.balanceOf(buyer.address);
      const feeRecipientInitialBalance = await dxToken.balanceOf(feeRecipient.address);
      
      // Mua NFT
      await marketplace.connect(buyer).buyNFT(1);
      
      // Tính toán phí và số tiền nhận được
      const price = ethers.utils.parseEther("50");
      const marketplaceFee = price.mul(250).div(10000); // 2.5%
      const sellerAmount = price.sub(marketplaceFee);
      
      // Kiểm tra balance sau giao dịch
      expect(await dxToken.balanceOf(creator.address)).to.equal(
        creatorInitialBalance.add(sellerAmount)
      );
      
      expect(await dxToken.balanceOf(buyer.address)).to.equal(
        buyerInitialBalance.sub(price)
      );
      
      expect(await dxToken.balanceOf(feeRecipient.address)).to.equal(
        feeRecipientInitialBalance.add(marketplaceFee)
      );
    });
  });
});