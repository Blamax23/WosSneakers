"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader } from "@medusajs/icons"
import { Button } from "@medusajs/ui"

type ServicePoint = {
  id: number
  name: string
  street: string
  house_number: string
  postal_code: string
  city: string
  country: string
  distance?: number
  formatted_opening_times?: string
  carrier?: string
}

type Props = {
  cartId?: string
  current?: any
  shippingAddress?: {
    postal_code?: string
    country_code?: string
    city?: string
  } | null
  onPointSelected?: (point: ServicePoint) => void
}

export default function SendcloudPickup({ current, shippingAddress, onPointSelected }: Props) {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<ServicePoint | null>(
    current?.service_point || null
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)
  const [searchPostalCode, setSearchPostalCode] = useState(
    shippingAddress?.postal_code || ""
  )

  // Fetch service points based on postal code
  const fetchServicePoints = useCallback(async (postalCode: string) => {
    if (!postalCode || postalCode.length < 3) return

    setLoading(true)
    setMessage(null)
    try {
      const country = shippingAddress?.country_code?.toUpperCase() || "FR"
      // Utilise l'API route Next.js locale pour éviter les problèmes CORS
      const url = `/api/sendcloud/service-points?postal_code=${encodeURIComponent(postalCode)}&country=${country}&carrier=mondial_relay&limit=10`
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.error || "Échec de la récupération des points relais")
      }

      setServicePoints(data.service_points || [])
      setShowList(true)

      if ((data.service_points || []).length === 0) {
        setMessage("Aucun point relais trouvé pour ce code postal")
      }
    } catch (e: any) {
      console.error("Error fetching service points:", e)
      setMessage(e?.message || "Erreur lors de la recherche")
      setServicePoints([])
    } finally {
      setLoading(false)
    }
  }, [shippingAddress?.country_code])

  // Auto-fetch when shipping address changes
  useEffect(() => {
    if (shippingAddress?.postal_code && !selectedPoint) {
      setSearchPostalCode(shippingAddress.postal_code)
    }
  }, [shippingAddress?.postal_code, selectedPoint])

  // Save selected service point to cart
  const saveSelection = async (point: ServicePoint) => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/sendcloud/service-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicePoint: point,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Échec de l'enregistrement")
      
      setSelectedPoint(point)
      setShowList(false)
      onPointSelected?.(point)
    } catch (e: any) {
      setMessage(e?.message || "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border rounded-md p-4 mt-4 bg-ui-bg-subtle">
      <div className="flex items-center justify-between mb-3">
        <strong className="text-ui-fg-base">Choisissez votre point relais.</strong>
      </div>

      {/* Selected point display */}
      {selectedPoint && !showList && (
        <div className="bg-ui-bg-base border border-ui-border-base rounded-md p-3 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-ui-fg-base">{selectedPoint.name}</div>
              <div className="text-sm text-ui-fg-muted">
                {selectedPoint.street} {selectedPoint.house_number}
              </div>
              <div className="text-sm text-ui-fg-muted">
                {selectedPoint.postal_code} {selectedPoint.city}
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowList(true)}
              variant="secondary"
              
            >
              Changer
            </Button>
          </div>
        </div>
      )}

      {/* Search and list */}
      {(!selectedPoint || showList) && (
        <>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchPostalCode}
              onChange={(e) => setSearchPostalCode(e.target.value)}
              placeholder="Code postal"
              className="flex-1 bg-ui-bg-base border border-ui-border-base rounded px-3 py-2 text-sm"
            />
            <Button
              type="button"
              onClick={() => fetchServicePoints(searchPostalCode)}
              disabled={loading || !searchPostalCode}
              className="bg-ui-bg-interactive text-ui-fg-on-inverted bg-black px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" /> : "Rechercher"}
            </Button>
          </div>

          {/* Service points list */}
          {servicePoints.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {servicePoints.map((point) => (
                <div
                  key={point.id}
                  onClick={() => !saving && saveSelection(point)}
                  className={`
                    p-3 border rounded-md cursor-pointer transition-colors
                    ${selectedPoint?.id === point.id 
                      ? 'border-ui-border-interactive bg-ui-bg-interactive-hover' 
                      : 'border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong'
                    }
                    ${saving ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm text-ui-fg-base">{point.name}</div>
                      <div className="text-xs text-ui-fg-muted">
                        {point.street} {point.house_number}, {point.postal_code} {point.city}
                      </div>
                      {point.distance && (
                        <div className="text-xs text-ui-fg-subtle mt-1">
                          📍 {(point.distance / 1000).toFixed(1)} km
                        </div>
                      )}
                    </div>
                    {saving && selectedPoint?.id === point.id && (
                      <Loader className="animate-spin text-ui-fg-interactive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedPoint && showList && (
            <button
              type="button"
              onClick={() => setShowList(false)}
              className="mt-2 text-sm text-ui-fg-muted hover:text-ui-fg-base underline"
            >
              Annuler
            </button>
          )}
        </>
      )}

      {message && (
        <div className={`mt-2 text-sm ${message.includes('✅') ? 'text-ui-fg-interactive' : 'text-ui-fg-error'}`}>
          {message}
        </div>
      )}
    </div>
  )
}
