import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * POST /store/sendcloud/create-parcel
 * 
 * Crée une parcel Sendcloud pour un cart donné.
 * TEST ONLY - ne pas utiliser en production.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { cartId } = req.body as { cartId: string }

    if (!cartId) {
      return res.status(400).json({ error: "cartId is required" })
    }

    // Utiliser remoteQuery pour récupérer le cart avec les données produit liées
    const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
    
    const [cart] = await remoteQuery({
      entryPoint: "cart",
      fields: [
        "id",
        "email",
        "metadata",
        "shipping_address.*",
        "shipping_methods.*",
        "shipping_methods.data",
        "items.*",
        "items.variant.*",
        "items.variant.product.*",
      ],
      variables: {
        filters: { id: cartId }
      }
    })

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" })
    }

    if (!cart.shipping_methods?.length) {
      return res.status(400).json({ error: "No shipping method selected" })
    }

    if (!cart.shipping_address) {
      return res.status(400).json({ error: "No shipping address" })
    }

    // Récupérer le service Sendcloud
    const sendcloudService = req.scope.resolve("sendcloudService") as {
      createParcel: (order: any) => Promise<any>
    }

    // Créer un objet "pseudo-order" à partir du cart
    const pseudoOrder = {
      id: cart.id,
      email: cart.email,
      shipping_address: cart.shipping_address,
      shipping_methods: cart.shipping_methods,
      items: cart.items?.map((item: any) => ({
        title: item.title,
        variant: {
          ...item.variant,
          product: item.variant?.product,
        },
        detail: { quantity: item.quantity },
        unit_price: item.unit_price,
      })),
      metadata: cart.metadata,
    }
    const parcel = await sendcloudService.createParcel(pseudoOrder)

    const cartService = req.scope.resolve(Modules.CART)
    await cartService.updateCarts([{
      id: cart.id,
      metadata: {
        ...(cart.metadata || {}),
        sendcloud_parcel_id: parcel.id,
        sendcloud_tracking_number: parcel.tracking_number,
      }
    }])

    return res.status(200).json({
      success: true,
      parcel: {
        id: parcel.id,
        tracking_number: parcel.tracking_number,
      }
    })

  } catch (error: any) {
    console.error("❌ [API] Error creating parcel:", error)
    return res.status(500).json({
      error: error?.message || "Failed to create parcel"
    })
  }
}
