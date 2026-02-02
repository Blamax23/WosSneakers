import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Boutique",
  description: "Consultez tous nos produits",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    collection_id?: string
    page?: string
    price?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, collection_id, page, price } = await searchParams
  const { countryCode } = await params

  return (
    <StoreTemplate
      sortBy={sortBy}
      collection_id={collection_id}
      page={page}
      countryCode={countryCode}
      price={price}
    />
  )
}
