# ProofCapsule - Immutable Proof of Existence

> **Transform any digital content into verifiable, timestamped NFTs on the blockchain**

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/proofcapsule)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chain: Sonic](https://img.shields.io/badge/Chain-Sonic%20Mainnet-blue.svg)](https://explorer.soniclabs.com)

## 🚀 **What is ProofCapsule?**

ProofCapsule is a revolutionary decentralized application that creates **immutable, timestamped proofs** of your digital content on the blockchain. Whether it's a photo, document, video, or any digital file, ProofCapsule transforms it into a unique NFT with cryptographic verification.

### ✨ **Why ProofCapsule?**

- 🔒 **Immutable Proof**: Once created, your content's existence is permanently recorded on the blockchain
- 📸 **Live Capture**: Real-time camera and GPS integration for "present moment" verification
- 🌐 **Decentralized Storage**: IPFS-powered storage ensures your content never disappears
- ⚡ **Fast & Cheap**: Built on Sonic Mainnet for lightning-fast transactions and minimal gas costs
- 🎨 **Beautiful UI**: Modern, intuitive interface that makes blockchain accessible to everyone

## 🎯 **Perfect For:**

- **Content Creators**: Prove ownership and creation dates of your work
- **Journalists**: Timestamp important documents and evidence
- **Legal Professionals**: Create immutable records of contracts and evidence
- **Photographers**: Prove when and where photos were taken
- **Researchers**: Timestamp research findings and discoveries
- **Anyone**: Who wants to prove they had certain information at a specific time

## 🏗️ **Architecture & Technology Stack**

### **Frontend (Next.js 15)**
```typescript
// Modern React with App Router
- Next.js 15.4.6 (App Router, TypeScript)
- Tailwind CSS (Utility-first styling)
- Wagmi + Viem (Ethereum integration)
- Sonner (Beautiful toasts)
- Lucide React (Icons)
```

### **Smart Contracts (Solidity)**
```solidity
// Deployed on Sonic Mainnet
- ProofCapsuleNFT.sol (ERC-721 implementation)
- ProofCapsuleRegistry.sol (Batch operations)
- OpenZeppelin contracts (Security audited)
- Foundry (Development & testing)
```

### **Storage & Infrastructure**
```typescript
// Decentralized & Reliable
- IPFS (Decentralized content addressing)
- Pinata (Reliable IPFS pinning)
- Neon Postgres (Production database)
- SQLite (Local development)
- Drizzle ORM (Type-safe database)
```

### **Blockchain Integration**
```typescript
// Sonic Mainnet - Fast & Cheap
- Chain ID: 146
- RPC: https://rpc.soniclabs.com
- Explorer: https://explorer.soniclabs.com
- Gas costs: ~0.17 SONIC per capsule
```

## 🚀 **Live Demo & Deployment**

### **Production Deployment**
- **Frontend**: [Deployed on Vercel](https://your-app.vercel.app)
- **Smart Contracts**: [Sonic Mainnet](https://explorer.soniclabs.com)
- **Database**: Neon Postgres (Production-ready)

### **Contract Addresses**
```solidity
ProofCapsuleNFT: 0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A
ProofCapsuleRegistry: 0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c
```

## 🎨 **Features Showcase**

### 📸 **Live Camera & GPS Capture**
```typescript
// Real-time content creation
- Live camera preview with device camera
- GPS location capture with geocoding
- "Present moment only" verification
- Automatic metadata generation
```

### 🔐 **Cryptographic Verification**
```typescript
// Immutable proof creation
- Local file hashing (SHA-256)
- Blockchain timestamp verification
- IPFS content addressing
- NFT metadata standards (ERC-721)
```

### 🌐 **Decentralized Storage**
```typescript
// IPFS-powered storage
- Pinata integration for reliable pinning
- Multiple IPFS gateways
- Redundant content access
- Immutable content references
```

### 🎯 **User Experience**
```typescript
// Modern, intuitive interface
- Real-time transaction status
- Beautiful toast notifications
- Responsive design (mobile-first)
- Dark/light theme support
```

## 📱 **How It Works**

### **1. Create a Proof Capsule**
```typescript
// Step-by-step process
1. Connect wallet to Sonic Mainnet
2. Use live camera to capture content
3. GPS automatically captures location
4. Add description and metadata
5. Upload to IPFS via Pinata
6. Mint NFT on blockchain
7. Store in database for easy access
```

### **2. View & Manage Capsules**
```typescript
// Gallery features
- Browse all your capsules
- Filter by date, type, location
- View detailed metadata
- Share IPFS links
- Download complete data
```

### **3. Verify Content**
```typescript
// Verification process
- Upload file to verify
- Compare with blockchain hash
- View transaction details
- Check IPFS metadata
- Verify timestamp and location
```

## 🛠️ **Installation & Setup**

### **Prerequisites**
```bash
- Node.js 18+ and npm
- MetaMask or compatible wallet
- Sonic (SONIC) tokens for gas fees
- Pinata account for IPFS storage
```

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/yourusername/proofcapsule.git
cd proofcapsule

# Install dependencies
cd src/client
npm install

# Configure environment
cp env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### **Environment Configuration**
```env
# Smart Contracts (Sonic Mainnet)
RPC_URL=https://rpc.soniclabs.com
NFT_ADDRESS=0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A
REGISTRY_ADDRESS=0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c

# IPFS/Pinata
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_secret_key
NEXT_PUBLIC_PINATA_JWT=your_jwt_token

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Database
DATABASE_URL=your_database_url
```

## 🧪 **Testing & Quality Assurance**

### **Frontend Testing**
```bash
# Run all tests
npm test

# Test coverage
npm run test:coverage

# E2E testing
npm run test:e2e
```

### **Smart Contract Testing**
```bash
# Run contract tests
cd src/contracts
forge test

# Gas optimization
forge test --gas-report
```

### **CI/CD Pipeline**
```yaml
# GitHub Actions
- Automated testing on push
- Contract deployment on main
- Frontend deployment to Vercel
- Database migrations
```

## 📊 **Performance & Metrics**

### **Gas Optimization**
```solidity
// Optimized for Sonic Mainnet
- Registry Contract: 1,070,871 gas
- NFT Contract: 2,240,881 gas
- Total Deployment: 3,361,190 gas
- Cost per Capsule: ~0.17 SONIC
```

### **Storage Efficiency**
```typescript
// IPFS optimization
- Compressed metadata
- Efficient content addressing
- Multiple gateway redundancy
- Automatic pinning management
```

### **User Experience**
```typescript
// Performance metrics
- Page load: <2 seconds
- Transaction confirmation: <5 seconds
- Camera capture: <1 second
- GPS accuracy: ±10 meters
```

## 🔒 **Security & Privacy**

### **Smart Contract Security**
```solidity
// Security features
- OpenZeppelin audited contracts
- Reentrancy protection
- Access control mechanisms
- Emergency pause functionality
```

### **Privacy Protection**
```typescript
// Privacy features
- Local file hashing (no server upload)
- Encrypted metadata storage
- Optional content visibility
- GDPR compliant data handling
```

### **Data Integrity**
```typescript
// Verification features
- Cryptographic hash verification
- Blockchain timestamp validation
- IPFS content addressing
- Immutable transaction records
```

## 🌟 **Advanced Features**

### **Batch Operations**
```solidity
// Efficient bulk creation
- Create multiple capsules in one transaction
- Reduced gas costs for bulk operations
- Batch metadata upload to IPFS
```

### **User Analytics**
```typescript
// Activity tracking
- Capsule creation statistics
- User engagement metrics
- Transaction history
- Performance analytics
```

### **API Integration**
```typescript
// RESTful API endpoints
- GET /api/capsules - List user capsules
- POST /api/capsules - Create new capsule
- GET /api/verify - Verify content
- GET /api/analytics - User statistics
```

## 🚀 **Deployment Guide**

### **Frontend (Vercel)**
```bash
# Automatic deployment
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy on push to main branch
4. Custom domain configuration
```

### **Smart Contracts**
```bash
# Manual deployment
cd src/contracts
forge script script/Deploy.s.sol --rpc-url https://rpc.soniclabs.com --broadcast
```

### **Database (Neon)**
```bash
# Production database
1. Create Neon Postgres instance
2. Run database migrations
3. Configure connection string
4. Set up monitoring
```

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### **Development Guidelines**
```typescript
// Code standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Comprehensive testing
- Documentation updates
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **OpenZeppelin**: Secure smart contract libraries
- **Pinata**: Reliable IPFS pinning service
- **Sonic Labs**: Fast and efficient blockchain infrastructure
- **Vercel**: Seamless deployment platform
- **Next.js**: Powerful React framework
- **Tailwind CSS**: Utility-first styling

## 📞 **Support & Community**

- **Discord**: [Join our community](https://discord.gg/proofcapsule)
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/proofcapsule/issues)
- **Documentation**: [Read the docs](https://docs.proofcapsule.com)
- **Email**: support@proofcapsule.com

## 🎉 **Get Started Today**

Ready to create your first immutable proof? 

[**🚀 Deploy on Vercel**](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/proofcapsule)
[**📖 View Documentation**](https://docs.proofcapsule.com)
[**💬 Join Community**](https://discord.gg/proofcapsule)

---

**Built with ❤️ for the decentralized future**

*ProofCapsule - Where digital content meets blockchain immortality*
