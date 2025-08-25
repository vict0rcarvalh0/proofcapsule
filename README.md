# ProofCapsule - Immutable Proof of Existence

<img src="assets/proofcapsule.png">

**Preserve your digital moments on-chain with immutable timestamps.**

## **What is ProofCapsule?**

ProofCapsule is a decentralized time capsule(PoRL - Proof of Real Life) that lets anyone capture, timestamp, and verify files, documents, or memories on the Sonic blockchain. By combining IPFS storage with NFT minting, ProofCapsule creates permanent, verifiable proof of existence — no central authority, no database, just blockchain trust.

## **The Problem**

- Digital content is fragile: files can be deleted, altered, or lost.
- Centralized timestamping (Google Drive, Dropbox, Notary services) requires trust in third parties.
- No simple way exists for users to prove they created/owned something at a specific moment without legal intermediaries.

## **The Solution**

ProofCapsule leverages the immutability of Sonic blockchain and IPFS to create verifiable, trustless timestamps for any digital moment.

- Upload any file → hash generated locally.
- File stored on IPFS for decentralized access.
- Smart contract on Sonic Mainnet records the hash + timestamp.
- User mints an NFT representing their Proof Capsule.

This ensures indisputable proof of existence and ownership at a given point in time.

### **Why ProofCapsule?**

- **Immutable Proof**: Once created, your content's existence is permanently recorded on the blockchain
- **Live Capture**: Real-time camera and GPS integration for "present moment" verification
- **Decentralized Storage**: IPFS-powered storage ensures your content never disappears
- **Fast & Cheap**: Built on Sonic Mainnet for lightning-fast transactions and minimal gas costs

## **Use Cases:**

- **Content Creators**: Prove ownership and creation dates of your work
- **Journalists**: Timestamp important documents and evidence
- **Legal Professionals**: Create immutable records of contracts and evidence
- **Photographers**: Prove when and where photos were taken
- **Researchers**: Timestamp research findings and discoveries
- **Students**: Can prove attendance in events, lectures, hackathons and classes
- **Anyone**: Who wants to prove they had certain information at a specific time

## **Architecture & Technology Stack**

### **Frontend (Next.js 15)**
- Next.js 15.4.6 (App Router, TypeScript)
- Tailwind CSS (Utility-first styling)
- Wagmi + Viem (Ethereum integration)
- Sonner (Beautiful toasts)
- Lucide React (Icons)

### **Smart Contracts (Solidity)**
- ProofCapsuleNFT.sol (ERC-721 implementation)
- ProofCapsuleRegistry.sol (Batch operations)
- OpenZeppelin contracts (Security audited)
- Foundry (Development & testing)

### **Storage & Infrastructure**
// Decentralized & Reliable
- IPFS (Decentralized content addressing)
- Pinata (Reliable IPFS pinning)
- Neon Postgres (Production database)
- SQLite (Local development)
- Drizzle ORM (Type-safe database)

### **Blockchain Integration**
- Chain ID: 146
- RPC: https://rpc.soniclabs.com
- Explorer: https://explorer.soniclabs.com
- Gas costs: ~0.17 SONIC per capsule

## **Live Demo & Deployment**

### **Production Deployment**
- **Frontend**: [Deployed on Vercel](https://proofcapsule.vercel.app/)
- **Smart Contracts**:
   - **ProofCapsuleNFT**: [https://sonicscan.org/address/0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A](https://sonicscan.org/address/0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A)
   - **ProofCapsuleRegistry**: [https://sonicscan.org/address/0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c](https://sonicscan.org/address/0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c)
- **Database**: Neon Postgres Free Tier (Production-ready)

### **Contract Addresses**
- ProofCapsuleNFT: 0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A
- ProofCapsuleRegistry: 0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c

## **Features Showcase**

### **Live Camera & GPS Capture**
- Live camera preview with device camera
- GPS location capture with geocoding
- "Present moment only" verification
- Automatic metadata generation

### **Cryptographic Verification**
- Local file hashing (SHA-256)
- Blockchain timestamp verification
- IPFS content addressing
- NFT metadata standards (ERC-721)

### **Decentralized Storage**
- Pinata integration for reliable pinning
- Multiple IPFS gateways
- Redundant content access
- Immutable content references

### **User Experience**
- Real-time transaction status
- Beautiful toast notifications
- Responsive design (mobile-first)
- Dark/light theme support

## **How It Works**

### **1. Create a Proof Capsule**
1. Connect wallet to Sonic Mainnet
2. Use live camera to capture content
3. GPS automatically captures location
4. Add description and metadata
5. Upload to IPFS via Pinata
6. Mint NFT on blockchain
7. Store in database for easy access

### **2. View & Manage Capsules**
- Browse all your capsules
- Filter by date, type, location
- View detailed metadata
- Share IPFS links
- Download complete data

### **3. Verify Content**
- Upload file to verify
- Compare with blockchain hash
- View transaction details
- Check IPFS metadata
- Verify timestamp and location

## **Installation & Setup**

### **Prerequisites**
- Node.js 18+ and npm
- MetaMask or compatible wallet
- Sonic (SONIC) tokens for gas fees
- Pinata account for IPFS storage

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/yourusername/proofcapsule.git
cd proofcapsule

# Install dependencies
cd src/client
npm install --force

# Configure environment(on the root /proofcapsule)
cp env.example /src/client/.env
cp env.example /src/contracts/.env
# Edit .env with your configuration

# Start development server
npm run dev
```

### **Environment Configuration**
```env
# Smart Contract Deployment - Sonic Mainnet
PRIVATE_KEY=0x...
RPC_URL=https://rpc.soniclabs.com
ETHERSCAN_API_KEY=optional_for_verification
NFT_ADDRESS=0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A
REGISTRY_ADDRESS=0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c

# Frontend Environment Variables (can mirror backend names)
NEXT_PUBLIC_NFT_ADDRESS=0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A
NEXT_PUBLIC_REGISTRY_ADDRESS=0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c
NEXT_PUBLIC_RPC_URL=https://rpc.soniclabs.com
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# IPFS/Pinata Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here

# Database Configuration
# Development: SQLite (local file)
# Production: Neon Postgres
DATABASE_URL=postgresql://username:password@host:port/database

# API fallback mode for production (skip DB, return empty)
API_READONLY=false
```

## **CI/CD Pipeline**
- Automated testing on push
- Contract deployment on main
- Frontend deployment to Vercel
- Database migrations

## **Performance & Metrics**

### **Gas Optimization**
```solidity
// Optimized for Sonic Mainnet
- Registry Contract: 1,070,871 gas
- NFT Contract: 2,240,881 gas
- Total Deployment: 3,361,190 gas
- Cost per Capsule: ~0.17 SONIC
```

### **Storage Efficiency**
- Compressed metadata
- Efficient content addressing
- Multiple gateway redundancy
- Automatic pinning management

## **Security & Privacy**

### **Smart Contract Security**
- OpenZeppelin audited contracts
- Reentrancy protection
- Access control mechanisms
- Emergency pause functionality

### **Privacy Protection**
- Local file hashing (no server upload)
- Encrypted metadata storage
- Optional content visibility
- GDPR compliant data handling

### **Data Integrity**
- Cryptographic hash verification
- Blockchain timestamp validation
- IPFS content addressing
- Immutable transaction records

## **Advanced Features**

### **Batch Operations - Efficient bulk creation**
- Create multiple capsules in one transaction
- Reduced gas costs for bulk operations
- Batch metadata upload to IPFS

### **User Analytics**
- Capsule creation statistics
- User engagement metrics
- Transaction history
- Performance analytics

### **API Endpoints**
- GET /api/capsules - List user capsules
- POST /api/capsules - Create new capsule
- GET /api/verify - Verify content
- GET /api/analytics - User statistics

## Videos
- Pitch: https://youtu.be/Kl6WowpumZ8
- Demo: https://youtu.be/tcFY8XNGAuY

*ProofCapsule - Let's make reality verifiable again*
