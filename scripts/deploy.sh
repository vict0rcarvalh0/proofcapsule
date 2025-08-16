#!/bin/bash

# ProofCapsule Deployment Script for Sonic Blaze Testnet
# Usage: ./scripts/deploy.sh

set -e

# Store the root directory path
ROOT_DIR=$(pwd)

echo "🚀 ProofCapsule Deployment to Sonic Blaze Testnet"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your PRIVATE_KEY"
    echo "Example:"
    echo "PRIVATE_KEY=your_private_key_here"
    echo "RPC_URL=https://rpc.blaze.soniclabs.com"
    exit 1
fi

# Load environment variables from root directory
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

# Export environment variables so they're available in subdirectories
export PRIVATE_KEY
export RPC_URL
export ETHERSCAN_API_KEY

echo "✅ Environment loaded"
echo "📡 RPC URL: ${RPC_URL:-https://rpc.blaze.soniclabs.com}"

# Build contracts
echo "🔨 Building contracts..."
cd src/contracts && forge build

# Run tests
echo "🧪 Running tests..."
forge test

echo "✅ All tests passed!"

# Ask for confirmation
read -p "🤔 Ready to deploy to Sonic Blaze Testnet? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy contracts
echo "🚀 Deploying contracts..."

# Copy .env to contracts directory for Foundry to find it
cp "$ROOT_DIR/.env" .env

# Check if Etherscan API key is available for verification
if [ -n "$ETHERSCAN_API_KEY" ]; then
    echo "🔍 Contract verification enabled (Etherscan API key found)"
    forge script script/Deploy.s.sol \
        --rpc-url "${RPC_URL:-https://rpc.blaze.soniclabs.com}" \
        --private-key "$PRIVATE_KEY" \
        --broadcast \
        --verify
else
    echo "⚠️  Contract verification skipped (no Etherscan API key)"
    forge script script/Deploy.s.sol \
        --rpc-url "${RPC_URL:-https://rpc.blaze.soniclabs.com}" \
        --private-key "$PRIVATE_KEY" \
        --broadcast
fi

# Clean up
rm src/contracts/.env

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your frontend configuration with the deployed contract addresses"
echo "2. Test the contracts on Sonic Blaze Testnet"
echo "3. Get testnet tokens from the faucet if needed"
echo ""
echo "🔗 Useful links:"
echo "- Sonic Blaze Testnet Explorer: https://explorer.blaze.soniclabs.com"
echo "- RPC Endpoint: https://rpc.blaze.soniclabs.com" 