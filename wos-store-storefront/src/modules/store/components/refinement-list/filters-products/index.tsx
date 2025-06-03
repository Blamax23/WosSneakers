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
      <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto py-1 w-2/3">
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
    <div className="border-b border-gray-200 pb-6 w-3/4">
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
              step="0.01"
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
              step="0.01"
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


const AVAILABLE_COLORS = [
  { name: "Noir", value: "black", hex: "#000000" },
  { name: "Blanc", value: "white", hex: "#FFFFFF" },
  { name: "Rouge", value: "red", hex: "#EF4444" },
  { name: "Bleu", value: "blue", hex: "#3B82F6" },
  { name: "Vert", value: "green", hex: "#10B981" },
  { name: "Jaune", value: "yellow", hex: "#F59E0B" },
  { name: "Rose", value: "pink", hex: "#EC4899" },
  { name: "Violet", value: "purple", hex: "#8B5CF6" },
  { name: "Gris", value: "gray", hex: "#6B7280" },
  { name: "Marron", value: "brown", hex: "#92400E" },
  { name: "Orange", value: "orange", hex: "#F97316" },
  { name: "Beige", value: "beige", hex: "#D2B48C" },
]

type ColorFilterProps = {
  selectedColors: string[]
  onColorChange: (colors: string[]) => void
}

const ColorFilter = ({ selectedColors, onColorChange }: ColorFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleColorToggle = (colorValue: string) => {
    const newSelectedColors = selectedColors.includes(colorValue)
      ? selectedColors.filter(color => color !== colorValue)
      : [...selectedColors, colorValue]
    
    onColorChange(newSelectedColors)
  }

  const handleClearAll = () => {
    onColorChange([])
  }

  // Afficher seulement les 8 premières couleurs par défaut
  const colorsToShow = isExpanded ? AVAILABLE_COLORS : AVAILABLE_COLORS.slice(0, 8)

  return (
    <div className="border-b border-gray-200 pb-6 w-3/4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Couleur</h3>
        {selectedColors.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Tout effacer
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Grille de couleurs */}
        <div className="grid grid-cols-4 gap-3">
          {colorsToShow.map((color) => {
            const isSelected = selectedColors.includes(color.value)
            
            return (
              <button
                key={color.value}
                onClick={() => handleColorToggle(color.value)}
                className={`group relative flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-black bg-gray-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={color.name}
              >
                {/* Cercle de couleur */}
                <div 
                  className={`w-8 h-8 rounded-full border-2 ${
                    isSelected ? 'border-black border-4' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                
                {/* Nom de la couleur */}
                <span className="text-xs text-gray-700 mt-1 text-center leading-tight">
                  {color.name}
                </span>
                
                {/* Indicateur de sélection */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        {/* Bouton pour voir plus/moins de couleurs */}
        {AVAILABLE_COLORS.length > 8 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            {isExpanded ? 'Voir moins' : `Voir ${AVAILABLE_COLORS.length - 8} couleurs de plus`}
          </button>
        )}
        
        {/* Affichage des couleurs sélectionnées */}
        {selectedColors.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              {selectedColors.length} couleur{selectedColors.length > 1 ? 's' : ''} sélectionnée{selectedColors.length > 1 ? 's' : ''} :
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedColors.map((colorValue) => {
                const color = AVAILABLE_COLORS.find(c => c.value === colorValue)
                return (
                  <span 
                    key={colorValue}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-black text-white text-xs font-medium"
                  >
                    {color?.name || colorValue}
                    <button
                      onClick={() => handleColorToggle(colorValue)}
                      className="ml-1 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { GetCollectionsChoices, PriceFilter, ColorFilter }