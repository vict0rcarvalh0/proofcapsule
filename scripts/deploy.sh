#!/bin/bash

# ProofCapsule Smart Contract Deployment Script
# Deploys to Sonic Mainnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ProofCapsule Smart Contract Deployment${NC}"
echo -e "${YELLOW}Target: Sonic Mainnet${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONTRACTS_DIR="$ROOT_DIR/src/contracts"

# Check if .env file exists
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create a .env file in the root directory with your configuration."
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"

# Navigate to contracts directory
cd "$CONTRACTS_DIR"

echo -e "${YELLOW}📦 Building contracts...${NC}"
forge build --sizes

echo -e "${YELLOW}🧪 Running tests...${NC}"
forge test -vvv

echo -e "${YELLOW}🚀 Deploying to Sonic Mainnet...${NC}"

# Copy .env to contracts directory for deployment
cp "$ROOT_DIR/.env" "$CONTRACTS_DIR/.env"

# Deploy contracts
forge script script/Deploy.s.sol \
    --rpc-url https://rpc.soniclabs.com \
    --broadcast \
    --verify

# Clean up
rm "$CONTRACTS_DIR/.env"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Update your frontend environment variables with the new contract addresses"
echo "2. Deploy your frontend to Vercel"
echo "3. Test the complete flow on mainnet"
echo ""
echo -e "${GREEN}🎉 ProofCapsule is now live on Sonic Mainnet!${NC}" 