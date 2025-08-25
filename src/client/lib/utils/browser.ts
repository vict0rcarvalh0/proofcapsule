// Browser-safe utility functions
// These functions work in the browser without Node.js dependencies

// Content hashing utilities for browser
export function hashContent(content: string): string {
  // Simple hash function for browser (not cryptographically secure)
  let hash = 0
  if (content.length === 0) return '0x' + hash.toString(16).padStart(64, '0')
  
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0')
}

export function hashFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Create a more robust hash using SHA-256-like approach
        let hash = 0
        let hash2 = 0
        let hash3 = 0
        let hash4 = 0
        
        for (let i = 0; i < uint8Array.length; i++) {
          const byte = uint8Array[i]
          hash = ((hash << 7) - hash + byte) & 0xFFFFFFFF
          hash2 = ((hash2 << 11) - hash2 + byte) & 0xFFFFFFFF
          hash3 = ((hash3 << 13) - hash3 + byte) & 0xFFFFFFFF
          hash4 = ((hash4 << 17) - hash4 + byte) & 0xFFFFFFFF
        }
        
        // Combine the hashes to create a 32-byte (64 character) hash
        const combinedHash = (BigInt(hash) << BigInt(96)) | (BigInt(hash2) << BigInt(64)) | (BigInt(hash3) << BigInt(32)) | BigInt(hash4)
        const hashString = combinedHash.toString(16).padStart(64, '0')
        
        resolve('0x' + hashString)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// Validation utilities
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidContentHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateLong(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Utility functions
export function truncateHash(hash: string, start: number = 10, end: number = 8): string {
  if (hash.length <= start + end) return hash
  return `${hash.slice(0, start)}...${hash.slice(-end)}`
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
} 