import type { SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function customerDeletedHandler({ 
  event: { data },
  container,
}: any) {
  
  const notificationService = container.resolve(Modules.NOTIFICATION)
  
  try {
    await notificationService.createNotifications({
      to: data.email,
      channel: "email",
      template: "customer-deleted",
      data: {
        first_name: data.first_name,
        email: data.email,
        deleted_at: data.deleted_at,
      },
    })
  } catch (error) {
    console.error("❌ Erreur envoi email:", error)
  }
}

export const config: SubscriberConfig = {
  event: "customer.deleted",
}