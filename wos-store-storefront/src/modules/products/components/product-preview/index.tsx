"use client"

import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct & { cheapestVariant?: any }
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestVariant } = product

  console.log("Voici ce que je mets dans cheapestPrice : ", cheapestVariant)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="cine"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex flex-col items-start">
            {cheapestVariant && <PreviewPrice price={cheapestVariant.variant.calculated_price} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
