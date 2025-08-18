#!/bin/bash

echo "🔧 Pinata API Key Configuration Helper"
echo "======================================"
echo ""

echo "Please enter your Pinata API Key (should be ~24 characters):"
read -r API_KEY

echo "Please enter your Pinata Secret API Key (should be 64 characters):"
read -r SECRET_KEY

echo "Please enter your Pinata JWT Token (should be 200+ characters):"
read -r JWT_TOKEN

echo ""
echo "📝 Updating .env file..."

# Create the .env file with the correct values
cat > .env << EOF
# Smart Contract Deployment
PRIVATE_KEY=0x...
RPC_URL=https://rpc.testnet.soniclabs.com
ETHERSCAN_API_KEY=optional_for_verification
NFT_ADDRESS=0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A
REGISTRY_ADDRESS=0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c

# IPFS/Pinata Configuration
NEXT_PUBLIC_PINATA_API_KEY=${API_KEY}
NEXT_PUBLIC_PINATA_SECRET_API_KEY=${SECRET_KEY}
NEXT_PUBLIC_PINATA_JWT=${JWT_TOKEN}
EOF

echo "✅ .env file updated successfully!"
echo ""
echo "📊 Key Lengths:"
echo "  API Key: ${#API_KEY} characters"
echo "  Secret Key: ${#SECRET_KEY} characters"
echo "  JWT Token: ${#JWT_TOKEN} characters"
echo ""
echo "🔄 Please restart your development server:"
echo "   npm run dev" 