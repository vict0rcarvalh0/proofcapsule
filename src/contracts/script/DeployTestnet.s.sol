// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ProofCapsuleNFT.sol";
import "../src/ProofCapsuleRegistry.sol";

/**
 * @title DeployTestnet
 * @dev Deployment script for ProofCapsule contracts on Sonic Testnet
 */
contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ProofCapsuleNFT first
        ProofCapsuleNFT proofCapsuleNFT = new ProofCapsuleNFT();
        console.log("ProofCapsuleNFT deployed at:", address(proofCapsuleNFT));

        // Deploy ProofCapsuleRegistry with NFT contract address
        ProofCapsuleRegistry registry = new ProofCapsuleRegistry(address(proofCapsuleNFT));
        console.log("ProofCapsuleRegistry deployed at:", address(registry));

        // Set the registry in the NFT contract
        proofCapsuleNFT.setRegistry(address(registry));
        console.log("Registry set in NFT contract");

        vm.stopBroadcast();

        // Log deployment information
        console.log("\n=== ProofCapsule Testnet Deployment Complete ===");
        console.log("Network: Sonic Testnet (Chain ID: 14601)");
        console.log("ProofCapsuleNFT:", address(proofCapsuleNFT));
        console.log("ProofCapsuleRegistry:", address(registry));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("========================================\n");
    }
} 