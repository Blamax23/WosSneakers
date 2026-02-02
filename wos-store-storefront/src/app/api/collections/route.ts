import { NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export async function GET() {
  try {
    const { collections } = await sdk.client.fetch<{
      collections: HttpTypes.StoreCollection[]
    }>("/store/collections", {
      query: { limit: "100", offset: "0" },
    })

    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ collections: [] }, { status: 500 })
  }
}
