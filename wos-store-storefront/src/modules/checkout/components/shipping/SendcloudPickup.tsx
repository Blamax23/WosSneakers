"use client"

import { useEffect, useState } from "react"

type Props = {
  cartId?: string
  current?: any
}

export default function SendcloudPickup({ current }: Props) {
  const [servicePointId, setServicePointId] = useState<string>(current?.to_service_point || "")
  const [postNumber, setPostNumber] = useState<string>(current?.to_post_number || "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Optional: load SPP script if feature-flag is set
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENDCLOUD_SPP_ENABLED !== "true") return
    if ((window as any)._sppLoaded) return
    const s = document.createElement("script")
    s.src = (process.env.NEXT_PUBLIC_SENDCLOUD_SPP_SRC as string) || "https://sendcloud.github.io/spp-integration-example/spp.js"
    s.async = true
    s.onload = () => ((window as any)._sppLoaded = true)
    document.body.appendChild(s)
  }, [])

  const openPicker = () => {
    const w = (window as any)
    if (!w._sppLoaded || !w.openServicePointPicker) {
      setMessage("Sélecteur de point relais indisponible. Renseignez l'ID manuellement ci-dessous.")
      return
    }
    w.openServicePointPicker({
      country: "FR",
      // you can prefill with address details if available
    }, (result: any) => {
      if (!result) return
      setServicePointId(String(result.id))
      if (result.postNumber) setPostNumber(String(result.postNumber))
    })
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/sendcloud/service-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicePoint: { id: servicePointId },
          postNumber
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Échec de l'enregistrement")
      setMessage("Point relais enregistré pour la commande ✅")
    } catch (e: any) {
      setMessage(e?.message || "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border rounded-md p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <strong>Livraison en point relais</strong>
        <button
          type="button"
          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
          onClick={openPicker}
        >
          Choisir via le sélecteur
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="txt-small-plus mb-1">ID du point relais</span>
          <input
            value={servicePointId}
            onChange={(e) => setServicePointId(e.target.value)}
            className="bg-ui-bg-base border rounded px-3 py-2"
            placeholder="Ex: 1234567"
          />
        </label>
        <label className="flex flex-col">
          <span className="txt-small-plus mb-1">N° de boîte (optionnel)</span>
          <input
            value={postNumber}
            onChange={(e) => setPostNumber(e.target.value)}
            className="bg-ui-bg-base border rounded px-3 py-2"
            placeholder="Pour DHL DE seulement"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="bg-ui-bg-interactive text-ui-fg-on-inverted px-4 py-2 rounded"
          onClick={save}
          disabled={saving || !servicePointId}
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {message && <span className="txt-small">{message}</span>}
      </div>

      {current?.service_point && (
        <div className="mt-3 text-ui-fg-muted txt-small">
          <div>Point actuel: <code>{current.service_point?.name || current.to_service_point}</code></div>
          <div>Adresse: <code>{current.service_point?.street} {current.service_point?.house_number}, {current.service_point?.postal_code} {current.service_point?.city}</code></div>
        </div>
      )}
    </div>
  )
}
