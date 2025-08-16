// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ProofCapsuleNFT.sol";
import "../src/ProofCapsuleRegistry.sol";

/**
 * @title Interact
 * @dev Interaction script for testing deployed ProofCapsule contracts
 */
contract Interact is Script {
    ProofCapsuleNFT public nft;
    ProofCapsuleRegistry public registry;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Load deployed contract addresses from environment
        address nftAddress = vm.envAddress("NFT_ADDRESS");
        address registryAddress = vm.envAddress("REGISTRY_ADDRESS");
        
        nft = ProofCapsuleNFT(nftAddress);
        registry = ProofCapsuleRegistry(registryAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Test creating a ProofCapsule
        console.log("Creating test ProofCapsule...");
        
        bytes32 testHash = keccak256("test content for interaction");
        string memory description = "Test interaction capsule";
        string memory location = "Test location";
        string memory ipfsHash = "QmTestInteractionHash";
        
        uint256 tokenId = nft.createProofCapsule(
            testHash,
            description,
            location,
            ipfsHash,
            true
        );
        
        console.log("ProofCapsule created with token ID:", tokenId);
        
        // Test verification
        uint256 verifiedTokenId = nft.verifyContentHash(testHash);
        console.log("Verified token ID:", verifiedTokenId);
        
        // Test getting capsule data
        ProofCapsuleNFT.ProofCapsule memory capsule = nft.getCapsule(tokenId);
        console.log("Capsule description:", capsule.description);
        console.log("Capsule location:", capsule.location);
        console.log("Capsule timestamp:", capsule.timestamp);
        
        // Test registry stats
        (uint256 totalCapsules, uint256 totalUsers, uint256 todayCapsules) = registry.getGlobalStats();
        console.log("Total capsules:", totalCapsules);
        console.log("Total users:", totalUsers);
        console.log("Today's capsules:", todayCapsules);
        
        // Test user stats
        address user = vm.addr(deployerPrivateKey);
        ProofCapsuleRegistry.UserStats memory userStats = registry.getUserStats(user);
        console.log("User total capsules:", userStats.totalCapsules);
        console.log("User public capsules:", userStats.publicCapsules);
        console.log("User private capsules:", userStats.privateCapsules);
        
        vm.stopBroadcast();
        
        console.log("\n=== Interaction Test Complete ===");
        console.log("All functions tested successfully!");
        console.log("================================\n");
    }
} 