// Smart Contract Service
// Handles interactions with deployed ProofCapsule contracts

import { getContract } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  PROOF_CAPSULE_NFT: process.env.NEXT_PUBLIC_NFT_ADDRESS || process.env.NFT_ADDRESS || '0x8F840F2d5df100C5c3b0C3d181c3EFA3d6C5068A',
  PROOF_CAPSULE_REGISTRY: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || process.env.REGISTRY_ADDRESS || '0x45b1f38d1adfB5A9FFAA81b996a53bE78A33cF0c'
} as const

// Contract ABIs (simplified versions)
export const PROOF_CAPSULE_NFT_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isPublic",
        "type": "bool"
      }
    ],
    "name": "createProofCapsule",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyContentHash",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getCapsule",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isPublic",
            "type": "bool"
          }
        ],
        "internalType": "struct ProofCapsuleNFT.ProofCapsule",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const PROOF_CAPSULE_REGISTRY_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "contentHashes",
        "type": "bytes32[]"
      },
      {
        "internalType": "string[]",
        "name": "descriptions",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "locations",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "ipfsHashes",
        "type": "string[]"
      },
      {
        "internalType": "bool[]",
        "name": "isPublic",
        "type": "bool[]"
      }
    ],
    "name": "createBatchCapsules",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserStats",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalCapsules",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "publicCapsules",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "privateCapsules",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalVerifications",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "firstCapsuleTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastCapsuleTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct ProofCapsuleRegistry.UserStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Contract service class
export class ContractService {
  private publicClient: any | null
  private walletClient: any | null

  constructor(publicClient: any | null, walletClient: any | null) {
    this.publicClient = publicClient
    this.walletClient = walletClient
  }

  // Get NFT contract instance
  getNFTContract() {
    if (!this.publicClient) throw new Error('Public client not ready')
    return getContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_NFT as `0x${string}`,
      abi: PROOF_CAPSULE_NFT_ABI,
      client: this.publicClient
    })
  }

  // Get Registry contract instance
  getRegistryContract() {
    if (!this.publicClient) throw new Error('Public client not ready')
    return getContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_REGISTRY as `0x${string}`,
      abi: PROOF_CAPSULE_REGISTRY_ABI,
      client: this.publicClient
    })
  }

  // Create a single ProofCapsule
  async createProofCapsule(params: {
    contentHash: string
    description: string
    location: string
    ipfsHash: string
    isPublic: boolean
  }) {
    if (!this.walletClient) throw new Error('Connect your wallet first')
    const hash = await this.walletClient.writeContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_NFT as `0x${string}`,
      abi: PROOF_CAPSULE_NFT_ABI,
      functionName: 'createProofCapsule',
      args: [
        params.contentHash as `0x${string}`,
        params.description,
        params.location,
        params.ipfsHash,
        params.isPublic
      ]
    })

    return hash
  }

  // Verify content hash
  async verifyContentHash(contentHash: string): Promise<bigint> {
    if (!this.publicClient) throw new Error('Public client not ready')
    return await this.publicClient.readContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_NFT as `0x${string}`,
      abi: PROOF_CAPSULE_NFT_ABI,
      functionName: 'verifyContentHash',
      args: [contentHash as `0x${string}`]
    })
  }

  // Get capsule data
  async getCapsule(tokenId: bigint) {
    if (!this.publicClient) throw new Error('Public client not ready')
    return await this.publicClient.readContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_NFT as `0x${string}`,
      abi: PROOF_CAPSULE_NFT_ABI,
      functionName: 'getCapsule',
      args: [tokenId]
    })
  }

  // Get token URI (IPFS metadata)
  async getTokenURI(tokenId: bigint): Promise<string> {
    if (!this.publicClient) throw new Error('Public client not ready')
    return await this.publicClient.readContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_NFT as `0x${string}`,
      abi: PROOF_CAPSULE_NFT_ABI,
      functionName: 'tokenURI',
      args: [tokenId]
    })
  }

  // Get user stats from registry
  async getUserStats(userAddress: string) {
    if (!this.publicClient) throw new Error('Public client not ready')
    return await this.publicClient.readContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_REGISTRY as `0x${string}`,
      abi: PROOF_CAPSULE_REGISTRY_ABI,
      functionName: 'getUserStats',
      args: [userAddress as `0x${string}`]
    })
  }

  // Create multiple capsules in batch
  async createBatchCapsules(params: {
    contentHashes: string[]
    descriptions: string[]
    locations: string[]
    ipfsHashes: string[]
    isPublic: boolean[]
  }) {
    if (!this.walletClient) throw new Error('Connect your wallet first')
    const hash = await this.walletClient.writeContract({
      address: CONTRACT_ADDRESSES.PROOF_CAPSULE_REGISTRY as `0x${string}`,
      abi: PROOF_CAPSULE_REGISTRY_ABI,
      functionName: 'createBatchCapsules',
      args: [
        params.contentHashes.map(h => h as `0x${string}`),
        params.descriptions,
        params.locations,
        params.ipfsHashes,
        params.isPublic
      ]
    })

    return hash
  }

  // Wait for transaction and get receipt
  async waitForTransaction(hash: `0x${string}`) {
    if (!this.publicClient) throw new Error('Public client not ready')
    return await this.publicClient.waitForTransactionReceipt({ hash })
  }

  // Get transaction details
  async getTransaction(hash: `0x${string}`) {
    if (!this.publicClient) throw new Error('Public client not ready')
    return await this.publicClient.getTransaction({ hash })
  }
}

// Hook to use contract service
export function useContractService() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  // Do not throw on mount; return a service that guards methods internally
  return new ContractService(publicClient ?? null, walletClient ?? null)
} 