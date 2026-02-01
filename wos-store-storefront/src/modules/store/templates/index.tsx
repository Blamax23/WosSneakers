import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  collection_id,
  page,
  countryCode,
  price
}: {
  sortBy?: SortOptions
  collection_id?: string
  page?: string
  countryCode: string
  price?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col gap-y-10 lg:flex-row lg:items-start lg:gap-x-12 py-6 content-container"
      data-testid="category-container"
    >
      <div className="w-full lg:flex-[0_0_25%]">
        <RefinementList sortBy={sort} />
      </div>
      <div className="w-full lg:flex-[0_0_75%]">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">Tous nos produits</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            collectionId={collection_id}
            page={pageNumber}
            countryCode={countryCode}
            price={price}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
