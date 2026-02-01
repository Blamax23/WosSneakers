import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// Simple in-memory lock to prevent concurrent requests for the same payment collection
const initLocks = new Map<string, boolean>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { paymentCollectionId, providerId } = body

    if (!paymentCollectionId || !providerId) {
      return NextResponse.json(
        { error: "paymentCollectionId and providerId are required" },
        { status: 400 }
      )
    }

    // Check if already processing this payment collection
    if (initLocks.get(paymentCollectionId)) {
      return NextResponse.json(
        { error: "Payment initialization already in progress" },
        { status: 409 }
      )
    }

    // Acquire lock
    initLocks.set(paymentCollectionId, true)

    try {
      // Forward the authorization header if present
      const authHeader = req.headers.get("authorization") || ""

      const res = await fetch(
        `${BACKEND_URL}/store/payment-collections/${paymentCollectionId}/payment-sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUBLISHABLE_KEY,
            // Don't forward auth header - it may cause issues with payment workflows
          },
          body: JSON.stringify({ provider_id: providerId }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        console.error("❌ Backend payment session error:", data)
        return NextResponse.json(data, { status: res.status })
      }

      return NextResponse.json(data)
    } finally {
      // Release lock after a short delay to prevent rapid retries
      setTimeout(() => {
        initLocks.delete(paymentCollectionId)
      }, 2000)
    }
  } catch (error: any) {
    console.error("❌ API route payment init error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
