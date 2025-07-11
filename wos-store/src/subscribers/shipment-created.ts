import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function shipmentCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
    if (data.no_notification) {
        return
    }

    const query = container.resolve("query")
    // Récupère les détails du shipment, y compris le tracking
    const { data: [shipment] } = await query.graph({
        entity: "shipment",
        fields: [
            "id",
            "tracking_number",
            "tracking_url",
            "order.email",
            // autres champs nécessaires
        ],
        filters: { id: data.id },
    })

    const notificationModuleService = container.resolve(Modules.NOTIFICATION)
    await notificationModuleService.createNotifications({
        to: shipment.order.email,
        channel: "email",
        template: "shipment-created",
        data: {
            tracking_number: shipment.tracking_number,
            tracking_url: shipment.tracking_url,
            // autres infos utiles
        },
    })
}

export const config: SubscriberConfig = {
    event: "shipment.created",
}