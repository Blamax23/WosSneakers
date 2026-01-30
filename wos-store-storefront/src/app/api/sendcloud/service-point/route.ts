import { NextRequest, NextResponse } from "next/server"
import { updateCart } from "@lib/data/cart"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { servicePoint, shipmentId, postNumber } = body || {}

    if (!servicePoint || !servicePoint.id) {
      return NextResponse.json({ error: "Missing servicePoint.id" }, { status: 400 })
    }

    // Persist in cart metadata under `sendcloud`
    const updated = await updateCart({
      metadata: {
        sendcloud: {
          to_service_point: String(servicePoint.id),
          service_point: servicePoint,
          to_post_number: postNumber ? String(postNumber) : undefined,
          shipment_id: shipmentId ? String(shipmentId) : undefined,
          saved_at: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ ok: true, cart: updated })
  } catch (e: any) {
    console.error("Error saving service point:", e)
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
