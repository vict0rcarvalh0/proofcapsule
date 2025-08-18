export interface ActivityItem {
  id: number
  action: string
  description: string
  timestamp: Date
  type: 'capsule' | 'verification'
  tokenId?: number
  capsuleId?: number
}

export interface ActivityResponse {
  success: boolean
  data?: ActivityItem[]
  error?: string
}

export class ActivityService {
  private baseUrl = '/api/analytics/activity'

  async getUserActivity(walletAddress: string, limit: number = 10): Promise<ActivityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?walletAddress=${walletAddress}&limit=${limit}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Convert timestamp strings to Date objects
        data.data = data.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }
      
      return data
    } catch (error) {
      console.error('Error fetching user activity:', error)
      return {
        success: false,
        error: 'Failed to fetch user activity'
      }
    }
  }
}

export const activityService = new ActivityService() 