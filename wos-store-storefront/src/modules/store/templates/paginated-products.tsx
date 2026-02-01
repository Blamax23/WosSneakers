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
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12"
        data-testid="products-list"
      >
{products.map((p) => {
  const cheapestVariant = (p.variants ?? [])
    .map(
      (v) =>
        v as VariantWithPrices & {
          calculated_price?: { calculated_amount: number }
        }
    )
    .reduce<{ variant: VariantWithPrices | null; minAmount: number }>(
      (acc, variant) => {
        const price = variant.calculated_price?.calculated_amount

        // Si pas de prix, on ne touche pas à l'accumulateur
        if (price == null) {
          return acc
        }

        if (price < acc.minAmount) {
          return { variant, minAmount: price }
        }

        return acc
      },
      { variant: null, minAmount: Infinity }
    )

  if (!cheapestVariant.variant || !cheapestVariant.variant.calculated_price) {
    console.warn(
      "Produit sans prix calculé, on ne l'affiche pas dans la grille :",
      p.title
    )
    return null
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
