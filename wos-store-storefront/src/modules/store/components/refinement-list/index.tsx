"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import SortProducts, { SortOptions } from "./sort-products"
import GetCollectionsChoices from "./filters-products"

type RefinementListProps = {
  sortBy: SortOptions
  collections?: string
  search?: boolean
  'data-testid'?: string
}

const RefinementList = ({ sortBy, collections, 'data-testid': dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State pour les filtres
  const [minPrice, setMinPrice] = useState<number | string>("")
  const [maxPrice, setMaxPrice] = useState<number | string>("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  // Gestion des filtres de prix
  const handlePriceFilter = () => {
    if (minPrice && maxPrice) {
      setQueryParams("min_price", minPrice.toString())
      setQueryParams("max_price", maxPrice.toString())
    }
  }

  // Gestion des filtres de couleur
  const handleColorFilter = (color: string) => {
    const updatedColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color) // Enlever la couleur si elle est déjà sélectionnée
      : [...selectedColors, color] // Ajouter la couleur si elle n'est pas déjà sélectionnée

    setSelectedColors(updatedColors)

    // Appliquer les filtres de couleur
    setQueryParams("colors", updatedColors.join(","))
  }

  const selectedCollections = collections?.split(",") || []

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">

      {/* Section des produits triés */}
      <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} data-testid={dataTestId} />

      <GetCollectionsChoices collectionsChoisies={selectedCollections.join(",")} />
      {/* Filtre par prix */}
      <div className="mb-6 sm:w-full md:w-auto">
        <h3 className="font-semibold text-lg mb-2">Filtrer par prix</h3>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="border p-2 rounded w-full sm:w-[120px]"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="border p-2 rounded w-full sm:w-[120px]"
          />
          <button onClick={handlePriceFilter} className="border p-2 rounded bg-black text-white w-full sm:w-auto">
            Appliquer
          </button>
        </div>
      </div>

      {/* Filtre par couleur */}
      <div className="mb-6 sm:w-full md:w-auto">
        <h3 className="font-semibold text-lg mb-2">Filtrer par couleur</h3>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {["Rouge", "Bleu", "Vert", "Noir", "Blanc"].map((color) => (
            <button
              key={color}
              onClick={() => handleColorFilter(color)}
              className={`px-4 py-2 rounded border ${
                selectedColors.includes(color)
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RefinementList
