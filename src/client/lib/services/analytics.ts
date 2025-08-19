import { UserStats } from '@/lib/db/schema'
import { ApiResponse } from './capsules'

// Analytics service for fetching platform statistics

export interface AnalyticsResponse {
  success: boolean
  data?: {
    totalCapsules: number
    totalUsers: number
    totalVerifications: number
    todayCapsules: number
    todayUsers: number
  }
  error?: string
}

export interface UserAnalyticsResponse {
  success: boolean
  data?: {
    totalCapsules: number
    publicCapsules: number
    privateCapsules: number
    totalVerifications: number
    firstCapsuleAt: string | null
    lastCapsuleAt: string | null
  }
  error?: string
}

// Analytics API service
export class AnalyticsService {
  private baseUrl = '/api/analytics'

  // Get global platform analytics
  async getGlobalStats(): Promise<ApiResponse<AnalyticsResponse>> {
    try {
      const response = await fetch(this.baseUrl)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch global stats')
      }

      return data
    } catch (error) {
      console.error('Error fetching global stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch global stats'
      }
    }
  }

  // Get user-specific analytics
  async getUserStats(walletAddress: string): Promise<ApiResponse<UserAnalyticsResponse>> {
    try {
      const url = `${this.baseUrl}?type=user&wallet=${walletAddress}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user stats')
      }

      return data
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user stats'
      }
    }
  }

  // Update daily analytics (usually called by cron job)
  async updateDailyAnalytics(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update analytics')
      }

      return data
    } catch (error) {
      console.error('Error updating analytics:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update analytics'
      }
    }
  }

  // Get analytics with specific type
  async getAnalytics(type: 'global' | 'user', walletAddress?: string): Promise<ApiResponse<AnalyticsResponse | UserAnalyticsResponse>> {
    if (type === 'user' && !walletAddress) {
      return {
        success: false,
        error: 'Wallet address required for user analytics'
      }
    }

    if (type === 'user') {
      return this.getUserStats(walletAddress!)
    }

    return this.getGlobalStats()
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService() 