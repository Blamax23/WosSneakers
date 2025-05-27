import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/framework"
import { sendOrderCompletedWorkflow } from "../workflows/send-order-completed"

export default async function orderPlacedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    await sendOrderCompletedWorkflow(container)
        .run({
            input: {
            id: data.id,
            },
        })
    }
export const config = {
  event: "order.completed", // écoutez l'événement de livraison
}