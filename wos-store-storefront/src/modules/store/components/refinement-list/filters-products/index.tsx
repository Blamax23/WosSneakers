"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { listCollections } from "@lib/data/collections"
import { StoreCollection } from "@medusajs/types"
import { useEffect, useState, useRef } from "react"

type Props = {
  collectionsChoisies: string
}

export default function GetCollectionsChoices({ collectionsChoisies }: Props) {
  const [collections, setCollections] = useState<StoreCollection[]>([])
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // On récupère les IDs depuis l’URL, et on initialise le state local avec
  const initialSelected = searchParams.get("collection_id")?.split(",") || []
  const [selectedLocal, setSelectedLocal] = useState<string[]>(initialSelected)

  // Charger collections une fois
  useEffect(() => {
    listCollections().then((res) => {
      setCollections(res.collections)
    })
  }, [])

  // Debounce pour push URL
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)

    debounceTimeout.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (selectedLocal.length > 0) {
        params.set("collection_id", selectedLocal.join(","))
      } else {
        params.delete("collection_id")
      }
      router.push(`${pathname}?${params.toString()}`)
    }, 500)

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    }
  }, [selectedLocal, router, pathname, searchParams])

  const toggleCollection = (id: string) => {
    setSelectedLocal((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <h2 className="txt-compact-small-plus text-ui-fg-muted py-4">Collections</h2>
      <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto py-1 w-full">
        {collections.map((c) => (
          <li key={c.id}>
            <label className="flex items-center gap-2 cursor-pointer txt-compact-small">
              <input
                type="checkbox"
                checked={selectedLocal.includes(c.id)}
                onChange={() => toggleCollection(c.id)}
                className="w-5 h-5 rounded-md border border-gray-700 bg-gray-900 checked:bg-gray-900 checked:border-indigo-500 text-indigo-500 accent-gray-900"
              />
              {c.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

type PriceFilterProps = {
  minPrice?: number
  maxPrice?: number
  onPriceChange: (min: number | undefined, max: number | undefined) => void
}

const PriceFilter = ({ minPrice, maxPrice, onPriceChange }: PriceFilterProps) => {
  const [localMinPrice, setLocalMinPrice] = useState<string>(minPrice?.toString() || "")
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(maxPrice?.toString() || "")

  // Synchroniser les valeurs locales avec les props
  useEffect(() => {
    setLocalMinPrice(minPrice?.toString() || "")
    setLocalMaxPrice(maxPrice?.toString() || "")
  }, [minPrice, maxPrice])

  const handleApplyFilter = () => {
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined

    // Validation basique
    if (min && max && min > max) {
      alert("Le prix minimum ne peut pas être supérieur au prix maximum")
      return
    }
    onPriceChange(min, max)
  }

  const handleClearFilter = () => {
    setLocalMinPrice("")
    setLocalMaxPrice("")
    onPriceChange(undefined, undefined)
  }

  // Fonction pour appliquer automatiquement lors de l'appui sur Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilter()
    }
  }

  return (
    <div className="border-b border-gray-200 pb-6 w-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Prix</h3>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">
              Min (€)
            </label>
            <input
              type="number"
              id="min-price"
              min="0"
              step="1"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>

          <span className="text-gray-500 mt-6">-</span>

          <div className="flex-1">
            <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">
              Max (€)
            </label>
            <input
              type="number"
              id="max-price"
              min="0"
              step="1"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="∞"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplyFilter}
            className="flex-1 bg-black text-white px-4 py-2 border border-black rounded-md hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            Appliquer
          </button>

          {(minPrice !== undefined || maxPrice !== undefined) && (
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
            >
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}



export { GetCollectionsChoices, PriceFilter }