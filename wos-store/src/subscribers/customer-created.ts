import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/framework"
import { sendCustomerCreatedWorkflow } from "../workflows/send-customer-created"

export default async function customerCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    console.log("On rentre dans la route pour le customer created")
    await sendCustomerCreatedWorkflow(container)
        .run({
            input: {
            id: data.id,
            },
        })
    }
export const config = {
  event: "customer.created", // écoutez l'événement de livraison
}