import type { MedusaRequest, MedusaResponse, AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type UpdateEmailBody = {
  email: string
}

export const POST = async (
  req: AuthenticatedMedusaRequest<UpdateEmailBody>,
  res: MedusaResponse
) => {
  const { email } = req.body || {}

  if (!email) {
    return res.status(400).json({
      message: "L'email est requis",
    })
  }

  try {
    const customerId = req.auth_context?.actor_id
    const actorType = req.auth_context?.actor_type

    if (!customerId || actorType !== "customer") {
      return res.status(401).json({
        message: "Non authentifié",
      })
    }

    const customerService = req.scope.resolve(Modules.CUSTOMER)

    // Mettre à jour l'email
    await customerService.updateCustomers(customerId, {
      email,
    })

    return res.status(200).json({
      message: "Email mis à jour avec succès",
    })
  } catch (error: any) {
    console.error("❌ Erreur mise à jour email:", error)
    return res.status(500).json({
      message: error?.message || "Erreur lors de la mise à jour de l'email",
    })
  }
}