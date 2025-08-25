import { sonicMainnet, sonicTestnet } from './wagmi'

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [sonicMainnet.id]: {
    nft: '0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A',
    registry: '0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c',
  },
  [sonicTestnet.id]: {
    nft: '0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A', // Using mainnet addresses for testing
    registry: '0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c', // Using mainnet addresses for testing
  },
} as const

// Helper function to get contract addresses for a specific chain ID
export function getContractAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[sonicMainnet.id]
}

// Helper function to check if a chain ID is supported
export function isSupportedChain(chainId: number): boolean {
  return chainId in CONTRACT_ADDRESSES
}

// Get the current network name
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case sonicMainnet.id:
      return 'Sonic Mainnet'
    case sonicTestnet.id:
      return 'Sonic Testnet'
    default:
      return 'Unknown Network'
  }
} 