import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/server'
import { capsules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/capsules/[id] - Get a specific capsule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid capsule ID' },
        { status: 400 }
      )
    }

    const [capsule] = await db
      .select()
      .from(capsules)
      .where(eq(capsules.id, id))
      .limit(1)

    if (!capsule) {
      return NextResponse.json(
        { success: false, error: 'Capsule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: capsule
    })
  } catch (error) {
    console.error('Error fetching capsule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch capsule' },
      { status: 500 }
    )
  }
}

// PUT /api/capsules/[id] - Update a capsule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid capsule ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { description, location, isPublic } = body

    // Check if capsule exists
    const [existingCapsule] = await db
      .select()
      .from(capsules)
      .where(eq(capsules.id, id))
      .limit(1)

    if (!existingCapsule) {
      return NextResponse.json(
        { success: false, error: 'Capsule not found' },
        { status: 404 }
      )
    }

    // Update the capsule
    const [updatedCapsule] = await db
      .update(capsules)
      .set({
        description,
        location,
        isPublic,
        updatedAt: new Date()
      })
      .where(eq(capsules.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedCapsule
    })
  } catch (error) {
    console.error('Error updating capsule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update capsule' },
      { status: 500 }
    )
  }
}

// DELETE /api/capsules/[id] - Delete a capsule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid capsule ID' },
        { status: 400 }
      )
    }

    // Check if capsule exists
    const [existingCapsule] = await db
      .select()
      .from(capsules)
      .where(eq(capsules.id, id))
      .limit(1)

    if (!existingCapsule) {
      return NextResponse.json(
        { success: false, error: 'Capsule not found' },
        { status: 404 }
      )
    }

    // Delete the capsule
    await db
      .delete(capsules)
      .where(eq(capsules.id, id))

    return NextResponse.json({
      success: true,
      message: 'Capsule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting capsule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete capsule' },
      { status: 500 }
    )
  }
} 