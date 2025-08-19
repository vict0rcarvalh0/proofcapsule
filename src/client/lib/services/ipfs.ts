// IPFS Service using Pinata API
// This service handles file uploads and metadata storage on IPFS

export interface IPFSMetadata {
  name: string
  description: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
  animation_url?: string
}

export interface IPFSUploadResult {
  IpfsHash: string
  PinSize: number
  Timestamp: string
  isDuplicate?: boolean
}

export interface CapsuleMetadata {
  name: string
  description: string
  location?: string
  createdAt: string
  contentHash: string
  ipfsHash?: string
  isPublic: boolean
  tokenId: number
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

// IPFS Service
export class IPFSService {
  private pinataApiKey: string
  private pinataSecretApiKey: string
  private pinataJWT: string
  private baseUrl = 'https://api.pinata.cloud'

  constructor() {
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
    this.pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || ''
    this.pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT || ''
  }

  // Upload file to IPFS
  async uploadFile(file: File): Promise<IPFSUploadResult> {
    if (!this.pinataApiKey || !this.pinataSecretApiKey) {
      throw new Error('Pinata API credentials not configured')
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretApiKey
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pinata API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        apiKeyLength: this.pinataApiKey.length,
        secretKeyLength: this.pinataSecretApiKey.length
      })
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  // Upload JSON metadata to IPFS
  async uploadMetadata(metadata: IPFSMetadata): Promise<IPFSUploadResult> {
    if (!this.pinataApiKey || !this.pinataSecretApiKey) {
      throw new Error('Pinata API credentials not configured')
    }

    const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretApiKey
      },
      body: JSON.stringify(metadata)
    })

    if (!response.ok) {
      throw new Error(`Failed to upload metadata: ${response.statusText}`)
    }

    return await response.json()
  }

  // Create capsule metadata for NFT
  createCapsuleMetadata(capsule: {
    tokenId: number
    description: string
    location?: string
    contentHash: string
    ipfsHash?: string
    isPublic: boolean
    createdAt: string
  }): CapsuleMetadata {
    return {
      name: `ProofCapsule #${capsule.tokenId}`,
      description: capsule.description,
      location: capsule.location,
      createdAt: capsule.createdAt,
      contentHash: capsule.contentHash,
      ipfsHash: capsule.ipfsHash,
      isPublic: capsule.isPublic,
      tokenId: capsule.tokenId,
      attributes: [
        {
          trait_type: "Content Hash",
          value: capsule.contentHash
        },
        {
          trait_type: "Location",
          value: capsule.location || "Unknown"
        },
        {
          trait_type: "Visibility",
          value: capsule.isPublic ? "Public" : "Private"
        },
        {
          trait_type: "Created At",
          value: new Date(capsule.createdAt).toISOString()
        }
      ]
    }
  }

  // Upload capsule metadata to IPFS
  async uploadCapsuleMetadata(capsule: {
    tokenId: number
    description: string
    location?: string
    contentHash: string
    ipfsHash?: string
    isPublic: boolean
    createdAt: string
  }): Promise<IPFSUploadResult> {
    const metadata = this.createCapsuleMetadata(capsule)
    return await this.uploadMetadata(metadata)
  }

  // Get IPFS gateway URL
  getGatewayUrl(ipfsHash: string, gateway: string = 'https://gateway.pinata.cloud'): string {
    return `${gateway}/ipfs/${ipfsHash}`
  }

  // Get multiple gateway URLs for redundancy
  getGatewayUrls(ipfsHash: string): string[] {
    return [
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      `https://ipfs.io/ipfs/${ipfsHash}`,
      `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
      `https://dweb.link/ipfs/${ipfsHash}`
    ]
  }

  // Validate IPFS hash format
  isValidIPFSHash(hash: string): boolean {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || 
           /^bafy[a-z2-7]{55}$/.test(hash) // CIDv1 format
  }

  // Test API credentials
  async testCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey
        }
      })
      
      return response.ok
    } catch (error) {
      console.error('Credential test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService() 