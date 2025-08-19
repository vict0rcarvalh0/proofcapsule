import { Capsule } from '@/lib/db/schema'

// Types for API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface CreateCapsuleData {
  tokenId: number
  walletAddress: string
  contentHash: string
  description?: string
  location?: string
  ipfsHash?: string
  isPublic?: boolean
  blockNumber?: number
  transactionHash?: string
  gasUsed?: number
}

export interface UpdateCapsuleData {
  description?: string
  location?: string
  isPublic?: boolean
}

// Capsules API service
export class CapsulesService {
  private baseUrl = '/api/capsules'

  // Get all capsules with optional filters
  async getCapsules(params?: {
    wallet?: string
    public?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Capsule[]>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.wallet) searchParams.append('wallet', params.wallet)
      if (params?.public !== undefined) searchParams.append('public', params.public.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())

      const url = `${this.baseUrl}?${searchParams.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch capsules')
      }

      return data
    } catch (error) {
      console.error('Error fetching capsules:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch capsules'
      }
    }
  }

  // Get a specific capsule by ID
  async getCapsule(id: number): Promise<ApiResponse<Capsule>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch capsule')
      }

      return data
    } catch (error) {
      console.error('Error fetching capsule:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch capsule'
      }
    }
  }

  // Create a new capsule
  async createCapsule(capsuleData: CreateCapsuleData): Promise<ApiResponse<Capsule>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(capsuleData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create capsule')
      }

      return data
    } catch (error) {
      console.error('Error creating capsule:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create capsule'
      }
    }
  }

  // Update a capsule
  async updateCapsule(id: number, updateData: UpdateCapsuleData): Promise<ApiResponse<Capsule>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update capsule')
      }

      return data
    } catch (error) {
      console.error('Error updating capsule:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update capsule'
      }
    }
  }

  // Delete a capsule
  async deleteCapsule(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete capsule')
      }

      return data
    } catch (error) {
      console.error('Error deleting capsule:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete capsule'
      }
    }
  }

  // Get user's capsules
  async getUserCapsules(walletAddress: string, limit = 20, offset = 0): Promise<ApiResponse<Capsule[]>> {
    return this.getCapsules({ wallet: walletAddress, limit, offset })
  }

  // Get public capsules
  async getPublicCapsules(limit = 20, offset = 0): Promise<ApiResponse<Capsule[]>> {
    return this.getCapsules({ public: true, limit, offset })
  }

  // Get private capsules
  async getPrivateCapsules(walletAddress: string, limit = 20, offset = 0): Promise<ApiResponse<Capsule[]>> {
    return this.getCapsules({ wallet: walletAddress, public: false, limit, offset })
  }
}

// Export singleton instance
export const capsulesService = new CapsulesService() 