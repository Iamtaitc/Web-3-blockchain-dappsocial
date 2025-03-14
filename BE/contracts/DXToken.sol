// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DXToken
 * @dev ERC20 Token for DeSo platform with minting, burning, and role-based access control.
 */
contract DXToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 5_000_000_000 * 10**18; // 5 billion tokens

    uint256 public constant PLATFORM_ALLOCATION = 300_000_000 * 10**18; // 30%
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18;     // 15%
    uint256 public constant ECOSYSTEM_FUND = 200_000_000 * 10**18;      // 20%
    uint256 public constant REWARDS_POOL = 350_000_000 * 10**18;        // 35%

    address public treasuryAddress;
    address public teamAddress;
    address public ecosystemFundAddress;
    address public rewardsPoolAddress;

    event TreasuryUpdated(address indexed oldAddress, address indexed newAddress);
    event TeamUpdated(address indexed oldAddress, address indexed newAddress);
    event EcosystemFundUpdated(address indexed oldAddress, address indexed newAddress);
    event RewardsPoolUpdated(address indexed oldAddress, address indexed newAddress);

    constructor(
        address _treasuryAddress,
        address _teamAddress,
        address _ecosystemFundAddress,
        address _rewardsPoolAddress
    ) ERC20("DeSocial Token", "DX") {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_teamAddress != address(0), "Invalid team address");
        require(_ecosystemFundAddress != address(0), "Invalid ecosystem address");
        require(_rewardsPoolAddress != address(0), "Invalid rewards address");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        


        treasuryAddress = _treasuryAddress;
        teamAddress = _teamAddress;
        ecosystemFundAddress = _ecosystemFundAddress;
        rewardsPoolAddress = _rewardsPoolAddress;

        _mint(treasuryAddress, PLATFORM_ALLOCATION);
        _mint(teamAddress, TEAM_ALLOCATION);
        _mint(ecosystemFundAddress, ECOSYSTEM_FUND);
        _mint(rewardsPoolAddress, REWARDS_POOL);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "DXToken: max supply exceeded");
        _mint(to, amount);
    }

    // Trong OZ 5.x, chúng ta sử dụng các hook khác thay vì _beforeTokenTransfer
    function _update(address from, address to, uint256 amount) internal virtual override(ERC20) {
        require(!paused(), "Token transfer while paused");
        super._update(from, to, amount);
    }

    function setTreasuryAddress(address _treasuryAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasuryAddress != address(0), "DXToken: zero address");
        emit TreasuryUpdated(treasuryAddress, _treasuryAddress);
        treasuryAddress = _treasuryAddress;
    }

    function setTeamAddress(address _teamAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_teamAddress != address(0), "DXToken: zero address");
        emit TeamUpdated(teamAddress, _teamAddress);
        teamAddress = _teamAddress;
    }

    function setEcosystemFundAddress(address _ecosystemFundAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_ecosystemFundAddress != address(0), "DXToken: zero address");
        emit EcosystemFundUpdated(ecosystemFundAddress, _ecosystemFundAddress);
        ecosystemFundAddress = _ecosystemFundAddress;
    }

    function setRewardsPoolAddress(address _rewardsPoolAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_rewardsPoolAddress != address(0), "DXToken: zero address");
        emit RewardsPoolUpdated(rewardsPoolAddress, _rewardsPoolAddress);
        rewardsPoolAddress = _rewardsPoolAddress;
    }
}