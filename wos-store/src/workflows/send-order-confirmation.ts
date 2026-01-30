import { 
    createWorkflow, 
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createSendcloudParcelStep } from "./steps/create-sendcloud-parcel"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { sendNotificationStep } from "./steps/send-notification"

type WorkflowInput = {
    id: string
}

export const sendOrderConfirmationWorkflow = createWorkflow(
    "send-order-confirmation",
    ({ id }: WorkflowInput) => {
      // @ts-ignore
    const { data: orders } = useQueryGraphStep({
        entity: "order",
        fields: [
            "id",
            "display_id",
            "email",
            "currency_code",
            "total",
            "items.*",
            "shipping_address.*",
            "billing_address.*",
            "shipping_methods.*",
            "customer.*",
            "total",
            "subtotal",
            "discount_total",
            "shipping_total",
            "tax_total",
            "item_subtotal",
            "item_total",
            "item_tax_total",
        ],
        filters: {
            id,
        },
    })
    
        const parcel = createSendcloudParcelStep(orders[0])

        // Optionally skip our own emails if Sendcloud emails are enabled
        if (process.env.SENDCLOUD_EMAILS_ENABLED === "true") {
            return new WorkflowResponse({ ok: true, sendcloud: true })
        }

        const notification = sendNotificationStep([{
            to: orders[0].email as string,
            channel: "email",
            template: "order-placed",
            data: {
            order: orders[0],
            },
        }])
    
        return new WorkflowResponse(notification)
    }
)