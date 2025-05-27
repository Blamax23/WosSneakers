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
