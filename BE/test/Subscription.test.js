// test/Subscription.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Subscription", function () {
  let DXToken;
  let dxToken;
  let Subscription;
  let subscription;
  let owner;
  let user;
  let feeRecipient;

  beforeEach(async function () {
    [owner, user, feeRecipient] = await ethers.getSigners();
    
    // Deploy DXToken
    DXToken = await ethers.getContractFactory("DXToken");
    dxToken = await DXToken.deploy();
    await dxToken.deployed();
    
    // Deploy Subscription
    Subscription = await ethers.getContractFactory("Subscription");
    subscription = await Subscription.deploy(dxToken.address, feeRecipient.address);
    await subscription.deployed();
    
    // Add subscription contract as minter
    await dxToken.addMinter(subscription.address);
    
    // Mint tokens cho user
    await dxToken.mint(user.address, ethers.utils.parseEther("1000"));
    
    // Approve tokens cho subscription contract
    await dxToken.connect(user).approve(
      subscription.address,
      ethers.utils.parseEther("1000")
    );
  });

  describe("Mua subscription", function () {
    it("Nên cho phép mua subscription mới", async function () {
      const level = 2; // x2
      const months = 1;
      
      await expect(
        subscription.connect(user).purchaseSubscription(level, months)
      ).to.emit(subscription, "SubscriptionPurchased")
       .withArgs(user.address, level, months, anyValue);
      
      // Kiểm tra thông tin subscription
      const [subLevel, expiration] = await subscription.getSubscription(user.address);
      expect(subLevel).to.equal(level);
      
      // Kiểm tra expiration date (thời gian hiện tại + 30 ngày)
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      expect(expiration).to.be.closeTo(
        ethers.BigNumber.from(Math.floor(Date.now() / 1000) + thirtyDaysInSeconds),
        60 // Cho phép sai số 60 giây
      );
    });

    it("Nên tính phí chính xác cho mỗi level", async function () {
      // Lấy balance ban đầu
      const userInitialBalance = await dxToken.balanceOf(user.address);
      const feeRecipientInitialBalance = await dxToken.balanceOf(feeRecipient.address);
      
      // Mua subscription level 5 (PRO)
      await subscription.connect(user).purchaseSubscription(5, 1);
      
      // Lấy phí level 5
      const feePro = await subscription.feePro();
      
      // Kiểm tra balance sau giao dịch
      expect(await dxToken.balanceOf(user.address)).to.equal(
        userInitialBalance.sub(feePro)
      );
      
      expect(await dxToken.balanceOf(feeRecipient.address)).to.equal(
        feeRecipientInitialBalance.add(feePro)
      );
    });
  });

  describe("Multiplier và expiry", function () {
    it("Nên trả về multiplier chính xác dựa trên subscription", async function () {
      // Standard level (1)
      expect(await subscription.getMultiplier(user.address)).to.equal(1);
      
      // Mua level 2 (PLUS)
      await subscription.connect(user).purchaseSubscription(2, 1);
      expect(await subscription.getMultiplier(user.address)).to.equal(2);
      
      // Mua level 10 (ELITE)
      await subscription.connect(user).purchaseSubscription(10, 1);
      expect(await subscription.getMultiplier(user.address)).to.equal(10);
    });

    it("Nên reset về level standard khi subscription hết hạn", async function () {
      // Mua subscription
      await subscription.connect(user).purchaseSubscription(5, 1);
      
      // Time travel to after expiration (31 days)
      await time.increase(31 * 24 * 60 * 60);
      
      // Kiểm tra level đã reset về standard
      expect(await subscription.getMultiplier(user.address)).to.equal(1);
      
      const [level, expiration] = await subscription.getSubscription(user.address);
      expect(level).to.equal(1);
      expect(expiration).to.equal(0);
    });
  });
});

// Helper function for matching any value
function anyValue() {
  return true;
}