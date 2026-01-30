"use client"

import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"

type CarouselProps = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

type VariantWithPrices = HttpTypes.StoreProductVariant & {
  prices: { amount: number }[]
}

const Carousel = ({ products, region }: CarouselProps) => {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2, spacing: 16 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 4, spacing: 24 },
      },
    },
    slides: { perView: 1.2, spacing: 16 },
  })

  return (
    <div ref={sliderRef} className="keen-slider">
      {products.map((product) => {
        const cheapestVariant = (product.variants ?? [])
          .map(v => v as VariantWithPrices & { calculated_price?: { calculated_amount: number } })
          .reduce<{ variant: VariantWithPrices | null; minAmount: number }>(
            (acc, variant) => {
              const price = variant.calculated_price?.calculated_amount ?? Infinity
              if (price < acc.minAmount) {
                return { variant, minAmount: price }
              }
              return acc
            },
            { variant: null, minAmount: Infinity }
          )
        return (
          <div className="keen-slider__slide" key={product.id}>
            <ProductPreview product={{ ...product, cheapestVariant }} region={region} isFeatured />
          </div>
        )
      })}
    </div>
  )
}

export default Carousel
