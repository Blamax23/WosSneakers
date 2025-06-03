"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import SortProducts, { SortOptions } from "./sort-products"
import {GetCollectionsChoices, PriceFilter, ColorFilter} from "./filters-products"

type RefinementListProps = {
  sortBy: SortOptions
  collections?: string
  priceRange?: string // Format: "min-max" ex: "10-100"
  colors?: string // Format: "color1,color2,color3"
  search?: boolean
  'data-testid'?: string
}

const RefinementList = ({ 
  sortBy, 
  collections, 
  priceRange,
  colors,
  'data-testid': dataTestId 
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  // Fonction pour supprimer un paramètre de query
  const removeQueryParam = (name: string) => {
    const params = new URLSearchParams(searchParams)
    params.delete(name)
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const selectedCollections = searchParams.get("collection_id")?.split(",") || []
  const selectedColors = searchParams.get("colors")?.split(",") || []
  const [minPrice, maxPrice] = (searchParams.get("price")?.split("-").map(Number)) || [undefined, undefined]


  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">

      {/* Section des produits triés */}
      <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} data-testid={dataTestId} />

      {/* Section des collections */}
      <GetCollectionsChoices collectionsChoisies={selectedCollections.join(",")} />

      {/* Section du filtre de prix */}
      <PriceFilter 
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={(min, max) => {
          if (min !== undefined || max !== undefined) {
            setQueryParams('price', `${min}-${max}`)
          } else {
            removeQueryParam('price')
          }
        }}
      />

      {/* Section du filtre de couleur */}
      <ColorFilter 
        selectedColors={selectedColors}
        onColorChange={(newColors) => {
          if (newColors.length > 0) {
            setQueryParams('colors', newColors.join(","))
          } else {
            removeQueryParam('colors')
          }
        }}
      />
    </div>
  )
}

export default RefinementList