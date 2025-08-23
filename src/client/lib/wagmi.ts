import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet } from 'wagmi/chains'

// Sonic Mainnet configuration
const sonicMainnet = {
  id: 146,
  name: 'Sonic Mainnet',
  network: 'sonic-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'SONIC',
  },
  rpcUrls: {
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL || 'https://rpc.soniclabs.com'] },
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL || 'https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'Sonic Explorer', url: 'https://explorer.soniclabs.com' },
    default: { name: 'Sonic Explorer', url: 'https://explorer.soniclabs.com' },
  },
} as const

// Sonic Testnet configuration (for reference)
const sonicTestnet = {
  id: 14601,
  name: 'Sonic Testnet',
  network: 'sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    public: { http: ['https://rpc.testnet.soniclabs.com'] },
    default: { http: ['https://rpc.testnet.soniclabs.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'Sonic Testnet Explorer', url: 'https://explorer.testnet.soniclabs.com' },
    default: { name: 'Sonic Testnet Explorer', url: 'https://explorer.testnet.soniclabs.com' },
  },
} as const

// Set up wagmi config with RainbowKit
export const config = getDefaultConfig({
  appName: 'ProofCapsule',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: [sonicMainnet, sonicTestnet, mainnet], // Mainnet first as default
  ssr: true,
}) 