// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ProofCapsuleNFT.sol";
import "../src/ProofCapsuleRegistry.sol";

contract ProofCapsuleTest is Test {
    ProofCapsuleNFT public nft;
    ProofCapsuleRegistry public registry;

    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public owner = address(this);

    bytes32 public testHash = keccak256("test content");
    string public testDescription = "Test moment";
    string public testLocation = "Test location";
    string public testIpfsHash = "QmTestHash";

    function setUp() public {
        // Deploy contracts
        nft = new ProofCapsuleNFT();
        registry = new ProofCapsuleRegistry(address(nft));

        // Set the registry in the NFT contract
        nft.setRegistry(address(registry));

        // Fund test users
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    function testCreateProofCapsule() public {
        vm.startPrank(user1);

        uint256 tokenId = nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), user1);

        ProofCapsuleNFT.ProofCapsule memory capsule = nft.getCapsule(tokenId);
        assertEq(capsule.contentHash, testHash);
        assertEq(capsule.description, testDescription);
        assertEq(capsule.location, testLocation);
        assertEq(capsule.ipfsHash, testIpfsHash);
        assertTrue(capsule.isPublic);

        vm.stopPrank();
    }

    function testVerifyContentHash() public {
        vm.startPrank(user1);

        uint256 tokenId = nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        uint256 verifiedTokenId = nft.verifyContentHash(testHash);
        assertEq(verifiedTokenId, tokenId);

        // Test non-existent hash
        bytes32 nonExistentHash = keccak256("non-existent");
        uint256 nonExistentTokenId = nft.verifyContentHash(nonExistentHash);
        assertEq(nonExistentTokenId, 0);

        vm.stopPrank();
    }

    function testUpdateCapsuleMetadata() public {
        vm.startPrank(user1);

        uint256 tokenId = nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        // Update metadata
        nft.updateCapsuleMetadata(tokenId, "Updated description", "Updated location", false);

        ProofCapsuleNFT.ProofCapsule memory capsule = nft.getCapsule(tokenId);
        assertEq(capsule.description, "Updated description");
        assertEq(capsule.location, "Updated location");
        assertFalse(capsule.isPublic);

        vm.stopPrank();
    }

    function testBatchCapsules() public {
        vm.startPrank(user1);

        bytes32[] memory hashes = new bytes32[](2);
        hashes[0] = keccak256("content1");
        hashes[1] = keccak256("content2");

        string[] memory descriptions = new string[](2);
        descriptions[0] = "First moment";
        descriptions[1] = "Second moment";

        string[] memory locations = new string[](2);
        locations[0] = "Location 1";
        locations[1] = "Location 2";

        string[] memory ipfsHashes = new string[](2);
        ipfsHashes[0] = "QmHash1";
        ipfsHashes[1] = "QmHash2";

        bool[] memory isPublic = new bool[](2);
        isPublic[0] = true;
        isPublic[1] = false;

        uint256[] memory tokenIds = registry.createBatchCapsules(hashes, descriptions, locations, ipfsHashes, isPublic);

        assertEq(tokenIds.length, 2);
        assertEq(tokenIds[0], 1);
        assertEq(tokenIds[1], 2);

        vm.stopPrank();
    }

    function testRegistryStats() public {
        vm.startPrank(user1);

        // Create first capsule
        nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        vm.stopPrank();

        vm.startPrank(user2);

        // Create second capsule
        nft.createProofCapsule(keccak256("content2"), "Second moment", "Location 2", "QmHash2", false);

        vm.stopPrank();

        // Check global stats
        (uint256 totalCapsules, uint256 totalUsers, uint256 todayCapsules) = registry.getGlobalStats();
        assertEq(totalCapsules, 2);
        assertEq(totalUsers, 2);
        assertGt(todayCapsules, 0);
    }

    function testUserStats() public {
        vm.startPrank(user1);

        // Create public capsule
        nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        // Create private capsule
        nft.createProofCapsule(
            keccak256("private content"), "Private moment", "Private location", "QmPrivateHash", false
        );

        vm.stopPrank();

        ProofCapsuleRegistry.UserStats memory stats = registry.getUserStats(user1);
        assertEq(stats.totalCapsules, 2);
        assertEq(stats.publicCapsules, 1);
        assertEq(stats.privateCapsules, 1);
        assertGt(stats.firstCapsuleTimestamp, 0);
        assertGt(stats.lastCapsuleTimestamp, 0);
    }

    function testHashVerification() public {
        vm.startPrank(user1);

        nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        vm.stopPrank();

        // Owner can verify hash
        registry.verifyHash(testHash, true);
        assertTrue(registry.isHashVerified(testHash));

        // Non-owner cannot verify hash
        vm.startPrank(user2);
        vm.expectRevert();
        registry.verifyHash(keccak256("another hash"), true);
        vm.stopPrank();
    }

    function testTokenURI() public {
        vm.startPrank(user1);

        uint256 tokenId = nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        string memory uri = nft.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0);
        assertTrue(bytes(uri).length > 0);

        vm.stopPrank();
    }

    function test_RevertWhen_DuplicateHash() public {
        vm.startPrank(user1);

        // Create first capsule
        nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        // Try to create second capsule with same hash
        vm.expectRevert("Content hash already exists");
        nft.createProofCapsule(testHash, "Another description", "Another location", "QmAnotherHash", false);

        vm.stopPrank();
    }

    function test_RevertWhen_ZeroHash() public {
        vm.startPrank(user1);

        vm.expectRevert("Content hash cannot be zero");
        nft.createProofCapsule(bytes32(0), testDescription, testLocation, testIpfsHash, true);

        vm.stopPrank();
    }

    function test_RevertWhen_UpdateNotOwner() public {
        vm.startPrank(user1);

        uint256 tokenId = nft.createProofCapsule(testHash, testDescription, testLocation, testIpfsHash, true);

        vm.stopPrank();

        vm.startPrank(user2);

        vm.expectRevert("Not the owner");
        nft.updateCapsuleMetadata(tokenId, "Updated description", "Updated location", false);

        vm.stopPrank();
    }
}
