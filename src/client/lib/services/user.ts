export interface ExportData {
  exportDate: string
  walletAddress: string
  user: any
  capsules: any[]
  verifications: any[]
  analytics: any
  summary: {
    totalCapsules: number
    totalVerifications: number
    firstCapsule: string | null
    lastCapsule: string | null
  }
}

export interface UserResponse {
  success: boolean
  data?: ExportData
  message?: string
  error?: string
}

export class UserService {
  async exportUserData(walletAddress: string): Promise<UserResponse> {
    try {
      const response = await fetch(`/api/user/export?walletAddress=${walletAddress}`)
      return await response.json()
    } catch (error) {
      console.error('Error exporting user data:', error)
      return {
        success: false,
        error: 'Failed to export user data'
      }
    }
  }

  async deleteAccount(walletAddress: string): Promise<UserResponse> {
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress })
      })
      return await response.json()
    } catch (error) {
      console.error('Error deleting account:', error)
      return {
        success: false,
        error: 'Failed to delete account'
      }
    }
  }

  downloadExportData(data: ExportData, walletAddress: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proofcapsule-export-${walletAddress}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const userService = new UserService() 