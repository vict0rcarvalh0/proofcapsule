"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Shield, CheckCircle, XCircle, Clock, Hash, FileText, MapPin, Calendar, Copy, ExternalLink } from "lucide-react"

export default function VerifyPage() {
  const [hash, setHash] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [fileHash, setFileHash] = useState("")

  const handleVerify = async () => {
    if (!hash.trim()) return

    setIsVerifying(true)
    
    // Simulate verification delay
    setTimeout(() => {
      // Mock verification result
      setVerificationResult({
        verified: true,
        capsule: {
          id: "1",
          title: "Sunset at Venice Beach",
          description: "Beautiful golden hour at the beach",
          timestamp: "2024-01-15T18:30:00Z",
          location: "Venice Beach, CA",
          hash: hash,
          type: "image",
          blockNumber: 12345678,
          transactionHash: "0xabcd1234...5678efgh",
          creator: "0x1234...5678",
        }
      })
      setIsVerifying(false)
    }, 2000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate file hashing
    const reader = new FileReader()
    reader.onload = (e) => {
      // In real implementation, this would use crypto-js or similar
      const mockHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`
      setFileHash(mockHash)
      setHash(mockHash)
    }
    reader.readAsArrayBuffer(file)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

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
                  variant="glow"
                  className="w-full"
                  onClick={handleVerify}
                  disabled={!hash.trim() || isVerifying}
                >
                  {isVerifying ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Verifying...
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
                      We'll hash it and check for matches
                    </p>
                  </label>
                </div>
                {fileHash && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">File Hash:</p>
                    <p className="text-sm font-mono text-foreground">{fileHash}</p>
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
                      {verificationResult.verified ? (
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-2 text-red-500" />
                      )}
                      Verification Result
                    </CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      verificationResult.verified 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {verificationResult.verified ? "VERIFIED" : "NOT FOUND"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Title</h4>
                      <p className="text-sm text-muted-foreground">{verificationResult.capsule.title}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{verificationResult.capsule.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Timestamp
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(verificationResult.capsule.timestamp)}
                        </p>
                      </div>
                      
                      {verificationResult.capsule.location && (
                        <div>
                          <h4 className="font-medium text-foreground mb-1 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Location
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {verificationResult.capsule.location}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-1">Blockchain Data</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Block Number:</span>
                          <span className="font-mono">{verificationResult.capsule.blockNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Creator:</span>
                          <span className="font-mono">{verificationResult.capsule.creator}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Transaction:</span>
                          <div className="flex items-center space-x-1">
                            <span className="font-mono">{verificationResult.capsule.transactionHash}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                                     <div className="pt-4 border-t border-border">
                    <Button variant="outline" className="w-full" onClick={() => setVerificationResult(null)}>
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
                  • Confirm the content hasn't been tampered with
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