import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Carousel from "./carousel"

export default async function ProductRail({ collection, region }: { collection: HttpTypes.StoreCollection, region: HttpTypes.StoreRegion }) {
  console.log(collection.metadata?.home)
  if (collection.metadata?.home !== true) return null

  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts || pricedProducts.length === 0) return null

  const isCarousel = pricedProducts.length > 3

  return (
    <div className="content-container py-6 small:py-6">
      <div className="flex justify-between items-center mb-8">
          <h2 className="font-semibold text-3xl font-bold">{collection.title}</h2>
          <a
            href={`/collections/${collection.handle}`}
            className="border border-black text-white bg-black text-sm px-4 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-black"
          >
            Voir plus
          </a>
      </div>

      {isCarousel ? (
        <Carousel products={pricedProducts.slice(0, 12)} region={region} />
      ) : (
        <ul className="grid grid-cols-2 small:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-24 small:gap-y-36">
          {pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
