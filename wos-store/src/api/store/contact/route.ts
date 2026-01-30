import type { MedusaRequest, MedusaResponse, AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { container } from "@medusajs/framework"

type SendContactBody = {
    name: string
    email: string
    message: string
}

export const POST = async (
  req: AuthenticatedMedusaRequest<SendContactBody>,
  res: MedusaResponse
) => {
  const { name, email, message } = req.body || {}
    if (!name || !email  || !message) {
        return res.status(400).json({
        message: "Tous les champs sont requis",
        })
    }

    const notificationModuleService = container.resolve(Modules.NOTIFICATION)

    await notificationModuleService.createNotifications({
        to: process.env.EMAIL_WOS || "",
        channel: "email",
        template: "message-sent",
        data: {
            name: name,
            email: email,
            message: message,
        },
    })

    res.status(200).json({ success: true })
}