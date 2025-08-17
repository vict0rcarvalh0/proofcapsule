"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Wallet, Settings, Shield, Download, Trash2, Bell, Globe, Lock, Key, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import { analyticsService, type UserAnalytics } from "@/lib/services"
import { formatDate } from "@/lib/utils/browser"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [userStats, setUserStats] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)

  // Load user stats on component mount
  useEffect(() => {
    const loadUserStats = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await analyticsService.getUserStats(address)
        
        if (response.success && response.data) {
          setUserStats(response.data)
        } else {
          setError(response.error || 'Failed to load user stats')
        }
      } catch (error) {
        console.error('Error loading user stats:', error)
        setError('Failed to load user stats')
      } finally {
        setLoading(false)
      }
    }

    loadUserStats()
  }, [isConnected, address])

  const formatUserDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysActive = () => {
    if (!userStats?.firstCapsuleAt) return 0
    const firstDate = new Date(userStats.firstCapsuleAt)
    const now = new Date()
    return Math.ceil((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Wallet connection is handled by wagmi

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <User className="w-4 h-4 mr-2" />
            Account Management
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Your Profile
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your account settings, wallet connection, and Proof Capsule preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Connection
                </CardTitle>
                <CardDescription>
                  Connect your wallet to create and manage Proof Capsules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected && address ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Connected Wallet</p>
                          <p className="text-sm text-muted-foreground font-mono">{address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-400">Connected</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Wallet Connected</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect your wallet to start creating Proof Capsules.
                    </p>
                    <Button variant="glow">
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Your Statistics
                </CardTitle>
                <CardDescription>
                  Overview of your Proof Capsule activity and portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                    <span className="text-muted-foreground">Loading stats...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{userStats?.totalCapsules || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Capsules</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{userStats?.publicCapsules || 0}</p>
                      <p className="text-sm text-muted-foreground">Public Capsules</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{getDaysActive()}</p>
                      <p className="text-sm text-muted-foreground">Days Active</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{userStats?.totalVerifications || 0}</p>
                      <p className="text-sm text-muted-foreground">Verifications</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your privacy settings and data sharing preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Public Profile</p>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your public Proof Capsules
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publicProfile}
                      onChange={(e) => setPublicProfile(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your Proof Capsules
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Connected Apps
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Created "Sunset at Venice Beach"</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Verified "Graduation Day"</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Shared "First Steps"</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  Documentation
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full">
                  Community Discord
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 