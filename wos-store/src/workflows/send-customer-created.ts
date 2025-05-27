import { 
    createWorkflow, 
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { sendNotificationStep } from "./steps/send-notification"

type WorkflowInput = {
    id: string
}

export const sendCustomerCreatedWorkflow = createWorkflow(
    "send-customer-created",
    ({ id }: WorkflowInput) => {
      // @ts-ignore
    const { data: customers } = useQueryGraphStep({
        entity: "customer",
        fields: [
            "id",
            "email",
            "first_name",
            "last_name"
        ],
        filters: {
            id,
        },
    })

        console.log("orders", customers)
    
        const notification = sendNotificationStep([{
            to: customers[0].email as string,
            channel: "email",
            template: "customer-created",
            data: {
                first_name: customers[0].first_name,
            }
        }])
    
        return new WorkflowResponse(notification)
    }
)