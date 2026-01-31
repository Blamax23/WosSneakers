import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

interface OrderRequestBody {
  order: any;
}

export async function POST(req: MedusaRequest<OrderRequestBody>, res: MedusaResponse) {
  const { order_id } = req.params as { order_id: string }
  const order = req.body.order

  if (!order) {
    return res.status(400).json({ error: "Missing 'order' in request body" })
  }

  console.log(`Creating label for order_id: ${order_id}`)

  const sendcloudService = req.scope.resolve("sendcloudService") as {
    createLabelForOrder: (order: any) => Promise<any>
  }

  try {
    const label = await sendcloudService.createLabelForOrder(order)

    res.status(200).json({
      message: `Label created for order ${order_id}`,
      label,
    })
  } catch (error) {
    console.error("Sendcloud error:", error)
    res.status(500).json({ error: "Failed to create label" })
  }
}