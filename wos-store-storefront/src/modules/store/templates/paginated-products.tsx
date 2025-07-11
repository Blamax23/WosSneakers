import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  price?: string
}

type VariantWithPrices = HttpTypes.StoreProductVariant & {
  prices: { amount: number }[]
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  price
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  price?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  console.log("queryParams oui", queryParams)
  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    price
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-4 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-4"
        data-testid="products-list"
      >
        {products.map((p) => {
          console.log("VOici le produit à chaque fois : ", p)
          const cheapestVariant = (p.variants ?? [])
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

          console.log("Voici le cheapest Variant : ", cheapestVariant)

          if (cheapestVariant.variant) {
            // cheapestVariant.variant est celui avec le prix le plus bas
            console.log("Variant avec le prix minimum", cheapestVariant.variant)
          }
          return (
            <li key={p.id}>
              <ProductPreview product={{ ...p, cheapestVariant }} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
