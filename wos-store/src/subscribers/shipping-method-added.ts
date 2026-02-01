import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * TEST ONLY: Crée une parcel Sendcloud après la validation du shipping.
 * Ne pas utiliser en production - les paniers abandonnés créeront des parcels inutiles.
 */
export default async function shippingMethodAddedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const cartId = data.id
  
  try {
    // Récupérer le cart avec les détails
    const cartService = container.resolve(Modules.CART)
    const cart = await cartService.retrieveCart(cartId, {
      relations: ["shipping_methods", "shipping_address", "items", "items.variant", "items.variant.product"],
    })
    
    if (!cart.shipping_methods?.length) {
      console.log("No shipping methods on cart yet")
      return
    }
    
    if (!cart.shipping_address) {
      console.log("No shipping address on cart yet")
      return
    }

    const shippingMethod = cart.shipping_methods[0]
    
    // Récupérer le service Sendcloud
    const sendcloudService = container.resolve("sendcloud-service") as {
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
        variant: item.variant,
        detail: { quantity: item.quantity },
        unit_price: item.unit_price,
      })),
      metadata: cart.metadata,
    }
    
    const parcel = await sendcloudService.createParcel(pseudoOrder)
    
    // Stocker l'ID de la parcel dans les metadata du cart
    await cartService.updateCarts([{
      id: cart.id,
      metadata: {
        ...(cart.metadata || {}),
        sendcloud_parcel_id: parcel.id,
        sendcloud_tracking_number: parcel.tracking_number,
      }
    }])
    
  } catch (error) {
    console.error("❌ [TEST] Error creating parcel:", error)
    // Ne pas bloquer le flow checkout en cas d'erreur
  }
}

export const config: SubscriberConfig = {
  event: "cart.shipping_method_added",
}
