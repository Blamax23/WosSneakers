// src/app/api/capture-payment/[cartId]/route.ts
import { placeOrder, retrieveCart } from "@lib/data/cart"
import { NextRequest, NextResponse } from "next/server"

type Params = Promise<{ cartId: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { cartId } = await params
  const { origin, searchParams } = req.nextUrl

  const paymentIntent = searchParams.get("payment_intent")
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret"
  )
  const redirectStatus = searchParams.get("redirect_status") || ""
  const countryCode = searchParams.get("country_code")

  const cart = await retrieveCart(cartId)

  if (!cart) {
    return NextResponse.redirect(`${origin}/${countryCode}`)
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (payment) => payment.data.id === paymentIntent
  )

  if (
    !paymentSession ||
    paymentSession.data.client_secret !== paymentIntentClientSecret ||
    !["pending", "succeeded"].includes(redirectStatus) ||
    !["pending", "authorized"].includes(paymentSession.status)
  ) {
    return NextResponse.redirect(
      `${origin}/${countryCode}/cart?step=review&error=payment_failed`
    )
  }

  const order = await placeOrder(cartId)

  if (order) {
    return NextResponse.redirect(
        `${origin}/${countryCode}/order/${order.id}/confirmed`
    )
}
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
    try {
        const { cartId } = await params
        const body = await req.json()

        // Appeler Medusa pour mettre à jour le panier.
        // On ajoute la publishable key (v2) pour éviter les erreurs en local/prod.
        const cleanEnv = (v?: string) =>
            (v || "").trim().replace(/^['\"]|['\"]$/g, "")

        const medusaUrl = cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) ||
            cleanEnv(process.env.MEDUSA_BACKEND_URL) ||
            'http://localhost:9000'
        const publishableKey = cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)

        const response = await fetch(`${medusaUrl}/store/carts/${cartId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(publishableKey ? { 'x-publishable-api-key': publishableKey } : {}),
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Medusa API error:', errorData)
            return NextResponse.json(
                { error: 'Failed to update cart', details: errorData },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating cart:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}