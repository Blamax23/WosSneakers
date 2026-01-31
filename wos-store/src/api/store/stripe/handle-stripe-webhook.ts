// src/api/store/stripe/handle-stripe-webhook.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const sig = req.headers["stripe-signature"] as string | undefined
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event | null = null

  try {
    if (secret && (req as any).rawBody) {
      // ✅ Verify signature with the exact raw body
      const rawBody = await (req as any).rawBody
      event = stripe.webhooks.constructEvent(rawBody, sig!, secret)
    } else {
      // ⚠️ Fallback for local/dev: trust body without signature (not recommended for production)
      const body = (req as any).body || {}
      if (secret) {
        console.warn("Stripe raw body is missing — cannot verify signature. Ensure raw body parsing is enabled for this route.")
      }
      event = body as Stripe.Event
    }
  } catch (err: any) {
    console.error("❌ Stripe webhook constructEvent error:", err?.message || err)
    return res.status(400).send(`Webhook Error: ${err?.message || "invalid"}`)
  }

  if (!event) {
    return res.status(400).send("No event parsed")
  }

  // 🔔 Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      console.log("✅ checkout.session.completed:", session.id)
      break
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log("✅ payment_intent.succeeded:", pi.id)
      break
    }
    default:
      console.log(`📩 Stripe event: ${event.type}`)
  }

  res.status(200).send()
}
