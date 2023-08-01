# KingdomOfEther - A Kingdom on the Ethereum Blockchain

This smart contract creates a virtual kingdom on the EVM blockchain, where individuals can become the monarch by claiming the throne through a bidding process. The contract also has a commission system and allows the contract owner to sweep accumulated fees. The contract owner can pause the contract to prevent new monarch claims.

Inspiration: https://www.kingoftheether.com/thrones/kingoftheether/index.html

## Features

1. **Become the Monarch**: Anyone can become the monarch by calling the `becomeMonarch` function and paying the current claim price. The person who pays the highest price becomes the new monarch.

2. **Commission System**: A commission is deducted from the claim price each time a new monarch is crowned. This commission is accumulated as fees for the contract owner.

3. **Monarch Renouncement**: The current monarch can renounce their throne by calling the `renounceMonarchy` function, and the contract owner becomes the new monarch.

4. **Pausing the Contract**: The contract owner has the ability to pause and unpause the contract using the `pauseContract` and `unpauseContract` functions, respectively.

5. **Contract Management**: Only the contract owner and the current monarch have specific privileges to certain functions to ensure the integrity of the kingdom.

## Contract Details

- **License**: This contract is licensed under the MIT License.

- **Solidity Version**: This contract is written in Solidity version 0.8.18.

## Getting Started

To use this contract, you need an Ethereum wallet like MetaMask to interact with the EVM blockchain.


```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

### Deployment

```shell
npx hardhat run scripts/deploy.js --network scroll # currently on Scroll Alpha testnet
```

### Interacting with the contract

Currently on [Scroll](https://scroll.io/) @ [0x0C1D326EbcdB42a5738FDB32E355195c09dbBAC7](https://scroll.l2scan.co/address/0x0C1D326EbcdB42a5738FDB32E355195c09dbBAC7) (Scroll Alpha testnet)


## Functions

Here are the main functions of the KingdomOfEther contract:

- `becomeMonarch(bytes32 name) external payable`: Call this function to become the monarch by paying the current claim price and providing a name. The claim price is set by the current monarch and increases over time.

- `renounceMonarchy() external`: Call this function to renounce the throne if you are the current monarch. The contract owner will become the new monarch.

- `pauseContract() external`: Call this function to pause the contract. This prevents anyone from becoming the new monarch until the contract is unpaused.

- `unpauseContract() external`: Call this function to unpause the contract and allow new monarch claims.

- `sweepFees() external`: Call this function if you are the contract owner to sweep accumulated fees into your account.

- `getCurrentClaimPrice() external view returns (uint256)`: Get the current claim price required to become the monarch.

- `getCurrentMonarchName() external view returns (bytes32)`: Get the name of the current monarch.

- `getCurrentReignDuration() external view returns (uint256)`: Get the duration of the current monarch's reign.

- `getAccumulatedFees() external view returns (uint256)`: Get the total accumulated fees that can be swept by the contract owner.

## Important Note

- The contract owner should be cautious when sweeping fees as it involves a transfer of Ether.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This smart contract is provided as-is without any warranties. Use it at your own risk.

Happy ruling! 🤴👸🏰


