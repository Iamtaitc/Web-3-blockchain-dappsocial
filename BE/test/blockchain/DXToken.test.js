const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DXToken", function () {
  let dxToken;
  let owner, treasury, team, ecosystemFund, rewardsPool, user1, user2;
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Helper function cho ethers v6
  function parseEther(amount) {
    return ethers.parseUnits(amount.toString(), 18);
  }

  before(async function () {
    [owner, treasury, team, ecosystemFund, rewardsPool, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const DXToken = await ethers.getContractFactory("DXToken");
    dxToken = await DXToken.deploy(
      treasury.address,
      team.address,
      ecosystemFund.address,
      rewardsPool.address
    );
    // Đối với ethers v6
    await dxToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await dxToken.name()).to.equal("DeSocial Token");
      expect(await dxToken.symbol()).to.equal("DX");
    });

    it("Should assign the total supply according to allocations", async function () {
      const platformAllocation = parseEther("300000000");
      const teamAllocation = parseEther("150000000");
      const ecosystemAllocation = parseEther("200000000");
      const rewardsAllocation = parseEther("350000000");

      const total = platformAllocation + teamAllocation + ecosystemAllocation + rewardsAllocation;
      const totalSupply = await dxToken.totalSupply();
      
      // Sử dụng closeTo thay vì equal cho số BigInt
      expect(totalSupply).to.equal(total);
    });

    it("Should assign initial allocations correctly", async function () {
      expect(await dxToken.balanceOf(treasury.address)).to.equal(parseEther("300000000"));
      expect(await dxToken.balanceOf(team.address)).to.equal(parseEther("150000000"));
      expect(await dxToken.balanceOf(ecosystemFund.address)).to.equal(parseEther("200000000"));
      expect(await dxToken.balanceOf(rewardsPool.address)).to.equal(parseEther("350000000"));
    });

    it("Should set the correct roles", async function () {
      expect(await dxToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await dxToken.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
      expect(await dxToken.hasRole(PAUSER_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Token transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer tokens from treasury to user1
      await dxToken.connect(treasury).transfer(user1.address, parseEther("1000"));
      
      expect(await dxToken.balanceOf(user1.address)).to.equal(parseEther("1000"));
      
      // Transfer tokens from user1 to user2
      await dxToken.connect(user1).transfer(user2.address, parseEther("500"));
      
      expect(await dxToken.balanceOf(user1.address)).to.equal(parseEther("500"));
      expect(await dxToken.balanceOf(user2.address)).to.equal(parseEther("500"));
    });

    it("Should fail when transferring while paused", async function () {
      // Pause the contract
      await dxToken.connect(owner).pause();
      
      // Try to transfer tokens
      await expect(
        dxToken.connect(treasury).transfer(user1.address, parseEther("1000"))
      ).to.be.revertedWith("Token transfer while paused");
      
      // Unpause the contract
      await dxToken.connect(owner).unpause();
      
      // Should work now
      await dxToken.connect(treasury).transfer(user1.address, parseEther("1000"));
      expect(await dxToken.balanceOf(user1.address)).to.equal(parseEther("1000"));
    });
  });

  describe("Role-based permissions", function () {
    it("Should allow minting by MINTER_ROLE", async function () {
      await dxToken.connect(owner).mint(user1.address, parseEther("1000"));
      expect(await dxToken.balanceOf(user1.address)).to.equal(parseEther("1000"));
    });

    it("Should not allow minting by non-MINTER_ROLE", async function () {
      await expect(
        dxToken.connect(user1).mint(user1.address, parseEther("1000"))
      ).to.be.reverted;
    });

    it("Should enforce MAX_SUPPLY limit", async function () {
      const maxSupply = parseEther("5000000000");
      const currentSupply = await dxToken.totalSupply();
      const remainingSupply = maxSupply - currentSupply;
      
      // Mint up to the max supply
      await dxToken.connect(owner).mint(user1.address, remainingSupply);
      
      // Attempt to mint more
      await expect(
        dxToken.connect(owner).mint(user1.address, 1)
      ).to.be.revertedWith("DXToken: max supply exceeded");
    });
  });

  describe("Pause functionality", function () {
    it("Should allow pausing by PAUSER_ROLE", async function () {
      await dxToken.connect(owner).pause();
      expect(await dxToken.paused()).to.equal(true);
    });

    it("Should allow unpausing by PAUSER_ROLE", async function () {
      await dxToken.connect(owner).pause();
      await dxToken.connect(owner).unpause();
      expect(await dxToken.paused()).to.equal(false);
    });

    it("Should not allow pausing by non-PAUSER_ROLE", async function () {
      await expect(dxToken.connect(user1).pause()).to.be.reverted;
    });
  });

  describe("Address management", function () {
    it("Should update treasury address", async function () {
      await dxToken.connect(owner).setTreasuryAddress(user1.address);
      expect(await dxToken.treasuryAddress()).to.equal(user1.address);
    });

    it("Should update team address", async function () {
      await dxToken.connect(owner).setTeamAddress(user1.address);
      expect(await dxToken.teamAddress()).to.equal(user1.address);
    });

    it("Should update ecosystem fund address", async function () {
      await dxToken.connect(owner).setEcosystemFundAddress(user1.address);
      expect(await dxToken.ecosystemFundAddress()).to.equal(user1.address);
    });

    it("Should update rewards pool address", async function () {
      await dxToken.connect(owner).setRewardsPoolAddress(user1.address);
      expect(await dxToken.rewardsPoolAddress()).to.equal(user1.address);
    });

    it("Should not allow zero address updates", async function () {
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      
      await expect(
        dxToken.connect(owner).setTreasuryAddress(zeroAddress)
      ).to.be.revertedWith("DXToken: zero address");
      
      await expect(
        dxToken.connect(owner).setTeamAddress(zeroAddress)
      ).to.be.revertedWith("DXToken: zero address");
      
      await expect(
        dxToken.connect(owner).setEcosystemFundAddress(zeroAddress)
      ).to.be.revertedWith("DXToken: zero address");
      
      await expect(
        dxToken.connect(owner).setRewardsPoolAddress(zeroAddress)
      ).to.be.revertedWith("DXToken: zero address");
    });

    it("Should emit events when addresses are updated", async function () {
      await expect(dxToken.connect(owner).setTreasuryAddress(user1.address))
        .to.emit(dxToken, "TreasuryUpdated")
        .withArgs(treasury.address, user1.address);
      
      await expect(dxToken.connect(owner).setTeamAddress(user1.address))
        .to.emit(dxToken, "TeamUpdated")
        .withArgs(team.address, user1.address);
      
      await expect(dxToken.connect(owner).setEcosystemFundAddress(user1.address))
        .to.emit(dxToken, "EcosystemFundUpdated")
        .withArgs(ecosystemFund.address, user1.address);
      
      await expect(dxToken.connect(owner).setRewardsPoolAddress(user1.address))
        .to.emit(dxToken, "RewardsPoolUpdated")
        .withArgs(rewardsPool.address, user1.address);
    });
  });

  describe("Burning functionality", function () {
    it("Should allow token burning", async function () {
      await dxToken.connect(treasury).burn(parseEther("1000"));
      
      const expectedBalance = parseEther("300000000") - parseEther("1000");
      expect(await dxToken.balanceOf(treasury.address)).to.equal(expectedBalance);
      
      const expectedTotalSupply = parseEther("1000000000") - parseEther("1000");
      expect(await dxToken.totalSupply()).to.equal(expectedTotalSupply);
    });

    it("Should allow burning from approved addresses", async function () {
      await dxToken.connect(treasury).approve(owner.address, parseEther("1000"));
      await dxToken.connect(owner).burnFrom(treasury.address, parseEther("1000"));
      
      const expectedBalance = parseEther("300000000") - parseEther("1000");
      expect(await dxToken.balanceOf(treasury.address)).to.equal(expectedBalance);
    });
  });
});