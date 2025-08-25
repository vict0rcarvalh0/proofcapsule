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

// Helper function to add timeout to fetch requests
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - the operation took too long to complete')
    }
    throw error
  }
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
      const response = await fetchWithTimeout(url, {}, 15000) // 15 second timeout for reads
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
      const response = await fetchWithTimeout(`${this.baseUrl}/${id}`, {}, 15000)
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
      console.log('Sending capsule creation request...')
      const response = await fetchWithTimeout(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(capsuleData),
      }, 45000) // 45 second timeout for capsule creation

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create capsule')
      }

      console.log('Capsule creation successful')
      return data
    } catch (error) {
      console.error('Error creating capsule:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create capsule'
      
      // Provide more specific error messages for common issues
      if (errorMessage.includes('timeout')) {
        return {
          success: false,
          error: 'Database operation timed out. Please try again. If the problem persists, your capsule may have been created successfully - check your gallery.'
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Update a capsule
  async updateCapsule(id: number, updateData: UpdateCapsuleData): Promise<ApiResponse<Capsule>> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }, 30000)

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
      const response = await fetchWithTimeout(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      }, 30000)

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