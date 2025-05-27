import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Boutique",
  description: "Consultez tous nos produits",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    collection_id?: string
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  console.log("params", params)
  const searchParams = await props.searchParams;
  console.log("searchParams", props.searchParams)
  const { sortBy, collection_id, page } = searchParams
  console.log("sortBy", sortBy)
  console.log("collection_id", collection_id)
  console.log("page", page)

  return (
    <StoreTemplate
      sortBy={sortBy}
      collection_id={collection_id}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
