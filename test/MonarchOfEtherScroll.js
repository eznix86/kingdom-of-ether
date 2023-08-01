const { ethers } = require("hardhat");
const { expect } = require("chai");

function bytes32(text) {
  let result = ethers.toUtf8Bytes(text);
  if (result.length > 32) {
    throw new Error("String too long");
  }
  result = ethers.hexlify(result);
  while (result.length < 66) {
    result += "0";
  }
  if (result.length !== 66) {
    throw new Error("invalid web3 implicit bytes32");
  }
  return result;
}

describe("KingdomOfEther", function () {
  let KingdomOfEther;
  let contract;
  let owner;
  let user1;
  let user2;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    KingdomOfEther = await ethers.getContractFactory("KingdomOfEther");
    contract = await KingdomOfEther.deploy();
  });

  it("should set the owner as the initial monarch", async () => {
    expect(await contract.monarch()).to.equal(owner.address);
    expect(await contract.monarchNames(owner.address)).to.equal(
      bytes32("[Vacant]")
    );
  });

  it("should allow the owner to pause and unpause the contract", async () => {
    await contract.pauseContract();
    expect(await contract.paused()).to.be.true;

    await contract.unpauseContract();
    expect(await contract.paused()).to.be.false;
  });

  it("should allow a user to become the new monarch", async () => {
    const claimPrice = await contract.claimPrice();
    const newClaimPrice = (claimPrice * 150n) / 100n;

    await contract.connect(user1).becomeMonarch(bytes32("Monarch1"), {
      value: claimPrice,
    });

    expect(await contract.monarch()).to.equal(user1.address);
    expect(await contract.monarchNames(user1.address)).to.equal(
      bytes32("Monarch1")
    );
    expect(await contract.claimPrice()).to.equal(newClaimPrice);
  });

  it("should allow the current monarch to renounce monarchy", async () => {
    const claimPrice = await contract.claimPrice();

    await contract
      .connect(user1)
      .becomeMonarch(bytes32("Monarch1"), { value: claimPrice });

    await contract.connect(user1).renounceMonarchy();

    expect(await contract.monarch()).to.equal(owner.address);
    expect(await contract.monarchNames(owner.address)).to.equal(
      bytes32("[Vacant]")
    );

    expect(await contract.claimPrice()).to.equal(ethers.parseEther("0.0001"));
  });

  it("should the first Monarch after the owner deployment should pay at least 0.0001 ether", async () => {
    let claimPrice = await contract.claimPrice();
    expect(claimPrice).to.equal(ethers.parseEther("0.0001"));
  });

  it("should increase by claim price by 1.5x after every monarch", async () => {
    let claimPrice = await contract.claimPrice();

    expect(await contract.claimPrice()).to.equal(ethers.parseEther("0.0001"));

    await contract
      .connect(user1)
      .becomeMonarch(bytes32("Monarch1"), { value: claimPrice });

    var newClaimPrice1 = (claimPrice * 150n) / 100n;

    expect(await contract.claimPrice()).to.equal(newClaimPrice1);

    await contract
      .connect(user2)
      .becomeMonarch(bytes32("Monarch1"), { value: newClaimPrice1 });

    var newClaimPrice2 = (newClaimPrice1 * 150n) / 100n;

    expect(await contract.claimPrice()).to.equal(newClaimPrice2);
  });

  it("should accumulate fees and allow the owner to sweep them", async () => {
    const claimPrice = await contract.claimPrice();

    await contract
      .connect(user1)
      .becomeMonarch(bytes32("Monarch1"), { value: claimPrice });

    const accumulatedFees = await contract.getAccumulatedFees();
    expect(accumulatedFees).to.equal((claimPrice * 1n) / 100n);

    await contract.sweepFees();

    const newAccumulatedFees = await contract.getAccumulatedFees();
    expect(newAccumulatedFees).to.equal(0);
  });

  it("should have a new monarch on each becomeMonarch calls", async () => {
    var claimPrice = await contract.claimPrice();

    await contract
      .connect(user1)
      .becomeMonarch(bytes32("Monarch1"), { value: claimPrice });

    var claimPrice = await contract.claimPrice();

    expect(await contract.monarch()).to.equal(user1.address);
    expect(await contract.monarchNames(user1.address)).to.equal(
      bytes32("Monarch1")
    );

    await contract
      .connect(user2)
      .becomeMonarch(bytes32("Monarch2"), { value: claimPrice });

    expect(await contract.monarch()).to.equal(user2.address);
    expect(await contract.monarchNames(user2.address)).to.equal(
      bytes32("Monarch2")
    );
  });
});
