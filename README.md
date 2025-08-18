# ProofCapsule 🌟

**Immutable Proof of Existence on the Blockchain**

ProofCapsule is a decentralized application that allows users to create timestamped, immutable proofs of their digital content on the blockchain. Upload files, create NFTs with IPFS metadata, and verify content authenticity with cryptographic hashes.

## ✨ Features

### 🔐 **Content Verification**
- **Local Hashing**: Files are hashed locally for privacy
- **Blockchain Timestamp**: Content hashes stored on-chain
- **NFT Creation**: Each capsule becomes a unique NFT
- **IPFS Storage**: Metadata and files stored on decentralized IPFS

### 🌐 **Decentralized Storage**
- **Pinata Integration**: Reliable IPFS pinning service
- **Multiple Gateways**: Redundant IPFS gateway access
- **Metadata Standards**: ERC-721 compatible NFT metadata
- **Content Addressing**: Immutable content references

### 🎨 **User Experience**
- **Modern UI**: Beautiful, responsive interface
- **Real-time Updates**: Live blockchain transaction status
- **Gallery View**: Browse and manage your capsules
- **Verification Tools**: Easy content authenticity checks

### ⚡ **Smart Contracts**
- **ERC-721 NFTs**: Standard NFT implementation
- **Batch Operations**: Create multiple capsules efficiently
- **User Statistics**: Track your capsule history
- **Sonic Testnet**: Deployed on fast, low-cost network

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible wallet
- Sonic Testnet tokens (get from [faucet](https://faucet.testnet.soniclabs.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proofcapsule.git
   cd proofcapsule
   ```

2. **Install dependencies**
   ```bash
   cd src/client
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `src/client` directory:

```env
# Smart Contract Deployment
PRIVATE_KEY=0x...
RPC_URL=https://rpc.testnet.soniclabs.com
ETHERSCAN_API_KEY=optional_for_verification
NFT_ADDRESS=0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A
REGISTRY_ADDRESS=0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c

# IPFS/Pinata Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
```

### Getting API Keys

1. **Pinata API Keys**: Sign up at [pinata.cloud](https://pinata.cloud)
   - Create an account
   - Generate API keys in your dashboard
   - Add to environment variables

2. **Sonic Testnet Tokens**: Get free tokens from the [faucet](https://faucet.testnet.soniclabs.com)

## 📱 Usage

### Creating a Proof Capsule

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Upload Files**: Drag & drop or select files to upload
3. **Add Details**: Enter description and location (optional)
4. **Set Visibility**: Choose public or private
5. **Create Capsule**: Click "Create Proof Capsule"

The process will:
- Hash your files locally
- Upload files to IPFS via Pinata
- Create NFT metadata and upload to IPFS
- Mint NFT on Sonic Testnet
- Store transaction data in database

### Viewing Your Capsules

- **Gallery**: Browse all your capsules with filters
- **View Details**: Click "View" to see full capsule information
- **Share**: Share IPFS links or verification URLs
- **Download**: Download complete metadata and blockchain data

### Verifying Content

- **Hash Verification**: Verify content hashes match blockchain records
- **NFT Metadata**: View IPFS-stored metadata
- **Transaction History**: Check blockchain transaction details

## 🏗️ Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Wagmi**: Ethereum wallet integration
- **Viem**: Ethereum interaction library

### Backend
- **Next.js API Routes**: Serverless backend functions
- **SQLite**: Local development database
- **Vercel Postgres**: Production database
- **Drizzle ORM**: Type-safe database operations

### Blockchain
- **Solidity**: Smart contract language
- **Foundry**: Development and testing framework
- **Sonic Testnet**: Fast, low-cost testnet
- **ERC-721**: NFT standard implementation

### Storage
- **IPFS**: Decentralized content addressing
- **Pinata**: Reliable IPFS pinning service
- **Multiple Gateways**: Redundant access points

## 📁 Project Structure

```
proofcapsule/
├── src/
│   ├── client/                 # Frontend application
│   │   ├── app/               # Next.js app router
│   │   │   ├── api/           # API routes
│   │   │   ├── capture/       # Create capsules
│   │   │   ├── gallery/       # Browse capsules
│   │   │   ├── verify/        # Verify content
│   │   │   └── profile/       # User profile
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities and services
│   │   │   ├── services/     # API and contract services
│   │   │   ├── db/           # Database configuration
│   │   │   └── utils/        # Utility functions
│   │   └── public/           # Static assets
│   └── contracts/            # Smart contracts
│       ├── src/              # Solidity contracts
│       ├── test/             # Contract tests
│       └── script/           # Deployment scripts
├── scripts/                  # Build and deployment scripts
├── docs/                     # Documentation
└── README.md                # This file
```

## 🔗 Smart Contracts

### Deployed Addresses (Sonic Testnet)
- **ProofCapsuleNFT**: `0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A`
- **ProofCapsuleRegistry**: `0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c`

### Contract Functions

#### ProofCapsuleNFT
- `createProofCapsule()`: Mint new NFT with content hash
- `verifyContentHash()`: Verify content hash exists
- `getCapsule()`: Get capsule data by token ID
- `tokenURI()`: Get IPFS metadata URI

#### ProofCapsuleRegistry
- `createBatchCapsules()`: Create multiple capsules efficiently
- `getUserStats()`: Get user statistics

## 🧪 Testing

### Frontend Tests
```bash
cd src/client
npm test
```

### Smart Contract Tests
```bash
cd src/contracts
forge test
```

### Integration Tests
```bash
# Test complete flow
npm run test:integration
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Smart Contracts
```bash
# Deploy to Sonic Testnet
./scripts/deploy.sh

# Verify contracts
forge verify-contract --chain-id 14601
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Smart contract libraries
- **Pinata**: IPFS pinning service
- **Sonic Labs**: Testnet infrastructure
- **Vercel**: Hosting and deployment
- **Next.js**: React framework
- **Tailwind CSS**: Styling framework

## 📞 Support

- **Discord**: Join our community
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check the docs folder
- **Email**: support@proofcapsule.com

---

**Built with ❤️ for the decentralized future**
