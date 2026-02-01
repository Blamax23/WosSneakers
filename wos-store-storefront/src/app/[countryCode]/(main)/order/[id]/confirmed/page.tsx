// app/[countryCode]/order/[id]/confirmed/page.tsx
import { retrieveOrder, retrieveOrderMetadata } from "@lib/data/orders"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { sendOrderToSendCloud, getTrackingLinkOrder } from "@lib/data/cart"
import { notFound } from "next/navigation"
import { StoreOrder } from "@medusajs/types"


export const metadata: Metadata = {
  title: "Achat confirmé",
  description: "Votre achat a été confirmé",
}

export default async function OrderConfirmedPage({ params }: { params: { id: string } }) {
  const order = await retrieveOrder(params.id).catch(() => null)
  const orderMetadata = await retrieveOrderMetadata(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  let fullOrder = null
  if (order && orderMetadata) {
    fullOrder = order && orderMetadata
      ? {
        ...order,
        metadata: orderMetadata.metadata, // override proprement
      }
      : order
  }

  if (fullOrder!) {
    return <OrderCompletedTemplate order={fullOrder} />
  }
}