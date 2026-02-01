import type { SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function customerDeletedHandler({ 
  event,
  container,
}: any) {
  // Les données peuvent être dans event.data ou directement dans event
  const data = event.data || event
  
  console.log("📧 customer.deleted event received:", JSON.stringify(event, null, 2))
  
  // Vérifier que les données nécessaires sont présentes
  if (!data.email) {
    console.error("❌ Email manquant dans l'événement customer.deleted")
    return
  }
  
  const notificationService = container.resolve(Modules.NOTIFICATION)
  
  try {
    await notificationService.createNotifications({
      to: data.email,
      channel: "email",
      template: "customer-deleted",
      data: {
        first_name: data.first_name || "Client",
        email: data.email,
        deleted_at: data.deleted_at || new Date().toISOString(),
      },
    })
    console.log("✅ Email de confirmation de suppression envoyé à:", data.email)
  } catch (error) {
    console.error("❌ Erreur envoi email:", error)
  }
}

export const config: SubscriberConfig = {
  event: "customer.deleted",
}