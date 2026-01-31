'use client';

import { useEffect, useState } from 'react'
import { sdk } from '@lib/config'
import { Button, Heading, Text } from '@medusajs/ui'
import ProductRail from '@modules/home/components/featured-products/product-rail'
import ParallaxSection from './ParallaxSection'
import { StoreCollection } from '@medusajs/types';
import InteractiveLink from "@modules/common/components/interactive-link"


const Hero = () => {
  return (
    <div>
      {/* Ta section Parallax */}
      <div className="h-[90vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle overflow-hidden">
        <ParallaxSection />
      </div>
    </div>
  )
}

export default Hero
