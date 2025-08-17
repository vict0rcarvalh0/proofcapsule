"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, FileText, MapPin, Calendar, Hash, Shield, Zap } from "lucide-react"
import { useAccount } from "wagmi"
import { capsulesService, analyticsService, type CreateCapsuleData } from "@/lib/services"
import { hashFile } from "@/lib/utils/browser"

export default function CapturePage() {
  const { address, isConnected } = useAccount()
  const [files, setFiles] = useState<File[]>([])
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [stats, setStats] = useState({ totalCapsules: 0, todayCapsules: 0, activeUsers: 0 })
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
  }

  // Load stats on component mount
  useEffect(() => {
    const loadStats = async () => {
      const response = await analyticsService.getGlobalStats()
      if (response.success && response.data) {
        setStats({
          totalCapsules: response.data.totalCapsules,
          todayCapsules: response.data.todayCapsules,
          activeUsers: response.data.totalUsers
        })
      }
    }
    loadStats()
  }, [])

  const handleCapture = async () => {
    if (files.length === 0 || !isConnected || !address) {
      setError("Please connect your wallet and select files")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Step 1: Hash the files
      setUploadProgress(20)
      const fileHashes = await Promise.all(
        files.map(file => hashFile(file))
      )
      
      // For now, we'll use the first file's hash as the content hash
      const contentHash = fileHashes[0]
      
      setUploadProgress(40)

      // Step 2: Create capsule data
      const capsuleData: CreateCapsuleData = {
        tokenId: Date.now(), // This should come from blockchain transaction
        walletAddress: address,
        contentHash,
        description: description || undefined,
        location: location || undefined,
        isPublic,
        // TODO: Add blockchain transaction data
        // blockNumber: receipt.blockNumber,
        // transactionHash: receipt.transactionHash,
        // gasUsed: receipt.gasUsed
      }

      setUploadProgress(60)

      // Step 3: Save to database
      const response = await capsulesService.createCapsule(capsuleData)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create capsule')
      }

      setUploadProgress(100)

      // Step 4: Reset form and show success
      setFiles([])
      setDescription("")
      setLocation("")
      setIsPublic(true)
      
      // Refresh stats
      const statsResponse = await analyticsService.getGlobalStats()
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalCapsules: statsResponse.data.totalCapsules,
          todayCapsules: statsResponse.data.todayCapsules,
          activeUsers: statsResponse.data.totalUsers
        })
      }

      // TODO: Show success notification
      console.log('Capsule created successfully:', response.data)

    } catch (error) {
      console.error('Error creating capsule:', error)
      setError(error instanceof Error ? error.message : 'Failed to create capsule')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Camera className="w-4 h-4 mr-2" />
            Create New Proof Capsule
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Capture Your Moment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload photos, videos, or text to create an immutable, timestamped proof on the blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Content
                </CardTitle>
                <CardDescription>
                  Drag and drop files or click to browse. Supports images, videos, and text files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.txt,.md,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Drop files here or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, MP4, MOV, TXT, PDF up to 50MB
                    </p>
                  </label>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-foreground">Selected Files:</h4>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Add Context
                </CardTitle>
                <CardDescription>
                  Optional metadata to provide context for your Proof Capsule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this moment..."
                                         className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Where was this captured?"
                      className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-border focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Make this capsule public
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Public capsules can be viewed by anyone. Private capsules are only visible to you.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Capture Button */}
            <Button
              variant="glow"
              size="lg"
              className="w-full h-14 text-lg"
              onClick={handleCapture}
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating Proof Capsule... {uploadProgress}%
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Create Proof Capsule
                </div>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-xs">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Content Hashing</p>
                    <p className="text-xs text-muted-foreground">Your files are hashed locally for privacy</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-xs">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Blockchain Timestamp</p>
                    <p className="text-xs text-muted-foreground">Hash and metadata stored on-chain</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-xs">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">NFT Creation</p>
                    <p className="text-xs text-muted-foreground">You receive a Proof Capsule NFT</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Live Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Capsules</span>
                  <span className="text-sm font-medium text-foreground">{stats.totalCapsules.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Today's Captures</span>
                  <span className="text-sm font-medium text-foreground">{stats.todayCapsules.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium text-foreground">{stats.activeUsers.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  • Only content hashes are stored on-chain
                </p>
                <p className="text-sm text-muted-foreground">
                  • Original files remain private
                </p>
                <p className="text-sm text-muted-foreground">
                  • You control what gets shared
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 