"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Shield, CheckCircle, XCircle, Clock, Hash, FileText, MapPin, Calendar, Copy, ExternalLink, Link, Database, Globe } from "lucide-react"
import { useAccount } from "wagmi"
import { verificationService, type VerificationWithCapsule } from "@/lib/services"
import { hashFile, formatDateLong } from "@/lib/utils/browser"
import { toast } from "sonner"

export default function VerifyPage() {
  const { address, isConnected } = useAccount()
  const [hash, setHash] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationWithCapsule | null>(null)
  const [fileHash, setFileHash] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hasVerifiedOnce, setHasVerifiedOnce] = useState(false)

  const handleVerify = async () => {
    if (!hash.trim() || !isConnected || !address) {
      setError("Please connect your wallet and enter a hash")
      return
    }

    setIsVerifying(true)
    setError(null)
    setVerificationResult(null)

    try {
      // Verify the content hash
      const response = await verificationService.verifyByHash(hash, address, "Manual verification")
      
      if (response.success && response.data) {
        setVerificationResult(response.data)
        setHasVerifiedOnce(true)
        toast.success('Content verified successfully!', {
          description: `Token ID: #${response.data.capsule.tokenId}`
        })
      } else {
        const errorMsg = response.error || 'Capsule not found'
        setError(errorMsg)
        toast.error('Verification failed', {
          description: errorMsg
        })
      }
    } catch (error) {
      console.error('Error verifying capsule:', error)
      setError('Failed to verify capsule')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileHashResult = await hashFile(file)
      setFileHash(fileHashResult)
      setHash(fileHashResult)
    } catch (error) {
      console.error('Error hashing file:', error)
      setError('Failed to hash file')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  // formatDateLong is now imported from browser utils

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4 mr-2" />
            Public Verification
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Verify Proof Capsules
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify the authenticity and timestamp of any Proof Capsule using its hash or by uploading the original file.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Verify by Hash
                </CardTitle>
                <CardDescription>
                  Enter the hash of a Proof Capsule to verify its authenticity and timestamp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Capsule Hash
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={hash}
                      onChange={(e) => setHash(e.target.value)}
                      placeholder="0x1234...5678"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <Button
                  variant={hasVerifiedOnce ? "outline" : "glow"}
                  className="w-full"
                  onClick={handleVerify}
                  disabled={!hash.trim() || isVerifying || hasVerifiedOnce}
                >
                  {isVerifying ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Verifying...
                    </div>
                  ) : hasVerifiedOnce ? (
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Already Verified
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Verify Capsule
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Verify by File
                </CardTitle>
                <CardDescription>
                  Upload the original file to verify it matches a Proof Capsule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-verify"
                  />
                  <label htmlFor="file-verify" className="cursor-pointer">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Drop file here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll hash it and check for matches
                    </p>
                  </label>
                </div>
                {fileHash && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">File Hash:</p>
                    <p className="text-sm font-mono text-foreground break-all">{fileHash}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification Result */}
          <div className="space-y-6">
            {verificationResult ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Verification Result
                    </CardTitle>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      VERIFIED
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Capsule Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Capsule ID:</span>
                          <p className="text-sm font-mono text-foreground mt-1">#{verificationResult.capsule.tokenId}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Description:</span>
                          <p className="text-sm text-foreground mt-1">
                            {verificationResult.capsule.description || "No description provided"}
                          </p>
                        </div>

                        {verificationResult.capsule.location && (
                          <div>
                            <span className="text-sm text-muted-foreground">Location:</span>
                            <p className="text-sm text-foreground mt-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {verificationResult.capsule.location}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-sm text-muted-foreground">Created:</span>
                          <p className="text-sm text-foreground mt-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDateLong(verificationResult.capsule.createdAt.toString())}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground">Visibility:</span>
                          <p className="text-sm text-foreground mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              verificationResult.capsule.isPublic 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {verificationResult.capsule.isPublic ? 'Public' : 'Private'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content Hash */}
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Content Hash</h4>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">SHA-256 Hash</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(verificationResult.capsule.contentHash)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-mono text-foreground break-all">
                          {verificationResult.capsule.contentHash}
                        </p>
                      </div>
                    </div>

                    {/* Blockchain Information */}
                    {verificationResult.capsule.transactionHash && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Blockchain Information</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-sm font-mono text-foreground break-all flex-1">
                                {verificationResult.capsule.transactionHash}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(verificationResult.capsule.transactionHash!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => window.open(`https://explorer.testnet.soniclabs.com/tx/${verificationResult.capsule.transactionHash}`, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm text-muted-foreground">Block Number:</span>
                            <p className="text-sm font-mono text-foreground mt-1">
                              {verificationResult.capsule.blockNumber?.toLocaleString() || 'N/A'}
                            </p>
                          </div>

                          <div>
                            <span className="text-sm text-muted-foreground">Gas Used:</span>
                            <p className="text-sm font-mono text-foreground mt-1">
                              {verificationResult.capsule.gasUsed?.toLocaleString() || 'N/A'} gas
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IPFS Information */}
                    {verificationResult.capsule.ipfsHash && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">IPFS Information</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">IPFS Hash:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-sm font-mono text-foreground break-all flex-1">
                                {verificationResult.capsule.ipfsHash}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(verificationResult.capsule.ipfsHash!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${verificationResult.capsule.ipfsHash}`, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Details */}
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Verification Details</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Verified by:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm font-mono text-foreground break-all flex-1">
                              {verificationResult.verification.verifierAddress}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(verificationResult.verification.verifierAddress)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Method:</span>
                          <p className="text-sm font-mono text-foreground mt-1">
                            {verificationResult.verification.verificationMethod}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Verified at:</span>
                          <p className="text-sm font-mono text-foreground mt-1">
                            {formatDateLong(verificationResult.verification.verifiedAt.toString())}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        setVerificationResult(null)
                        setHasVerifiedOnce(false)
                        setHash("")
                        setFileHash("")
                      }}
                    >
                      Verify Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Verify</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a hash or upload a file to verify its authenticity and timestamp.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Verification Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  How Verification Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  • We check the blockchain for the provided hash
                </p>
                <p className="text-muted-foreground">
                  • Verify the timestamp and metadata are authentic
                </p>
                <p className="text-muted-foreground">
                  • Confirm the content hasn&apos;t been tampered with
                </p>
                <p className="text-muted-foreground">
                  • Display the original creator and transaction details
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 