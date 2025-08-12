import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Shield, Clock, Globe, Zap, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Immutable Proof of Existence
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Timestamped{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-glow">
                On-Chain
              </span>{" "}
              Moments
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Capture life's precious moments and immortalize them on the blockchain with cryptographic proof. 
              Your memories, achievements, and evidence are forever verifiable and censorship-resistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="glow" size="lg" asChild>
                <Link href="/capture">
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Moment
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/verify">
                  <Globe className="w-5 h-5 mr-2" />
                  Verify Proof
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose ProofCapsule?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for trust, privacy, and permanence. Your digital memories deserve the highest level of security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="gradient-border hover:glow-hover transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Immutable Proof</CardTitle>
                <CardDescription>
                  Cryptographic guarantees ensure your content can never be altered or deleted once captured.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-border hover:glow-hover transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Tamper-Proof Timestamps</CardTitle>
                <CardDescription>
                  Precise blockchain timestamps provide irrefutable proof of when your moment was captured.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-border hover:glow-hover transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Privacy-First</CardTitle>
                <CardDescription>
                  Only content hashes are stored on-chain. Your original media stays private unless you choose to share.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-border hover:glow-hover transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Public Verification</CardTitle>
                <CardDescription>
                  Anyone can verify the authenticity of any Proof Capsule using our open verification system.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-border hover:glow-hover transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>NFT Ownership</CardTitle>
                <CardDescription>
                  Every Proof Capsule is an NFT you truly own, representing your unique moment in time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-border hover:glow-hover transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Easy Capture</CardTitle>
                <CardDescription>
                  Simple, intuitive interface for capturing photos, videos, or text with one-click blockchain anchoring.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Perfect For Every Moment
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From personal milestones to legal evidence, ProofCapsule has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Personal Milestones</h3>
                  <p className="text-muted-foreground">Weddings, graduations, first steps — immortalize life's precious moments with verifiable proof.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Historical Documentation</h3>
                  <p className="text-muted-foreground">Capture events as they happen, creating a permanent, tamper-proof archive for future generations.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Legal Evidence</h3>
                  <p className="text-muted-foreground">Certify the existence of documents or media at a specific time for legal and compliance purposes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Proof of Presence</h3>
                  <p className="text-muted-foreground">Verify attendance at protests, meetups, conferences, or any event requiring proof of participation.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-24 h-24 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Start?</h3>
                  <p className="text-muted-foreground mb-6">Join thousands of users already preserving their moments on-chain.</p>
                  <Button variant="glow" size="lg" asChild>
                    <Link href="/capture">Create Your First Capsule</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
