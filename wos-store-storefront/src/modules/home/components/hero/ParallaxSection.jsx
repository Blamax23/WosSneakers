'use client'

import React, { useEffect, useRef } from 'react'
import SneakerScene from '../sneakerScene'

const ParallaxSection = () => {
  const parallaxRef = useRef(null)

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
    <div className="h-[90vh] w-full relative bg-black overflow-hidden flex items-center justify-center">
      <div className="absolute left-0 h-full w-[50vw] z-10">
        <SneakerScene modelName="sb2-light" />
      </div>

      <img
        ref={parallaxRef}
        src="/WosLogos/logoWosArgent.png"
        alt="Logo WOS"
        className="w-[80vw] max-w-[600px] transition-transform duration-100 ease-out z-20"
      />

      <div className="absolute right-0 h-full w-[50vw] z-10">
        <SneakerScene modelName="af1-light" />
      </div>
    </div>
  )
}

export default ParallaxSection
