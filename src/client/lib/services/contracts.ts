// Smart Contract Service
// Handles interactions with deployed ProofCapsule contracts

import { PublicClient, WalletClient, getContract, parseAbi } from 'viem'
import { getContractAddresses, isSupportedChain, getNetworkName } from '../contracts'
import { usePublicClient, useWalletClient } from 'wagmi'

// Contract ABI for ProofCapsuleNFT
const PROOF_CAPSULE_ABI = parseAbi([
  'function createProofCapsule(bytes32 contentHash, string description, string location, string ipfsHash, bool isPublic) external returns (uint256)',
  'function verifyContentHash(bytes32 contentHash) external view returns (bool)',
  'function getCapsule(uint256 tokenId) external view returns (bytes32 contentHash, string description, string location, string ipfsHash, bool isPublic, uint256 createdAt)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function totalSupply() external view returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
])

// Contract ABI for ProofCapsuleRegistry
const REGISTRY_ABI = parseAbi([
  'function createBatchCapsules(bytes32[] contentHashes, string[] descriptions, string[] locations, string[] ipfsHashes, bool[] isPublic) external returns (uint256[])',
  'function getUserStats(address user) external view returns (uint256 totalCapsules, uint256 publicCapsules, uint256 privateCapsules, uint256 firstCapsuleAt, uint256 lastCapsuleAt)',
])

export interface CreateCapsuleParams {
  contentHash: string
  description: string
  location: string
  ipfsHash: string
  isPublic: boolean
}

export interface CapsuleData {
  contentHash: string
  description: string
  location: string
  ipfsHash: string
  isPublic: boolean
  createdAt: bigint
}

export interface UserStats {
  totalCapsules: bigint
  publicCapsules: bigint
  privateCapsules: bigint
  firstCapsuleAt: bigint
  lastCapsuleAt: bigint
}

export class ContractService {
  private publicClient: PublicClient | null
  private walletClient: WalletClient | null

  constructor(publicClient: PublicClient | null, walletClient: WalletClient | null) {
    this.publicClient = publicClient
    this.walletClient = walletClient
  }

  // Get contract addresses for the current network
  private getCurrentContractAddresses(chainId: number) {
    return getContractAddresses(chainId)
  }

  // Check if the current network is supported
  private checkNetworkSupport(chainId: number) {
    if (!isSupportedChain(chainId)) {
      throw new Error(`Unsupported network: ${getNetworkName(chainId)} (Chain ID: ${chainId}). Please switch to Sonic Mainnet or Sonic Blaze Testnet.`)
    }
  }

  // Create a proof capsule
  async createProofCapsule(params: CreateCapsuleParams): Promise<string> {
    if (!this.publicClient || !this.walletClient) {
      throw new Error('Wallet not connected')
    }

    const chainId = await this.publicClient.getChainId()
    this.checkNetworkSupport(chainId)
    
    const addresses = this.getCurrentContractAddresses(chainId)
    console.log(`Creating capsule on ${getNetworkName(chainId)} (Chain ID: ${chainId})`)
    console.log(`Using NFT contract: ${addresses.nft}`)

    const { contentHash, description, location, ipfsHash, isPublic } = params

    const hash = await this.walletClient.writeContract({
      address: addresses.nft as `0x${string}`,
      abi: PROOF_CAPSULE_ABI,
      functionName: 'createProofCapsule',
      args: [contentHash as `0x${string}`, description, location, ipfsHash, isPublic],
    })

    return hash
  }

  // Verify content hash exists
  async verifyContentHash(contentHash: string): Promise<boolean> {
    if (!this.publicClient) {
      throw new Error('Public client not available')
    }

    const chainId = await this.publicClient.getChainId()
    this.checkNetworkSupport(chainId)
    
    const addresses = this.getCurrentContractAddresses(chainId)

    return await this.publicClient.readContract({
      address: addresses.nft as `0x${string}`,
      abi: PROOF_CAPSULE_ABI,
      functionName: 'verifyContentHash',
      args: [contentHash as `0x${string}`],
    })
  }

  // Get capsule data by token ID
  async getCapsule(tokenId: bigint): Promise<CapsuleData> {
    if (!this.publicClient) {
      throw new Error('Public client not available')
    }

    const chainId = await this.publicClient.getChainId()
    this.checkNetworkSupport(chainId)
    
    const addresses = this.getCurrentContractAddresses(chainId)

    const [contentHash, description, location, ipfsHash, isPublic, createdAt] = await this.publicClient.readContract({
      address: addresses.nft as `0x${string}`,
      abi: PROOF_CAPSULE_ABI,
      functionName: 'getCapsule',
      args: [tokenId],
    })

    return {
      contentHash,
      description,
      location,
      ipfsHash,
      isPublic,
      createdAt,
    }
  }

  // Get token URI
  async getTokenURI(tokenId: bigint): Promise<string> {
    if (!this.publicClient) {
      throw new Error('Public client not available')
    }

    const chainId = await this.publicClient.getChainId()
    this.checkNetworkSupport(chainId)
    
    const addresses = this.getCurrentContractAddresses(chainId)

    return await this.publicClient.readContract({
      address: addresses.nft as `0x${string}`,
      abi: PROOF_CAPSULE_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
    })
  }

  // Get user statistics
  async getUserStats(walletAddress: string): Promise<UserStats> {
    if (!this.publicClient) {
      throw new Error('Public client not available')
    }

    const chainId = await this.publicClient.getChainId()
    this.checkNetworkSupport(chainId)
    
    const addresses = this.getCurrentContractAddresses(chainId)

    const [totalCapsules, publicCapsules, privateCapsules, firstCapsuleAt, lastCapsuleAt] = await this.publicClient.readContract({
      address: addresses.registry as `0x${string}`,
      abi: REGISTRY_ABI,
      functionName: 'getUserStats',
      args: [walletAddress as `0x${string}`],
    })

    return {
      totalCapsules,
      publicCapsules,
      privateCapsules,
      firstCapsuleAt,
      lastCapsuleAt,
    }
  }

  // Create multiple capsules in batch
  async createBatchCapsules(capsules: CreateCapsuleParams[]): Promise<string[]> {
    if (!this.publicClient || !this.walletClient) {
      throw new Error('Wallet not connected')
    }

    const chainId = await this.publicClient.getChainId()
    this.checkNetworkSupport(chainId)
    
    const addresses = this.getCurrentContractAddresses(chainId)

    const contentHashes = capsules.map(c => c.contentHash as `0x${string}`)
    const descriptions = capsules.map(c => c.description)
    const locations = capsules.map(c => c.location)
    const ipfsHashes = capsules.map(c => c.ipfsHash)
    const isPublic = capsules.map(c => c.isPublic)

    const hash = await this.walletClient.writeContract({
      address: addresses.registry as `0x${string}`,
      abi: REGISTRY_ABI,
      functionName: 'createBatchCapsules',
      args: [contentHashes, descriptions, locations, ipfsHashes, isPublic],
    })

    return [hash]
  }

  // Wait for transaction confirmation
  async waitForTransaction(hash: string) {
    if (!this.publicClient) {
      throw new Error('Public client not available')
    }

    return await this.publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` })
  }

  // Get transaction details
  async getTransaction(hash: string) {
    if (!this.publicClient) {
      throw new Error('Public client not available')
    }

    return await this.publicClient.getTransaction({ hash: hash as `0x${string}` })
  }
}

// Hook to get contract service
export function useContractService() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  if (!publicClient || !walletClient) {
    return new ContractService(null, null)
  }

  return new ContractService(publicClient, walletClient)
} 