"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Images, Search, Filter, Calendar, MapPin, Hash, Eye, Share2, Download, Loader2, ExternalLink, Copy } from "lucide-react"
import { useAccount } from "wagmi"
import { capsulesService, ipfsService, type Capsule } from "@/lib/services"
import { formatDate, truncateHash, copyToClipboard } from "@/lib/utils/browser"
import { toast } from "sonner"

// Mock data for demonstration
const mockCapsules = [
  {
    id: "1",
    title: "Sunset at Venice Beach",
    description: "Beautiful golden hour at the beach",
    timestamp: "2024-01-15T18:30:00Z",
    location: "Venice Beach, CA",
    hash: "0x1234...5678",
    type: "image",
    verified: true,
  },
  {
    id: "2",
    title: "Graduation Day",
    description: "Finally made it! University graduation ceremony",
    timestamp: "2024-01-10T14:00:00Z",
    location: "Stanford University",
    hash: "0xabcd...efgh",
    type: "video",
    verified: true,
  },
  {
    id: "3",
    title: "First Steps",
    description: "Baby's first steps captured forever",
    timestamp: "2024-01-08T10:15:00Z",
    location: "Home",
    hash: "0x9876...5432",
    type: "image",
    verified: true,
  },
  {
    id: "4",
    title: "Important Document",
    description: "Contract signing for new business venture",
    timestamp: "2024-01-05T16:45:00Z",
    location: "Office",
    hash: "0x5678...1234",
    type: "document",
    verified: true,
  },
]

export default function GalleryPage() {
  const { address, isConnected } = useAccount()
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"all" | "public" | "private">("all")
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [copyingHash, setCopyingHash] = useState<string | null>(null)

  // Load capsules on component mount
  useEffect(() => {
    const loadCapsules = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        let response
        if (viewMode === "public") {
          response = await capsulesService.getPublicCapsules()
        } else if (viewMode === "private") {
          response = await capsulesService.getPrivateCapsules(address)
        } else {
          response = await capsulesService.getUserCapsules(address)
        }

        if (response.success && response.data) {
          setCapsules(response.data)
        } else {
          setError(response.error || 'Failed to load capsules')
        }
      } catch (error) {
        console.error('Error loading capsules:', error)
        setError('Failed to load capsules')
      } finally {
        setLoading(false)
      }
    }

    loadCapsules()
  }, [isConnected, address, viewMode])

  // Handler functions for capsule actions
  const handleViewCapsule = (capsule: Capsule) => {
    setSelectedCapsule(capsule)
    setShowViewModal(true)
  }

  const handleShareCapsule = async (capsule: Capsule) => {
    // Use IPFS metadata URL if available, otherwise fallback to verification page
    const shareUrl = capsule.ipfsHash 
      ? ipfsService.getGatewayUrl(capsule.ipfsHash)
      : `${window.location.origin}/verify?hash=${capsule.contentHash}`
    
    const shareText = `Check out this ProofCapsule: ${capsule.description || 'Capsule'} #${capsule.tokenId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ProofCapsule #${capsule.tokenId}`,
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        console.log('Share cancelled or failed')
      }
          } else {
        // Fallback to copying to clipboard
        try {
          await copyToClipboard(shareUrl)
          toast.success('Share URL copied to clipboard!')
        } catch (error) {
          console.error('Failed to copy to clipboard:', error)
          toast.error('Failed to copy to clipboard')
        }
      }
  }

  const handleDownloadCapsule = async (capsule: Capsule) => {
    // If IPFS hash is available, download from IPFS
    if (capsule.ipfsHash) {
      try {
        const response = await fetch(ipfsService.getGatewayUrl(capsule.ipfsHash))
        if (response.ok) {
          const metadata = await response.json()
          
          // Create enhanced JSON with both metadata and blockchain data
          const capsuleData = {
            ...metadata,
            blockchainData: {
              tokenId: capsule.tokenId,
              contentHash: capsule.contentHash,
              blockNumber: capsule.blockNumber,
              transactionHash: capsule.transactionHash,
              gasUsed: capsule.gasUsed,
              createdAt: capsule.createdAt,
              isPublic: capsule.isPublic
            },
            ipfsGateway: ipfsService.getGatewayUrls(capsule.ipfsHash)
          }

          const blob = new Blob([JSON.stringify(capsuleData, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `proofcapsule-${capsule.tokenId}-metadata.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast.success('Capsule metadata downloaded!')
          return
        }
      } catch (error) {
        console.error('Failed to fetch IPFS metadata:', error)
        toast.error('Failed to download metadata')
      }
    }

    // Fallback to local data if IPFS is not available
    const capsuleData = {
      id: capsule.id,
      tokenId: capsule.tokenId,
      contentHash: capsule.contentHash,
      description: capsule.description,
      location: capsule.location,
      createdAt: capsule.createdAt,
      isPublic: capsule.isPublic,
      ipfsHash: capsule.ipfsHash,
      blockNumber: capsule.blockNumber,
      transactionHash: capsule.transactionHash
    }

    const blob = new Blob([JSON.stringify(capsuleData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proofcapsule-${capsule.tokenId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Capsule data downloaded!')
  }

  const handleCopyHash = async (hash: string) => {
    setCopyingHash(hash)
    try {
      await copyToClipboard(hash)
      toast.success('Hash copied to clipboard!')
      setTimeout(() => setCopyingHash(null), 2000)
    } catch (error) {
      console.error('Failed to copy hash:', error)
      setCopyingHash(null)
      toast.error('Failed to copy hash')
    }
  }

  const handleViewOnExplorer = (capsule: Capsule) => {
    if (capsule.transactionHash) {
      const explorerUrl = `https://explorer.testnet.soniclabs.com/tx/${capsule.transactionHash}`
      window.open(explorerUrl, '_blank')
    }
  }

  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = searchTerm === "" || 
      (capsule.description && capsule.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const sortedCapsules = [...filteredCapsules].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return 0
  })

  // formatDate is now imported from browser utils

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Images className="w-4 h-4 mr-2" />
            Your Proof Capsules
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Memory Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse and manage your immortalized moments. Each capsule is a verifiable piece of your history.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your capsules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* View Mode Filter */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "all" | "public" | "private")}
              className="px-4 py-3 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Capsules</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{sortedCapsules.length} of {capsules.length} capsules</span>
            <span>All verified and immutable</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your capsules...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Capsules Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCapsules.map((capsule) => (
              <Card key={capsule.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        Capsule #{capsule.tokenId}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {capsule.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleViewCapsule(capsule)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleShareCapsule(capsule)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(capsule.createdAt.toString())}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {capsule.location || "No location"}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Hash className="w-4 h-4 mr-2" />
                      <span className="flex-1">{truncateHash(capsule.contentHash)}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1"
                        onClick={() => handleCopyHash(capsule.contentHash)}
                      >
                        {copyingHash === capsule.contentHash ? (
                          <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      capsule.isPublic ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {capsule.isPublic ? "Public" : "Private"}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-400">Verified</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewCapsule(capsule)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleShareCapsule(capsule)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadCapsule(capsule)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedCapsules.length === 0 && (
          <div className="text-center py-12">
            <Images className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No capsules found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || viewMode !== "all" 
                ? "Try adjusting your search or filters"
                : isConnected 
                  ? "Create your first Proof Capsule to get started"
                  : "Connect your wallet to view your capsules"
              }
            </p>
            {!searchTerm && viewMode === "all" && isConnected && (
              <Button variant="glow" asChild>
                <a href="/capture">Create First Capsule</a>
              </Button>
            )}
            {!isConnected && (
              <Button variant="glow">
                Connect Wallet
              </Button>
            )}
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedCapsule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Capsule #{selectedCapsule.tokenId}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowViewModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {selectedCapsule.description || "No description provided"}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Created</h3>
                      <p className="text-muted-foreground">
                        {formatDate(selectedCapsule.createdAt.toString())}
                      </p>
                    </div>
                    {selectedCapsule.location && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Location</h3>
                        <p className="text-muted-foreground">{selectedCapsule.location}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Status</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCapsule.isPublic ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {selectedCapsule.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                    {selectedCapsule.ipfsHash && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">IPFS Hash</h3>
                        <p className="text-muted-foreground font-mono text-sm">
                          {selectedCapsule.ipfsHash}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Content Hash */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Content Hash</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-muted-foreground font-mono text-sm flex-1">
                        {selectedCapsule.contentHash}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopyHash(selectedCapsule.contentHash)}
                      >
                        {copyingHash === selectedCapsule.contentHash ? (
                          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Blockchain Data */}
                  {selectedCapsule.transactionHash && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Blockchain Data</h3>
                      <div className="space-y-2">
                        {selectedCapsule.blockNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Block Number:</span>
                            <span className="font-mono text-sm">{selectedCapsule.blockNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Transaction:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">
                              {truncateHash(selectedCapsule.transactionHash)}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewOnExplorer(selectedCapsule)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-border mt-6">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleShareCapsule(selectedCapsule)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownloadCapsule(selectedCapsule)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="glow"
                      onClick={() => window.open(`/verify?hash=${selectedCapsule.contentHash}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 