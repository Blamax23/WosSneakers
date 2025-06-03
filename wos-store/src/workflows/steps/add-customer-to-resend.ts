// ./steps/add-to-resend.ts
import { createStep } from "@medusajs/workflows-sdk"
import { Resend } from "resend"
import { WorkflowData } from "@medusajs/framework/workflows-sdk"

export const addToResendStep = createStep("add-to-resend", async (customer : any) => {
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.contacts.create({
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_ID || "5cd7e419-f1b1-45b2-b408-d5e4c9e73a34",
    })
})
