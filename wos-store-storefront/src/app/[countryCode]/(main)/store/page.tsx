import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Boutique",
  description: "Consultez tous nos produits",
}

type Params = {
  searchParams: {
    sortBy?: SortOptions
    collection_id?: string
    page?: string
    price?: string // ajoute ici si tu veux aussi le "price"
  }
  params: {
    countryCode: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, collection_id, page, price } = searchParams
  const { countryCode } = params

  console.log("sortBy", sortBy)
  console.log("collection_id", collection_id)
  console.log("page", page)
  console.log("price", price)
  console.log("countryCode", countryCode)

  return (
    <StoreTemplate
      sortBy={sortBy}
      collection_id={collection_id}
      page={page}
      countryCode={countryCode}
      price={price} // tu peux maintenant le passer où tu veux
    />
  )
}
