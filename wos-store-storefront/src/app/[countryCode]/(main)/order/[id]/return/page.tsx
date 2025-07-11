// app/[countryCode]/order/[id]/confirmed/page.tsx
import { retrieveOrder } from "@lib/data/orders"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { listReturnReasons } from "@lib/data/orders"
import { notFound } from "next/navigation"
import { Button } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Demande de retour",
  description: "Faites une demande de retour",
}

export default async function OrderReturnedPage({ params }: { params: { id: string }}) {
  const order = await retrieveOrder(params.id).catch(() => null)

  console.log("Voici l'order au départ : ", order)

  if (!order) {
    return notFound()
  }

  const returnReasons = listReturnReasons()

  console.log(returnReasons)

  return <Button>Hello</Button>
}