// app/[countryCode]/order/[id]/confirmed/page.tsx
import { retrieveOrder } from "@lib/data/orders"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { sendOrderToSendCloud } from "@lib/data/cart"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Achat confirmé",
  description: "Votre achat a été confirmé",
}

export default async function OrderConfirmedPage({ params }: { params: { id: string }}) {
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  // Handle SendCloud integration on the server
  if (order.shipping_methods?.length) {
    try {
      await sendOrderToSendCloud(order)
      console.log("Order sent to SendCloud successfully")
    } catch (error) {
      console.error("Error sending order to SendCloud:", error)
    }
  }

  return <OrderCompletedTemplate order={order} />
}