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

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-ui-fg-subtle mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ui-fg-base mb-2">
          Aucun produit disponible
        </h3>
        <p className="text-ui-fg-subtle text-sm max-w-md">
          Il n'y a pas encore de produits qui correspondent à ces critères. Revenez bientôt pour découvrir nos nouveautés !
        </p>
      </div>
    )
  }

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
