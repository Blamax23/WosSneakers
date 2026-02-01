import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * GET /api/sendcloud/service-points
 * 
 * Proxy vers le backend Medusa pour récupérer les points relais Sendcloud.
 * Cela évite les problèmes CORS car la requête est faite côté serveur.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postal_code = searchParams.get("postal_code")
    const country = searchParams.get("country") || "FR"
    const carrier = searchParams.get("carrier") || "mondial_relay"
    const limit = searchParams.get("limit") || "10"

    if (!postal_code) {
      return NextResponse.json(
        { error: "postal_code is required" },
        { status: 400 }
      )
    }

    const backendUrl = `${BACKEND_URL}/sendcloud/service-points?postal_code=${encodeURIComponent(postal_code)}&country=${country}&carrier=${carrier}&limit=${limit}`
    
    console.log("📍 Proxying service points request to:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Backend error:", data)
      return NextResponse.json(
        { error: data?.error || "Failed to fetch service points" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error proxying service points:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
