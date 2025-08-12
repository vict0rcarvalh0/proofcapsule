"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Images, Search, Filter, Calendar, MapPin, Hash, Eye, Share2, Download } from "lucide-react"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filteredCapsules = mockCapsules.filter(capsule => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capsule.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || capsule.type === filterType
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredCapsules.length} of {mockCapsules.length} capsules</span>
            <span>All verified and immutable</span>
          </div>
        </div>

        {/* Capsules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.map((capsule) => (
            <Card key={capsule.id} className="gradient-border hover:glow-hover transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{capsule.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {capsule.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                    {formatDate(capsule.timestamp)}
                  </div>
                  {capsule.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {capsule.location}
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <Hash className="w-4 h-4 mr-2" />
                    {capsule.hash}
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    capsule.type === "image" ? "bg-blue-500/20 text-blue-400" :
                    capsule.type === "video" ? "bg-purple-500/20 text-purple-400" :
                    "bg-green-500/20 text-green-400"
                  }`}>
                    {capsule.type.charAt(0).toUpperCase() + capsule.type.slice(1)}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Verified</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCapsules.length === 0 && (
          <div className="text-center py-12">
            <Images className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No capsules found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filters"
                : "Create your first Proof Capsule to get started"
              }
            </p>
            {!searchTerm && filterType === "all" && (
              <Button variant="glow" asChild>
                <a href="/capture">Create First Capsule</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 