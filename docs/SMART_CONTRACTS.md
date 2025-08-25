# ProofCapsule Smart Contracts

## Overview

The ProofCapsule smart contracts provide a decentralized protocol for creating immutable, timestamped proofs of digital content on the blockchain. Each ProofCapsule is represented as an NFT with rich metadata and verification capabilities.

## Contract Architecture

### Core Contracts

1. **ProofCapsuleNFT** - Main NFT contract for creating and managing ProofCapsules
2. **ProofCapsuleRegistry** - Registry contract for analytics, verification, and batch operations

### Contract Relationships

```
ProofCapsuleNFT ←→ ProofCapsuleRegistry
     ↓                    ↓
   NFT Minting      Analytics & Stats
   Metadata         Batch Operations
   Verification     User Management
```

## ProofCapsuleNFT Contract

### Key Features

- **ERC721 Standard**: Each ProofCapsule is a unique NFT
- **Content Hashing**: Only content hashes are stored on-chain for privacy
- **Rich Metadata**: Timestamps, descriptions, locations, and IPFS hashes
- **Verification**: Public verification of content authenticity
- **Metadata Updates**: Owner can update descriptions and visibility

### Core Functions

#### `createProofCapsule()`
Creates a new ProofCapsule NFT.

```solidity
function createProofCapsule(
    bytes32 contentHash,
    string memory description,
    string memory location,
    string memory ipfsHash,
    bool isPublic
) external returns (uint256)
```

**Parameters:**
- `contentHash`: SHA256 hash of the original content
- `description`: Human-readable description of the moment
- `location`: Geographic location (optional)
- `ipfsHash`: IPFS hash if content was uploaded (optional)
- `isPublic`: Whether the content should be publicly accessible

**Returns:** Token ID of the created NFT

#### `verifyContentHash()`
Verifies if a content hash exists and returns the associated token ID.

```solidity
function verifyContentHash(bytes32 contentHash) external view returns (uint256)
```

**Returns:** Token ID if found, 0 otherwise

#### `getCapsule()`
Retrieves complete capsule data for a given token ID.

```solidity
function getCapsule(uint256 tokenId) external view returns (ProofCapsule memory)
```

**Returns:** Complete ProofCapsule struct

#### `updateCapsuleMetadata()`
Updates metadata for an existing ProofCapsule (owner only).

```solidity
function updateCapsuleMetadata(
    uint256 tokenId,
    string memory description,
    string memory location,
    bool isPublic
) external
```

### Data Structures

#### ProofCapsule Struct
```solidity
struct ProofCapsule {
    bytes32 contentHash;      // Hash of the original content
    uint256 timestamp;        // When the capsule was created
    string description;       // Optional description
    string location;          // Optional location
    string ipfsHash;          // IPFS hash if content was uploaded
    bool isPublic;            // Whether the content is publicly accessible
}
```

### Events

- `ProofCapsuleCreated`: Emitted when a new capsule is created
- `MetadataUpdated`: Emitted when capsule metadata is updated

## ProofCapsuleRegistry Contract

### Key Features

- **Analytics**: Global and user-specific statistics
- **Batch Operations**: Create multiple capsules in one transaction
- **Verification Services**: Hash verification and validation
- **User Management**: Track user activity and capsule ownership

### Core Functions

#### `createBatchCapsules()`
Creates multiple ProofCapsules in a single transaction.

```solidity
function createBatchCapsules(
    bytes32[] calldata contentHashes,
    string[] calldata descriptions,
    string[] calldata locations,
    string[] calldata ipfsHashes,
    bool[] calldata isPublic
) external returns (uint256[] memory)
```

**Returns:** Array of created token IDs

#### `getUserCapsules()`
Retrieves all capsules for a specific user.

```solidity
function getUserCapsules(address user) external view returns (CapsuleInfo[] memory)
```

#### `getUserStats()`
Gets detailed statistics for a user.

```solidity
function getUserStats(address user) external view returns (UserStats memory)
```

#### `getGlobalStats()`
Gets global platform statistics.

```solidity
function getGlobalStats() external view returns (uint256 totalCapsules, uint256 totalUsers, uint256 todayCapsules)
```

#### `verifyHash()`
Marks a content hash as verified (owner only).

```solidity
function verifyHash(bytes32 contentHash, bool verified) external
```

### Data Structures

#### CapsuleInfo Struct
```solidity
struct CapsuleInfo {
    uint256 tokenId;
    bytes32 contentHash;
    uint256 timestamp;
    string description;
    string location;
    bool isPublic;
}
```

#### UserStats Struct
```solidity
struct UserStats {
    uint256 totalCapsules;
    uint256 publicCapsules;
    uint256 privateCapsules;
    uint256 firstCapsuleTimestamp;
    uint256 lastCapsuleTimestamp;
}
```

## Security Features

### Access Control
- **Ownable**: Registry contract has owner-only functions
- **Token Ownership**: Only token owners can update metadata
- **Registry Integration**: Secure communication between contracts

### Data Integrity
- **Content Hashing**: Cryptographic proof of content authenticity
- **Timestamp Validation**: Blockchain timestamps for irrefutable proof
- **Duplicate Prevention**: Same content hash cannot be used twice

### Privacy Protection
- **Hash-Only Storage**: Original content never stored on-chain
- **Optional IPFS**: Users choose whether to upload content
- **Visibility Control**: Public/private capsule settings

## Gas Optimization

### Efficient Storage
- **Packed Structs**: Optimized data structures
- **Batch Operations**: Reduce gas costs for multiple operations
- **View Functions**: Free read operations

### Smart Contract Patterns
- **Registry Pattern**: Separate concerns for better scalability
- **Event-Driven**: Efficient state change tracking
- **Modular Design**: Easy to upgrade and maintain

## Integration Guide

### Frontend Integration

1. **Connect to Contracts**:
```javascript
import { useContract } from 'wagmi'

const { data: nftContract } = useContract({
  address: '0x...', // ProofCapsuleNFT address
  abi: ProofCapsuleNFT.abi
})
```

2. **Create ProofCapsule**:
```javascript
const createCapsule = async (contentHash, description, location, ipfsHash, isPublic) => {
  const tx = await nftContract.createProofCapsule(
    contentHash,
    description,
    location,
    ipfsHash,
    isPublic
  )
  await tx.wait()
}
```

3. **Verify Content**:
```javascript
const verifyContent = async (contentHash) => {
  const tokenId = await nftContract.verifyContentHash(contentHash)
  return tokenId > 0
}
```

### Backend Integration

1. **Content Hashing**:
```javascript
import crypto from 'crypto'

const hashContent = (content) => {
  return '0x' + crypto.createHash('sha256').update(content).digest('hex')
}
```

2. **IPFS Upload**:
```javascript
import { create } from 'ipfs-http-client'

const uploadToIPFS = async (content) => {
  const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' })
  const result = await ipfs.add(content)
  return result.path
}
```