import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Bubbles } from "@/components/bubbles"
import { Footer } from "@/components/footer"
import { WagmiWrapper } from "@/components/providers/wagmi-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ProofCapsule - Timestamped On-Chain Moments",
  description: "Immortalize your life moments with cryptographic proof and tamper-proof timestamps on the blockchain.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <WagmiWrapper>
          <Bubbles />
          <div className="relative min-h-screen flex flex-col">
            <Navigation />
            <main className="pt-16 flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </WagmiWrapper>
      </body>
    </html>
  )
}
