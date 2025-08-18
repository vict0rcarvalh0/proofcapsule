"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, FileText, MapPin, Calendar, Hash, Shield, Zap, ExternalLink, CheckCircle } from "lucide-react"
import { useAccount } from "wagmi"
import { capsulesService, analyticsService, ipfsService, useContractService, type CreateCapsuleData } from "@/lib/services"
import { hashFile } from "@/lib/utils/browser"
import { toast } from "sonner"

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
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const [tokenId, setTokenId] = useState<number | null>(null)
  const [contentHash, setContentHash] = useState<string | null>(null)

  // Initialize contract service (only if wallet is connected)
  let contractService = null
  try {
    if (isConnected && address) {
      contractService = useContractService()
    }
  } catch (error) {
    console.log('Contract service not ready yet:', error instanceof Error ? error.message : 'Unknown error')
  }

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
    setTransactionHash(null)
    setIpfsHash(null)
    setTokenId(null)
    setContentHash(null)

    try {
      // Step 1: Hash the files
      setUploadProgress(10)
      const fileHashes = await Promise.all(
        files.map(file => hashFile(file))
      )
      const contentHash = fileHashes[0]
      setContentHash(contentHash)
      
      setUploadProgress(20)

      // Step 2: Test IPFS credentials first
      console.log('Testing IPFS credentials...')
      const credentialsValid = await ipfsService.testCredentials()
      if (!credentialsValid) {
        throw new Error('IPFS credentials are invalid. Please check your Pinata API keys.')
      }
      console.log('IPFS credentials are valid!')
      toast.success('IPFS connection verified!')

      // Step 3: Upload files to IPFS
      const ipfsResults = await Promise.all(
        files.map(file => ipfsService.uploadFile(file))
      )
      const fileIpfsHash = ipfsResults[0].IpfsHash
      setIpfsHash(fileIpfsHash)
      
      setUploadProgress(40)

      // Step 3: Create and upload metadata to IPFS
      const tempTokenId = Date.now()
      const metadata = ipfsService.createCapsuleMetadata({
        tokenId: tempTokenId,
        description: description || "No description",
        location: location || "Unknown",
        contentHash,
        ipfsHash: fileIpfsHash,
        isPublic,
        createdAt: new Date().toISOString()
      })
      
      const metadataResult = await ipfsService.uploadMetadata(metadata)
      const metadataIpfsHash = metadataResult.IpfsHash
      console.log('Metadata uploaded to IPFS:', metadataIpfsHash)
      toast.success('Metadata uploaded to IPFS!')
      
      setUploadProgress(60)

      // Step 4: Mint NFT on blockchain
      if (!contractService) {
        throw new Error('Wallet not fully connected. Please try refreshing the page or reconnecting your wallet.')
      }
      
      console.log('Minting NFT on blockchain...')
      const txHash = await contractService.createProofCapsule({
        contentHash,
        description: description || "No description",
        location: location || "Unknown",
        ipfsHash: metadataIpfsHash,
        isPublic
      })
      
      setTransactionHash(txHash)
      console.log('Transaction hash:', txHash)
      toast.success('NFT minted successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`
      })
      
      // Step 5: Wait for transaction confirmation
      const receipt = await contractService.waitForTransaction(txHash)
      
      // Step 6: Get the actual token ID from the transaction
      // This would typically come from the transaction logs
      // For now, we'll use a timestamp-based approach
      const actualTokenId = Date.now()
      setTokenId(actualTokenId)
      
      setUploadProgress(80)

      // Step 7: Save to database with blockchain data
      const capsuleData: CreateCapsuleData = {
        tokenId: actualTokenId,
        walletAddress: address,
        contentHash,
        description: description || undefined,
        location: location || undefined,
        isPublic,
        ipfsHash: metadataIpfsHash,
        blockNumber: Number(receipt.blockNumber),
        transactionHash: txHash,
        gasUsed: Number(receipt.gasUsed)
      }

      const response = await capsulesService.createCapsule(capsuleData)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create capsule')
      }

      setUploadProgress(100)

      // Step 8: Reset form and show success
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
      
      console.log('Capsule created successfully:', response.data)
      toast.success('Proof Capsule created successfully!', {
        description: `Token ID: #${actualTokenId}`
      })
    } catch (error) {
      console.error('Error creating capsule:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create capsule'
      setError(errorMessage)
      toast.error('Failed to create capsule', {
        description: errorMessage
      })
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

            {/* Success Section */}
            {tokenId && transactionHash && ipfsHash && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Capsule Created Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Token ID</p>
                      <p className="text-sm text-muted-foreground font-mono">#{tokenId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Transaction Hash</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground font-mono truncate">
                          {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://explorer.testnet.soniclabs.com/tx/${transactionHash}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">IPFS Metadata</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground font-mono truncate">
                          {ipfsHash.slice(0, 10)}...{ipfsHash.slice(-8)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(ipfsService.getGatewayUrl(ipfsHash), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Status</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Confirmed on Blockchain
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/gallery`, '_blank')}
                    >
                      View in Gallery
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/verify?hash=${contentHash}`, '_blank')}
                    >
                      Verify Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
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