# ProofCapsule Deployment Guide

## Overview

This guide will help you deploy the ProofCapsule smart contracts to Sonic Blaze Testnet using Foundry.

## Prerequisites

1. **Foundry Installed**: Make sure you have Foundry installed on your system
2. **Private Key**: You'll need a private key with some testnet tokens
3. **RPC Access**: Access to Sonic Blaze Testnet RPC

## Sonic Blaze Testnet Configuration

- **Network Name**: Sonic Blaze Testnet
- **Chain ID**: 14601
- **RPC URL**: https://rpc.blaze.soniclabs.com
- **Explorer**: https://explorer.blaze.soniclabs.com
- **Currency**: S (Sonic)

## Step 1: Environment Setup

1. Create a `.env` file in the root directory:
```bash
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.blaze.soniclabs.com
# Optional: Only needed for contract verification on explorer
# ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

2. Load the environment variables:
```bash
source .env
```

## Step 2: Get Testnet Tokens

1. Visit the Sonic Blaze Testnet faucet to get test tokens
2. Make sure your wallet has enough tokens for deployment

## Step 3: Deploy Contracts

Run the deployment script:

```bash
# From the root directory
./scripts/deploy.sh

# Or manually from the contracts directory
cd src/contracts
forge script script/Deploy.s.sol --rpc-url https://rpc.blaze.soniclabs.com --broadcast
```

**Note:** Remove `--verify` flag if you don't have an Etherscan API key. Contract verification is optional.

Or if you want to simulate first:

```bash
cd src/contracts
forge script script/Deploy.s.sol --rpc-url https://rpc.blaze.soniclabs.com --dry-run
```

## Step 4: Verify Deployment

After deployment, you should see output similar to:

```
ProofCapsuleNFT deployed at: 0x...
ProofCapsuleRegistry deployed at: 0x...
Registry set in NFT contract

=== ProofCapsule Deployment Complete ===
Network: Sonic Blaze Testnet
ProofCapsuleNFT: 0x...
ProofCapsuleRegistry: 0x...
Deployer: 0x...
========================================
```

## Step 5: Update Frontend Configuration

Update your frontend configuration in `src/client/lib/wagmi.ts`:

```typescript
// Sonic Blaze Testnet configuration
const sonicBlazeTestnet = {
  id: 14601,
  name: 'Sonic Blaze Testnet',
  network: 'sonic-blaze-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    public: { http: ['https://rpc.blaze.soniclabs.com'] },
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'Sonic Blaze Testnet Explorer', url: 'https://explorer.blaze.soniclabs.com' },
    default: { name: 'Sonic Blaze Testnet Explorer', url: 'https://explorer.blaze.soniclabs.com' },
  },
} as const

// Update the config to use the deployed contract addresses
export const config = getDefaultConfig({
  appName: 'ProofCapsule',
  projectId: 'your_project_id',
  chains: [sonicBlazeTestnet],
  ssr: true,
})
```

## Contract Addresses

After deployment, save these addresses:

- **ProofCapsuleNFT**: `0x...` (Main NFT contract)
- **ProofCapsuleRegistry**: `0x...` (Registry contract)

## Testing the Deployment

1. **Create a ProofCapsule**:
```solidity
// Call createProofCapsule on the NFT contract
proofCapsuleNFT.createProofCapsule(
    contentHash,
    description,
    location,
    ipfsHash,
    isPublic
)
```

2. **Verify a Hash**:
```solidity
// Call verifyContentHash on the NFT contract
uint256 tokenId = proofCapsuleNFT.verifyContentHash(contentHash);
```

3. **Get User Stats**:
```solidity
// Call getUserStats on the registry contract
ProofCapsuleRegistry.UserStats memory stats = registry.getUserStats(userAddress);
```

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Make sure you have enough testnet tokens
2. **RPC Issues**: Check if the RPC endpoint is accessible
3. **Verification Failures**: Ensure your Etherscan API key is correct

### Useful Commands

```bash
# Check contract bytecode
cd src/contracts && forge inspect ProofCapsuleNFT bytecode

# Verify contract on explorer (optional - requires Etherscan API key)
cd src/contracts && forge verify-contract <contract_address> src/ProofCapsuleNFT.sol:ProofCapsuleNFT --chain-id 14601

# Get deployment info
cd src/contracts && forge script script/Deploy.s.sol --rpc-url https://rpc.blaze.soniclabs.com --dry-run
```

## Security Notes

- Never commit your private key to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet deployment
- Consider using a multisig wallet for mainnet deployment

## Next Steps

After successful deployment:

1. Update frontend configuration with contract addresses
2. Test all functionality on testnet
3. Integrate with IPFS for content storage
4. Set up monitoring and analytics
5. Plan mainnet deployment strategy 