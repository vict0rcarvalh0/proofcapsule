// Client-safe database exports
// Only export types and utilities that work in the browser

export * from './schema'

// Re-export browser utilities
export { 
  hashContent, 
  hashFile, 
  isValidWalletAddress, 
  isValidContentHash,
  formatDate,
  formatDateLong,
  truncateHash,
  copyToClipboard
} from '../utils/browser' 