import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * POST /api/sendcloud/create-parcel
 * 
 * Crée une parcel Sendcloud pour un cart donné.
 * À utiliser pour les tests uniquement.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cartId } = body

    if (!cartId) {
      return NextResponse.json(
        { error: "cartId is required" },
        { status: 400 }
      )
    }

    // Appeler le backend pour créer la parcel
    const response = await fetch(`${BACKEND_URL}/store/sendcloud/create-parcel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      body: JSON.stringify({ cartId }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Backend error:", data)
      return NextResponse.json(
        { error: data?.error || "Failed to create parcel" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error creating parcel:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
