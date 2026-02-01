'use client'

import ParallaxSection from "./ParallaxSection"
import Image from "next/image"

const Hero = () => {
  return (
    <div>
      <div className="h-[90vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle overflow-hidden">
        <ParallaxSection />
      </div>
    </div>
  )
}

export default Hero
