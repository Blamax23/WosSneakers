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
  console.log("Voici les metadata de l'order : ", orderMetadata)
  console.log("J'affiche l'order au départ : ", fullOrder)

  // let labelData = null
  // Handle SendCloud integration on the server
  // if (order.shipping_methods?.length) {
  //   try {
  //     labelData = await sendOrderToSendCloud(fullOrder)
  //     console.log("Order sent to SendCloud successfully")
  //   } catch (error) {
  //     console.error("Error sending order to SendCloud:", error)
  //   }
  // }

  // if (labelData!) {
  //   console.log(labelData.label.parcel.id)
  //   const trackingLink = await getTrackingLinkOrder(labelData.label.parcel.id.toString())
  //   fullOrder = {
  //     ...fullOrder,
  //     metadata: {
  //       ...fullOrder?.metadata,
  //       tracking_link: trackingLink,
  //     },
  //   } as StoreOrder
  // }

  // console.log("J'ai ajouté le trackingLink : ", fullOrder)

  if (fullOrder!) {
    return <OrderCompletedTemplate order={fullOrder} />
  }
}