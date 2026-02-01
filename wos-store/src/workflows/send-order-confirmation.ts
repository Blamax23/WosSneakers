import { 
    createWorkflow, 
    WorkflowResponse,
    transform,
} from "@medusajs/framework/workflows-sdk"
import { createSendcloudParcelStep } from "./steps/create-sendcloud-parcel"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { sendNotificationStep } from "./steps/send-notification"
import { generateInvoiceStep } from "./steps/generate-invoice"

type WorkflowInput = {
    id: string
}

export const sendOrderConfirmationWorkflow = createWorkflow(
    "send-order-confirmation",
    // @ts-ignore - Les deux branches retournent des types différents
    ({ id }: WorkflowInput) => {
      // @ts-ignore
    const { data: orders } = useQueryGraphStep({
        entity: "order",
        fields: [
            "id",
            "display_id",
            "email",
            "currency_code",
            "created_at",
            "total",
            "metadata",
            "items.*",
            "items.adjustments.*",
            "items.variant.*",
            "items.variant.product.*",
            "shipping_address.*",
            "billing_address.*",
            "shipping_methods.*",
            "shipping_methods.data",
            "customer.*",
            "total",
            "subtotal",
            "discount_total",
            "shipping_total",
            "shipping_subtotal",
            "tax_total",
            "item_subtotal",
            "item_total",
            "item_tax_total",
            "original_total",
            "original_subtotal",
            "original_tax_total",
        ],
        filters: {
            id,
        },
    })
    
        const parcel = createSendcloudParcelStep(orders[0])

        // Générer la facture
        // @ts-ignore - Le type Order du query graph est compatible avec OrderDTO
        const invoiceResult = generateInvoiceStep({ order: orders[0] })

        if (process.env.SENDCLOUD_EMAILS_ENABLED === "true") {
            // @ts-ignore - Types de retour différents selon la branche
            return new WorkflowResponse({ ok: true, sendcloud: true })
        }

        // Préparer les pièces jointes si la facture a été générée
        const notificationData = transform(
            { order: orders[0], invoiceResult },
            ({ order, invoiceResult }) => {
                const attachments: { content: Buffer; filename: string }[] = []
                
                if (invoiceResult?.buffer) {
                    attachments.push({
                        content: invoiceResult.buffer,
                        filename: `facture-${(order as any).display_id || order.id}.pdf`,
                    })
                }

                return {
                    order,
                    attachments,
                }
            }
        )

        const notification = sendNotificationStep([{
            to: orders[0].email as string,
            channel: "email",
            template: "order-placed",
            data: notificationData,
        }])
    
        return new WorkflowResponse(notification)
    }
)