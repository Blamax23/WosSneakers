// src/subscribers/handle-reset.ts
import { Modules } from "@medusajs/framework/utils"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

export default async function resetPasswordTokenHandler({
  event: {
    data: { entity_id: email, token, actor_type },
  },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const customerService = container.resolve(Modules.CUSTOMER)
  const config = container.resolve("configModule")

  const customers = await customerService.listCustomers({ email })
  const customer = customers[0]

  let urlPrefix = ""

  if (actor_type === "customer") {
    // URL de ton storefront (configurable dans configModule)
    urlPrefix = process.env.NEXT_PUBLIC_MEDUSA_FRONTEND_URL || "http://localhost:8000"
  } else {
    // URL de ton admin
    const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    urlPrefix = `${backendUrl}`
  }

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    // Remplace par l’ID de ton template dans ton provider (SendGrid, Resend, etc.)
    template: "password-reset",
    data: {
      resetLink: `${urlPrefix}/reset-password?token=${token}&email=${email}`,
      customerName: customer.first_name,
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}