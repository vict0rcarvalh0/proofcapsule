import Link from "next/link"
import { Camera, Github, Twitter, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-glow">ProofCapsule</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md text-sm sm:text-base">
              Immortalize your life moments with cryptographic proof and tamper-proof timestamps on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="https://x.com/vict0rcarvalh0o"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm">Follow on X</span>
              </Link>
              <Link
                href="https://github.com/vict0rcarvalh0/proofcapsule"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm">View on GitHub</span>
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/capture" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  Capture Moment
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  Your Gallery
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  Verify Proof
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  About
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <span>© 2025 ProofCapsule.</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              <span>Built with Next.js & Tailwind CSS</span>
              <span className="hidden sm:inline">•</span>
              <span>Powered by Sonic</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 