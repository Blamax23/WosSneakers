import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type UpdatePasswordBody = {
  old_password?: string
  new_password?: string
}

export const POST = async (
  req: AuthenticatedMedusaRequest<UpdatePasswordBody>,
  res: MedusaResponse
) => {
  const { old_password, new_password } = (req.body ?? {}) as UpdatePasswordBody

  if (!old_password || !new_password) {
    return res.status(400).json({
      message: "Ancien et nouveau mot de passe sont requis",
    })
  }

  try {
    const customerId = req.auth_context?.actor_id
    const actorType = req.auth_context?.actor_type

    if (!customerId || actorType !== "customer") {
      return res.status(401).json({
        message: "L'authentification a échoué. Si vous êtes connecté, veuillez vous reconnecter et réessayer.",
      })
    }

    const authModuleService = req.scope.resolve(Modules.AUTH)
    const customerService = req.scope.resolve(Modules.CUSTOMER)

    const customer = await customerService.retrieveCustomer(customerId)

    if (!customer?.email) {
      return res.status(404).json({
        message: "Client non trouvé",
      })
    }

    const email = customer.email

    // Vérifier l'ancien mot de passe
    const authResult = await authModuleService.authenticate("emailpass", {
      url: req.url,
      headers: {},
      query: {},
      body: {
        email,
        password: old_password,
      },
      protocol: req.protocol,
    })

    if (!authResult?.success) {
      return res.status(400).json({
        message: "L'ancien mot de passe est incorrect",
      })
    }

    // Mettre à jour le mot de passe via le provider emailpass (entity_id=email)
    const update = await authModuleService.updateProvider("emailpass", {
      entity_id: email,
      password: new_password,
    })

    if (!update?.success) {
      return res.status(500).json({
        message: update?.error || "Erreur lors de la mise à jour du mot de passe",
      })
    }

    return res.status(200).json({
      message: "Mot de passe mis à jour avec succès",
    })
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error)
    return res.status(500).json({
      message: error?.message || "Erreur lors de la mise à jour du mot de passe",
    })
  }
}