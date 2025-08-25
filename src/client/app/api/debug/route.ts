import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('Debug endpoint: Testing database connectivity...')
    
    // Test basic database connection
    const testQuery = await (db as any).select().from(capsules).limit(1)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
      readonly: process.env.API_READONLY === 'true'
    })
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.error('Debug endpoint error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
      readonly: process.env.API_READONLY === 'true'
    }, { status: 500 })
  }
} 