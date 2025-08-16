// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./ProofCapsuleNFT.sol";

/**
 * @title ProofCapsuleRegistry
 * @dev Registry contract for managing ProofCapsule ecosystem
 * Provides verification services, analytics, and batch operations
 */
contract ProofCapsuleRegistry is Ownable, IERC721Receiver {

    ProofCapsuleNFT public immutable proofCapsuleNFT;
    
    // Registry data
    mapping(address => uint256[]) public userCapsules;
    mapping(bytes32 => bool) public verifiedHashes;
    mapping(address => uint256) public userStats;
    
    // Analytics
    uint256 public totalCapsulesCreated;
    uint256 public totalUniqueUsers;
    mapping(uint256 => uint256) public dailyCapsules; // timestamp => count
    
    // Events
    event CapsuleRegistered(uint256 indexed tokenId, address indexed owner, bytes32 indexed contentHash);
    event HashVerified(bytes32 indexed contentHash, bool verified);
    event BatchCapsulesCreated(address indexed owner, uint256[] tokenIds);
    
    // Structs
    struct CapsuleInfo {
        uint256 tokenId;
        bytes32 contentHash;
        uint256 timestamp;
        string description;
        string location;
        bool isPublic;
    }
    
    struct UserStats {
        uint256 totalCapsules;
        uint256 publicCapsules;
        uint256 privateCapsules;
        uint256 firstCapsuleTimestamp;
        uint256 lastCapsuleTimestamp;
    }

    constructor(address _proofCapsuleNFT) Ownable(msg.sender) {
        proofCapsuleNFT = ProofCapsuleNFT(_proofCapsuleNFT);
    }

    /**
     * @dev Registers a newly created ProofCapsule in the registry
     * @param tokenId The token ID of the created capsule
     * @param owner The owner of the capsule
     * @param contentHash The content hash
     */
    function registerCapsule(uint256 tokenId, address owner, bytes32 contentHash) external {
        require(msg.sender == address(proofCapsuleNFT), "Only NFT contract can register");
        
        // Add to user's capsule list
        userCapsules[owner].push(tokenId);
        
        // Update user stats
        if (userStats[owner] == 0) {
            totalUniqueUsers++;
        }
        userStats[owner]++;
        
        // Update global stats
        totalCapsulesCreated++;
        dailyCapsules[block.timestamp / 1 days]++;
        
        emit CapsuleRegistered(tokenId, owner, contentHash);
    }

    /**
     * @dev Creates multiple ProofCapsules in a single transaction
     * @param contentHashes Array of content hashes
     * @param descriptions Array of descriptions
     * @param locations Array of locations
     * @param ipfsHashes Array of IPFS hashes
     * @param isPublic Array of public flags
     * @return tokenIds Array of created token IDs
     */
    function createBatchCapsules(
        bytes32[] calldata contentHashes,
        string[] calldata descriptions,
        string[] calldata locations,
        string[] calldata ipfsHashes,
        bool[] calldata isPublic
    ) external returns (uint256[] memory tokenIds) {
        require(
            contentHashes.length == descriptions.length &&
            descriptions.length == locations.length &&
            locations.length == ipfsHashes.length &&
            ipfsHashes.length == isPublic.length,
            "Array lengths must match"
        );
        
        tokenIds = new uint256[](contentHashes.length);
        
        for (uint256 i = 0; i < contentHashes.length; i++) {
            tokenIds[i] = proofCapsuleNFT.createProofCapsule(
                contentHashes[i],
                descriptions[i],
                locations[i],
                ipfsHashes[i],
                isPublic[i]
            );
        }
        
        emit BatchCapsulesCreated(msg.sender, tokenIds);
    }

    /**
     * @dev Verifies a content hash and marks it as verified
     * @param contentHash The hash to verify
     * @param verified Whether the hash is verified
     */
    function verifyHash(bytes32 contentHash, bool verified) external onlyOwner {
        verifiedHashes[contentHash] = verified;
        emit HashVerified(contentHash, verified);
    }

    /**
     * @dev Gets all capsules for a specific user
     * @param user The user address
     * @return capsules Array of capsule information
     */
    function getUserCapsules(address user) external view returns (CapsuleInfo[] memory capsules) {
        uint256[] memory tokenIds = userCapsules[user];
        capsules = new CapsuleInfo[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            ProofCapsuleNFT.ProofCapsule memory capsule = proofCapsuleNFT.getCapsule(tokenIds[i]);
            capsules[i] = CapsuleInfo({
                tokenId: tokenIds[i],
                contentHash: capsule.contentHash,
                timestamp: capsule.timestamp,
                description: capsule.description,
                location: capsule.location,
                isPublic: capsule.isPublic
            });
        }
    }

    /**
     * @dev Gets detailed statistics for a user
     * @param user The user address
     * @return stats User statistics
     */
    function getUserStats(address user) external view returns (UserStats memory stats) {
        uint256[] memory tokenIds = userCapsules[user];
        uint256 publicCount = 0;
        uint256 privateCount = 0;
        uint256 firstTimestamp = type(uint256).max;
        uint256 lastTimestamp = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            ProofCapsuleNFT.ProofCapsule memory capsule = proofCapsuleNFT.getCapsule(tokenIds[i]);
            
            if (capsule.isPublic) {
                publicCount++;
            } else {
                privateCount++;
            }
            
            if (capsule.timestamp < firstTimestamp) {
                firstTimestamp = capsule.timestamp;
            }
            if (capsule.timestamp > lastTimestamp) {
                lastTimestamp = capsule.timestamp;
            }
        }
        
        stats = UserStats({
            totalCapsules: tokenIds.length,
            publicCapsules: publicCount,
            privateCapsules: privateCount,
            firstCapsuleTimestamp: firstTimestamp == type(uint256).max ? 0 : firstTimestamp,
            lastCapsuleTimestamp: lastTimestamp
        });
    }

    /**
     * @dev Gets global statistics
     * @return totalCapsules Total number of capsules created
     * @return totalUsers Total number of unique users
     * @return todayCapsules Number of capsules created today
     */
    function getGlobalStats() external view returns (uint256 totalCapsules, uint256 totalUsers, uint256 todayCapsules) {
        totalCapsules = totalCapsulesCreated;
        totalUsers = totalUniqueUsers;
        todayCapsules = dailyCapsules[block.timestamp / 1 days];
    }

    /**
     * @dev Checks if a content hash is verified
     * @param contentHash The hash to check
     * @return verified Whether the hash is verified
     */
    function isHashVerified(bytes32 contentHash) external view returns (bool verified) {
        return verifiedHashes[contentHash];
    }

    /**
     * @dev Gets the number of capsules created by a user
     * @param user The user address
     * @return count The number of capsules
     */
    function getUserCapsuleCount(address user) external view returns (uint256 count) {
        return userStats[user];
    }

    /**
     * @dev Gets capsules created on a specific day
     * @param dayTimestamp The timestamp of the day (start of day)
     * @return count The number of capsules created on that day
     */
    function getDailyCapsules(uint256 dayTimestamp) external view returns (uint256 count) {
        return dailyCapsules[dayTimestamp / 1 days];
    }

    /**
     * @dev Emergency function to update user stats (only owner)
     * @param user The user address
     * @param newCount The new capsule count
     */
    function updateUserStats(address user, uint256 newCount) external onlyOwner {
        userStats[user] = newCount;
    }

    /**
     * @dev Required by IERC721Receiver interface
     * @param operator The address which called `safeTransferFrom` function
     * @param from The address which previously owned the token
     * @param tokenId The identifier of the token being transferred
     * @param data Additional data with no specified format
     * @return bytes4 `IERC721Receiver.onERC721Received.selector`
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
} 