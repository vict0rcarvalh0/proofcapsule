// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ProofCapsuleRegistry.sol";

/**
 * @title ProofCapsuleNFT
 * @dev NFT contract representing timestamped moments on the blockchain
 * Each ProofCapsule is an NFT that contains metadata about a captured moment
 */
contract ProofCapsuleNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;
    
    // Mapping from token ID to capsule data
    mapping(uint256 => ProofCapsule) public capsules;
    
    // Mapping from content hash to token ID (for verification)
    mapping(bytes32 => uint256) public hashToTokenId;
    
    // Registry contract for additional functionality
    ProofCapsuleRegistry public registry;
    
    // Events
    event ProofCapsuleCreated(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed contentHash,
        uint256 timestamp,
        string description,
        string location
    );
    
    event MetadataUpdated(uint256 indexed tokenId, string newURI);

    // Struct to store capsule data
    struct ProofCapsule {
        bytes32 contentHash;      // Hash of the original content
        uint256 timestamp;        // When the capsule was created
        string description;       // Optional description
        string location;          // Optional location
        string ipfsHash;          // IPFS hash if content was uploaded
        bool isPublic;            // Whether the content is publicly accessible
    }

    constructor() ERC721("ProofCapsule", "PCAP") Ownable(msg.sender) {}
    
    /**
     * @dev Sets the registry contract address
     * @param _registry The registry contract address
     */
    function setRegistry(address _registry) external onlyOwner {
        registry = ProofCapsuleRegistry(_registry);
    }

    /**
     * @dev Creates a new ProofCapsule NFT
     * @param contentHash Hash of the content being captured
     * @param description Optional description of the moment
     * @param location Optional location where the moment was captured
     * @param ipfsHash Optional IPFS hash if content was uploaded
     * @param isPublic Whether the content should be publicly accessible
     * @return tokenId The ID of the newly created NFT
     */
    function createProofCapsule(
        bytes32 contentHash,
        string memory description,
        string memory location,
        string memory ipfsHash,
        bool isPublic
    ) external returns (uint256) {
        require(contentHash != bytes32(0), "Content hash cannot be zero");
        require(hashToTokenId[contentHash] == 0, "Content hash already exists");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        // Create the capsule data
        ProofCapsule memory newCapsule = ProofCapsule({
            contentHash: contentHash,
            timestamp: block.timestamp,
            description: description,
            location: location,
            ipfsHash: ipfsHash,
            isPublic: isPublic
        });
        
        // Store the capsule data
        capsules[newTokenId] = newCapsule;
        hashToTokenId[contentHash] = newTokenId;
        
        // Mint the NFT to the caller
        _safeMint(msg.sender, newTokenId);
        
        // Set the token URI
        string memory uri = _generateTokenURI(newTokenId, newCapsule);
        _setTokenURI(newTokenId, uri);
        
        emit ProofCapsuleCreated(
            newTokenId,
            msg.sender,
            contentHash,
            block.timestamp,
            description,
            location
        );
        
        // Register with registry if set
        if (address(registry) != address(0)) {
            registry.registerCapsule(newTokenId, msg.sender, contentHash);
        }
        
        return newTokenId;
    }

    /**
     * @dev Updates the metadata of an existing ProofCapsule
     * @param tokenId The ID of the token to update
     * @param description New description
     * @param location New location
     * @param isPublic New public status
     */
    function updateCapsuleMetadata(
        uint256 tokenId,
        string memory description,
        string memory location,
        bool isPublic
    ) external {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        ProofCapsule storage capsule = capsules[tokenId];
        capsule.description = description;
        capsule.location = location;
        capsule.isPublic = isPublic;
        
        // Update the token URI
        string memory uri = _generateTokenURI(tokenId, capsule);
        _setTokenURI(tokenId, uri);
        
        emit MetadataUpdated(tokenId, uri);
    }

    /**
     * @dev Verifies if a content hash exists and returns the token ID
     * @param contentHash The hash to verify
     * @return tokenId The token ID if found, 0 otherwise
     */
    function verifyContentHash(bytes32 contentHash) external view returns (uint256) {
        return hashToTokenId[contentHash];
    }

    /**
     * @dev Gets the capsule data for a given token ID
     * @param tokenId The token ID
     * @return capsule The ProofCapsule data
     */
    function getCapsule(uint256 tokenId) external view returns (ProofCapsule memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return capsules[tokenId];
    }

    /**
     * @dev Gets the total number of ProofCapsules created
     * @return count The total count
     */
    function totalCapsules() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Generates the token URI for a ProofCapsule
     * @param tokenId The token ID
     * @param capsule The capsule data
     * @return uri The generated URI
     */
    function _generateTokenURI(uint256 tokenId, ProofCapsule memory capsule) 
        internal 
        pure 
        returns (string memory) 
    {
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(string(abi.encodePacked(
                '{"name":"ProofCapsule #', tokenId.toString(), '",',
                '"description":"', capsule.description, '",',
                '"image":"ipfs://', capsule.ipfsHash, '",',
                '"attributes":[',
                '{"trait_type":"Timestamp","value":"', uint256(capsule.timestamp).toString(), '"},',
                '{"trait_type":"Location","value":"', capsule.location, '"},',
                '{"trait_type":"Content Hash","value":"', _bytes32ToString(capsule.contentHash), '"},',
                '{"trait_type":"Public","value":"', capsule.isPublic ? "true" : "false", '"}',
                ']}'
            ))))
        ));
    }

    /**
     * @dev Converts bytes32 to string
     * @param _bytes32 The bytes32 value
     * @return The string representation
     */
    function _bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    /**
     * @dev Base64 encoding function
     * @param data The data to encode
     * @return The base64 encoded string
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";
        
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        
        uint256 i = 0;
        uint256 j = 0;
        
        while (i < len) {
            uint256 a = i < len ? uint8(data[i++]) : 0;
            uint256 b = i < len ? uint8(data[i++]) : 0;
            uint256 c = i < len ? uint8(data[i++]) : 0;
            
            uint256 triple = (a << 16) + (b << 8) + c;
            
            result[j++] = bytes1(bytes(table)[triple >> 18 & 0x3F]);
            result[j++] = bytes1(bytes(table)[triple >> 12 & 0x3F]);
            result[j++] = bytes1(bytes(table)[triple >> 6 & 0x3F]);
            result[j++] = bytes1(bytes(table)[triple & 0x3F]);
        }
        
        // Adjust padding
        while (j > 0 && result[j - 1] == "=") {
            j--;
        }
        
        return string(result);
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 