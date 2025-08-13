"use client"

import { useEffect, useState } from "react"

interface Bubble {
  id: number
  size: number
  top: number
  left: number
  opacity: number
  blur: number
}

export function Bubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const generateBubbles = () => {
      const bubbleCount = 8 // Reduced count for better spacing
      const newBubbles: Bubble[] = []
      
      // Create a grid-like distribution to ensure separation
      const gridSize = Math.ceil(Math.sqrt(bubbleCount))
      const cellWidth = 100 / gridSize
      const cellHeight = 100 / gridSize
      
      for (let i = 0; i < bubbleCount; i++) {
        const gridRow = Math.floor(i / gridSize)
        const gridCol = i % gridSize
        
        // Add some randomness within each grid cell
        const baseTop = gridRow * cellHeight
        const baseLeft = gridCol * cellWidth
        const randomTop = baseTop + (Math.random() - 0.5) * cellHeight * 0.6
        const randomLeft = baseLeft + (Math.random() - 0.5) * cellWidth * 0.6
        
        newBubbles.push({
          id: i,
          size: Math.random() * 150 + 120, // 120-270px (slightly smaller for better spacing)
          top: Math.max(5, Math.min(95, randomTop)), // Keep within bounds
          left: Math.max(5, Math.min(95, randomLeft)), // Keep within bounds
          opacity: Math.random() * 0.3 + 0.4, // 0.4-0.7
          blur: Math.random() * 10 + 20, // 20-30px
        })
      }
      
      setBubbles(newBubbles)
    }

    generateBubbles()
  }, [])

  const blueColors = [
    'rgba(59, 130, 246, 0.6)',
    'rgba(99, 102, 241, 0.5)',
    'rgba(139, 92, 246, 0.5)',
    'rgba(59, 130, 246, 0.4)',
    'rgba(99, 102, 241, 0.5)',
  ]

  return (
    <div className="bubbles">

      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            top: `${bubble.top}%`,
            left: `${bubble.left}%`,
            opacity: bubble.opacity,
            filter: `blur(${bubble.blur}px)`,
            background: `radial-gradient(circle, ${blueColors[bubble.id % blueColors.length]}, transparent)`,
          }}
        />
      ))}
    </div>
  )
} 