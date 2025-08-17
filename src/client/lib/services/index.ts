// Export all services
export { capsulesService, type ApiResponse, type CreateCapsuleData, type UpdateCapsuleData } from './capsules'
export { verificationService, type VerificationData, type VerificationWithCapsule } from './verification'
export { analyticsService, type GlobalStats, type UserAnalytics } from './analytics'

// Re-export types for convenience
export type { Capsule } from '@/lib/db/schema' 