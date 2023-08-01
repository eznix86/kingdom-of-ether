// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

abstract contract ReentrancyGuard {
    bool internal locked;

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }
}

contract KingdomOfEther is ReentrancyGuard {
    address public monarch;
    address public owner;
    uint256 public claimPrice = 0.0001 ether;
    uint256 public commissionPercentage = 1;
    uint256 public nextClaimPriceMultiplier = 150; // 150% (1.5x)
    uint256 public accumulatedFees;
    bool public paused;

    mapping(address => bytes32) public monarchNames;
    mapping(address => uint256) public reignStartTimes;

    event NewMonarch(
        address indexed previousMonarch,
        bytes32 previousMonarchName,
        address indexed newMonarch,
        bytes32 newMonarchName,
        uint256 newClaimPrice,
        uint256 reignStartTime
    );

    event FeesSwept(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
        monarch = msg.sender;
        monarchNames[monarch] = "[Vacant]";
        reignStartTimes[monarch] = block.timestamp;
    }

    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier onlyMonarch() {
        require(
            msg.sender == monarch,
            "Only the current Monarch can call this function"
        );
        _;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    modifier validName(bytes32 name) {
        require(name.length > 0, "Name cannot be empty");
        require(name.length <= 50, "Name exceeds maximum length");
        _;
    }

    function pauseContract() external onlyOwner {
        paused = true;
    }

    function unpauseContract() external onlyOwner {
        paused = false;
    }

    function _calculateCommission(
        uint256 amount
    ) private view returns (uint256) {
        return (amount * commissionPercentage) / 100;
    }

    function _transferEther(address recipient, uint256 amount) private {
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function _updateMonarchState(
        address newMonarch,
        bytes32 name,
        uint256 newClaimPrice
    ) private {
        address previousMonarch = monarch;
        bytes32 previousMonarchName = monarchNames[monarch];

        _transferEther(
            previousMonarch,
            claimPrice - _calculateCommission(claimPrice)
        );
        accumulatedFees += _calculateCommission(claimPrice);

        emit NewMonarch(
            previousMonarch,
            previousMonarchName,
            newMonarch,
            name,
            newClaimPrice,
            block.timestamp
        );

        monarch = newMonarch;
        claimPrice = newClaimPrice;
        monarchNames[monarch] = name;
        reignStartTimes[monarch] = block.timestamp;
    }

    function becomeMonarch(
        bytes32 name
    ) external payable noReentrant notPaused validName(name) {
        require(
            msg.value == claimPrice,
            "Please send exactly the claim price to become Monarch"
        );

        uint256 newClaimPrice = (claimPrice * nextClaimPriceMultiplier) / 100;

        _updateMonarchState(msg.sender, name, newClaimPrice);
    }

    function sweepFees() external onlyOwner {
        require(accumulatedFees > 0, "No accumulated fees to sweep");
        uint256 amountToSweep = accumulatedFees;
        accumulatedFees = 0;
        _transferEther(owner, amountToSweep);
        emit FeesSwept(owner, amountToSweep);
    }

    function renounceMonarchy() external noReentrant onlyMonarch {
        emit NewMonarch(
            monarch,
            monarchNames[monarch],
            owner,
            "[Vacant]",
            0,
            block.timestamp
        );

        monarch = owner;
        claimPrice = 0.0001 ether;
        monarchNames[monarch] = "[Vacant]";
        reignStartTimes[monarch] = block.timestamp;
    }

    function getCurrentClaimPrice() external view returns (uint256) {
        return claimPrice;
    }

    function getCurrentMonarchName() external view returns (bytes32) {
        return monarchNames[monarch];
    }

    function getCurrentReignDuration() external view returns (uint256) {
        return block.timestamp - reignStartTimes[monarch];
    }

    function getAccumulatedFees() external view onlyOwner returns (uint256) {
        return accumulatedFees;
    }
}
