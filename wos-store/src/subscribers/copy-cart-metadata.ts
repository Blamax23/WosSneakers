import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Ce subscriber copie les métadonnées du cart (notamment sendcloud) 
 * vers la commande nouvellement créée.
 * Medusa v2 ne copie pas automatiquement les métadonnées du cart vers l'order.
 */
export default async function copyCartMetadataHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    try {
        const orderService = container.resolve(Modules.ORDER)
        const cartService = container.resolve(Modules.CART)
        const remoteQuery = container.resolve("remoteQuery")

        // Récupérer la commande avec le cart_id
        const orders = await remoteQuery({
            order: {
                __args: { filters: { id: data.id } },
                id: true,
                metadata: true,
                // Dans Medusa v2, l'order n'a pas de cart_id direct
                // On doit chercher le cart via une autre méthode
            }
        })

        const order = orders.order?.[0] || orders?.[0]
        if (!order) {
            console.log("⚠️ Order not found for metadata copy:", data.id)
            return
        }

        // Si la commande a déjà des métadonnées sendcloud, on ne fait rien
        if (order.metadata?.sendcloud) {
            console.log("✅ Order already has sendcloud metadata")
            return
        }

        // Chercher le cart le plus récent pour ce client avec des métadonnées sendcloud
        // C'est un workaround car Medusa v2 ne garde pas le lien cart -> order directement
        const carts = await remoteQuery({
            cart: {
                __args: { 
                    filters: { completed_at: { $ne: null } },
                    order: { completed_at: "DESC" },
                    take: 1
                },
                id: true,
                metadata: true,
                completed_at: true,
            }
        })

        const cart = carts.cart?.[0] || carts?.[0]
        if (!cart?.metadata?.sendcloud) {
            console.log("⚠️ No recent cart with sendcloud metadata found")
            return
        }

        // Mettre à jour les métadonnées de la commande
        await orderService.updateOrders([{
            id: order.id,
            metadata: {
                ...order.metadata,
                sendcloud: cart.metadata.sendcloud,
            }
        }])

    } catch (error) {
        console.error("❌ Failed to copy cart metadata to order:", error)
        // Ne pas faire échouer la commande si la copie des métadonnées échoue
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
}
