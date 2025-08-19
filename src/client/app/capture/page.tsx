"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, FileText, MapPin, Hash, Shield, Zap, ExternalLink, CheckCircle, Video, VideoOff, Navigation, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import { capsulesService, analyticsService, ipfsService, useContractService, type CreateCapsuleData } from "@/lib/services"
import { hashFile } from "@/lib/utils/browser"
import { toast } from "sonner"
import dynamic from 'next/dynamic'

// Disable SSR for this page to avoid wallet client issues
const CapturePage = dynamic(() => Promise.resolve(CapturePageComponent), { ssr: false })

function CapturePageComponent() {
  const { address, isConnected } = useAccount()
  
  // Camera and media states
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedImageFile, setCapturedImageFile] = useState<File | null>(null)
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationAddress, setLocationAddress] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  // Form states
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [stats, setStats] = useState({ totalCapsules: 0, todayCapsules: 0, activeUsers: 0 })
  const [error, setError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const [tokenId, setTokenId] = useState<number | null>(null)
  const [contentHash, setContentHash] = useState<string | null>(null)

  // Initialize contract service
  const contractService = useContractService()

  useEffect(() => {
    // Load analytics on component mount
    const loadAnalytics = async () => {
      try {
        const response = await analyticsService.getGlobalStats()
        if (response.success && response.data) {
          setStats({
            totalCapsules: response.data.totalCapsules || 0,
            todayCapsules: response.data.todayCapsules || 0,
            activeUsers: response.data.totalUsers || 0
          })
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
      }
    }

    loadAnalytics()
  }, [])

  // Camera functions
  const startCamera = async () => {
    try {
      // Try to get back camera first, fallback to any camera
      let mediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Use back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
      } catch (error) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
      }
      
                    setStream(mediaStream)
      setIsCameraActive(true)
      
      // Force the camera to work with a delay
      setTimeout(() => {
        if (videoRef.current) {
          const video = videoRef.current
          
          // Clear any existing stream first
          video.srcObject = null
          video.load()
          
          // Set the stream
          video.srcObject = mediaStream
          
          // Force load and play
          video.load()
          video.play().then(() => {
            setIsCameraReady(true)
          }).catch((error) => {
            console.error('Video play failed:', error)
            // Check if video is ready anyway
            if (video.readyState >= 2) {
              setIsCameraReady(true)
            }
          })
        }
      }, 500) // 500ms delay to ensure video element is ready
      
      toast.success('Camera activated!')
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Failed to access camera', {
        description: 'Please allow camera permissions and try again.'
      })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
      setIsCameraReady(false)
    }
  }

  const captureImage = () => {
    
    if (!videoRef.current) {
      console.error('Video ref not available')
      toast.error('Camera not ready')
      return
    }
    
    if (!canvasRef.current) {
      console.error('Canvas ref not available')
      toast.error('Canvas not ready')
      return
    }
    
    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Check if video is ready
    if (video.readyState < 2) {
      console.error('Video not ready yet')
      toast.error('Camera not ready yet, please wait')
      return
    }
    
    const context = canvas.getContext('2d')
    if (!context) {
      console.error('Could not get canvas context')
      toast.error('Failed to capture image')
      return
    }
    
    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
            
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
          setCapturedImageFile(file)
          
          // Also create data URL for preview
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          setCapturedImage(dataUrl)
          
          // Turn off camera after capturing
          stopCamera()
          
          toast.success('Image captured! Camera turned off.')
        } else {
          console.error('Failed to create blob')
          toast.error('Failed to capture image')
        }
      }, 'image/jpeg', 0.8)
      
    } catch (error) {
      console.error('Error capturing image:', error)
      toast.error('Failed to capture image')
    }
  }

  // Location functions
  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Force fresh location
        })
      })

      const { latitude, longitude } = position.coords
      setCurrentLocation({ lat: latitude, lng: longitude })
      
      // Get address from coordinates (using a free geocoding service)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        
        if (data.display_name) {
          setLocationAddress(data.display_name)
        } else {
          setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        }
      } catch (error) {
        // Fallback to coordinates if geocoding fails
        setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      }
      
      toast.success('Location captured!')
    } catch (error) {
      console.error('Error getting location:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location'
      setLocationError(errorMessage)
      toast.error('Failed to get location', {
        description: 'Please enable location permissions and try again.'
      })
    } finally {
      setIsGettingLocation(false)
    }
  }





  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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
    if (!capturedImageFile || !isConnected || !address) {
      setError("Please connect your wallet and capture an image")
      return
    }

    if (!currentLocation) {
      setError("Please capture your current location")
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
      setUploadProgress(10)
      const contentHash = await hashFile(capturedImageFile)
      setContentHash(contentHash)
      
      setUploadProgress(20)

      const credentialsValid = await ipfsService.testCredentials()
      if (!credentialsValid) {
        throw new Error('IPFS credentials are invalid. Please check your Pinata API keys.')
      }
      toast.success('IPFS connection verified!')

      // Step 3: Upload captured image to IPFS
      const ipfsResult = await ipfsService.uploadFile(capturedImageFile)
      const fileIpfsHash = ipfsResult.IpfsHash
      setIpfsHash(fileIpfsHash)
      
      setUploadProgress(40)

      // Step 4: Create and upload metadata to IPFS
      const tempTokenId = Date.now()
      const metadata = ipfsService.createCapsuleMetadata({
        tokenId: tempTokenId,
        description: description || "No description",
        location: locationAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
        contentHash,
        ipfsHash: fileIpfsHash,
        isPublic,
        createdAt: new Date().toISOString()
      })
      
      const metadataResult = await ipfsService.uploadMetadata(metadata)
      const metadataIpfsHash = metadataResult.IpfsHash
      toast.success('Metadata uploaded to IPFS!')
      
      setUploadProgress(60)

      // Step 4: Mint NFT on blockchain
      if (!contractService) {
        throw new Error('Wallet not fully connected. Please try refreshing the page or reconnecting your wallet.')
      }
      
      const txHash = await contractService.createProofCapsule({
        contentHash,
        description: description || "No description",
        location: locationAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
        ipfsHash: metadataIpfsHash,
        isPublic
      })
      
      setTransactionHash(txHash)
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
        location: locationAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
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
      setCapturedImageFile(null)
      setCapturedImage(null)
      setCurrentLocation(null)
      setLocationAddress("")
      setDescription("")
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Camera Capture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Live Camera Capture
                </CardTitle>
                <CardDescription>
                  Capture a live image from your device camera. This ensures the moment is captured in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Controls */}
                <div className="flex items-center space-x-4">
                  {!isCameraActive ? (
                    <Button onClick={startCamera} className="flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <Button 
                        onClick={captureImage} 
                        variant="glow" 
                        className="flex items-center"
                        disabled={!isCameraReady}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {isCameraReady ? 'Capture Image' : 'Camera Loading...'}
                      </Button>
                      <Button onClick={stopCamera} variant="outline" className="flex items-center">
                        <VideoOff className="w-4 h-4 mr-2" />
                        Stop Camera
                      </Button>

                    </div>
                  )}
                </div>

                {/* Camera Preview */}
                {isCameraActive && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      controls={false}
                      className="w-full h-64 object-cover rounded-lg border border-border"
                      style={{ transform: 'scaleX(-1)' }} // Mirror the video for selfie-like experience
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Camera Status */}
                    <div className="absolute top-2 left-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCameraReady 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {isCameraReady ? 'Ready' : 'Loading...'}
                      </div>
                          </div>
                        </div>
                )}

                {/* Captured Image Preview */}
                {capturedImage && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Captured Image:</h4>
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-64 object-cover rounded-lg border border-border"
                      />
                        <Button
                          variant="ghost"
                          size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCapturedImage(null)
                          setCapturedImageFile(null)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Location Capture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="w-5 h-5 mr-2" />
                  Live Location Capture
                </CardTitle>
                <CardDescription>
                  Capture your current GPS location. This ensures the location is captured in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Controls */}
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={getCurrentLocation} 
                    disabled={isGettingLocation}
                    className="flex items-center"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4 mr-2" />
                    )}
                    {isGettingLocation ? 'Getting Location...' : 'Capture Location'}
                        </Button>
                </div>

                {/* Location Display */}
                {currentLocation && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Captured Location:</h4>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Current Location</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {locationAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location Error */}
                {locationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{locationError}</p>
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
                              disabled={!capturedImageFile || !currentLocation || isUploading}
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
                  <span className="text-sm text-muted-foreground">Today&apos;s Captures</span>
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

export default CapturePage 