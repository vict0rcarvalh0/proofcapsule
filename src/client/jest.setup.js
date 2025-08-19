// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_NFT_ADDRESS = '0x1234567890123456789012345678901234567890'
process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x0987654321098765432109876543210987654321'
process.env.NEXT_PUBLIC_RPC_URL = 'https://testnet.example.com'
process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = 'test-project-id'
process.env.NEXT_PUBLIC_PINATA_API_KEY = 'test-api-key'
process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY = 'test-secret-key'
process.env.NEXT_PUBLIC_PINATA_JWT = 'test-jwt' 