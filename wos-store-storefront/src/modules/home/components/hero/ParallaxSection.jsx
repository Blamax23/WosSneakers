'use client'

import React, { useEffect, useRef } from 'react'
import SneakerScene from '../sneakerScene'

const ParallaxSection = () => {
  const parallaxRef = useRef(null)
  const backgroundRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const speed = 10
      const x = (window.innerWidth / 2 - e.clientX) / speed
      const y = (window.innerHeight / 2 - e.clientY) / speed

      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      ref={backgroundRef}
      className="h-[90vh] w-full relative bg-black overflow-hidden flex items-center justify-center"
      style={{willChange: 'transform'}}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" fill="none" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 300 }, (_, i) => {
            // Utiliser l'index pour générer des positions fixes
            const x = (i * 137.5 + 123) % 1920
            const y = (i * 241.3 + 456) % 1080
            const size = ((i * 17) % 10) / 10 + 0.5
            const opacity = ((i * 23) % 40) / 100 + 0.1
            const shadowOpacity = opacity * 0.5
            const delay = (i * 50) % 5000
            return (
              <circle
                key={`bg-star-${i}`}
                cx={x}
                cy={y}
                r={size}
                fill="white"
                opacity={opacity}
                filter={`drop-shadow(0 0 ${size / 2}px rgba(255, 255, 255, ${shadowOpacity}))`}
                style={{
                  animation: `twinkle 5s infinite`,
                  animationDelay: `${delay}ms`,
                }}
              />
            )
          })}
      </svg>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <SneakerScene modelName="wos" />
      </div>
    </div>
  )
}

export default ParallaxSection
