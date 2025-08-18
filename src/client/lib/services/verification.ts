import { Verification } from '@/lib/db/schema'
import { ApiResponse } from './capsules'

export interface VerificationData {
  contentHash: string
  verifierAddress: string
  verificationMethod?: string
  notes?: string
}

export interface VerificationWithCapsule {
  verification: Verification
  capsule: {
    id: number
    tokenId: number
    description: string | null
    contentHash: string
    location: string | null
    isPublic: boolean
    createdAt: Date
    ipfsHash: string | null
    blockNumber: number | null
    transactionHash: string | null
    gasUsed: number | null
  }
}

// Verification API service
export class VerificationService {
  private baseUrl = '/api/verify'

  // Verify content hash
  async verifyContent(verificationData: VerificationData): Promise<ApiResponse<VerificationWithCapsule>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify content')
      }

      return data
    } catch (error) {
      console.error('Error verifying content:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify content'
      }
    }
  }

  // Get verification history
  async getVerifications(params?: {
    capsuleId?: number
    verifier?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<VerificationWithCapsule[]>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.capsuleId) searchParams.append('capsuleId', params.capsuleId.toString())
      if (params?.verifier) searchParams.append('verifier', params.verifier)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())

      const url = `${this.baseUrl}?${searchParams.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch verifications')
      }

      return data
    } catch (error) {
      console.error('Error fetching verifications:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch verifications'
      }
    }
  }

  // Get verifications for a specific capsule
  async getCapsuleVerifications(capsuleId: number, limit = 20, offset = 0): Promise<ApiResponse<VerificationWithCapsule[]>> {
    return this.getVerifications({ capsuleId, limit, offset })
  }

  // Get verifications by a specific verifier
  async getVerifierHistory(verifierAddress: string, limit = 20, offset = 0): Promise<ApiResponse<VerificationWithCapsule[]>> {
    return this.getVerifications({ verifier: verifierAddress, limit, offset })
  }

  // Verify content by hash (convenience method)
  async verifyByHash(contentHash: string, verifierAddress: string, notes?: string): Promise<ApiResponse<VerificationWithCapsule>> {
    return this.verifyContent({
      contentHash,
      verifierAddress,
      verificationMethod: 'hash_match',
      notes
    })
  }
}

// Export singleton instance
export const verificationService = new VerificationService() 