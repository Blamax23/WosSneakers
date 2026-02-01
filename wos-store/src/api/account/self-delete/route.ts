import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { removeCustomerAccountWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  
  let customerId: string | undefined
  
  // Méthode 1: Via la session
  if (req.session?.auth_context?.actor_id) {
    customerId = req.session.auth_context.actor_id
  }
  
  // Méthode 2: Via le JWT Bearer
  if (!customerId) {
    const authHeader = req.headers.authorization
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const jwt = require("jsonwebtoken")
      
      try {
        const secret = process.env.JWT_SECRET || "supersecret"
        const decoded: any = jwt.verify(token, secret)
        customerId = decoded.actor_id
      } catch (error: any) {
        try {
          const decoded: any = jwt.decode(token)
          customerId = decoded?.actor_id
        } catch (decodeError) {
          console.error("❌ Impossible de décoder le token:", decodeError)
        }
      }
    }
  }
  
  if (!customerId) {
    return res.status(401).json({
      message: "Non authentifié - impossible de trouver le customer_id",
    })
  }
  
  const customerService = req.scope.resolve(Modules.CUSTOMER)
  const eventBusService = req.scope.resolve(Modules.EVENT_BUS)
  
  // ✅ Récupérer le query correctement
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  try {
    // Récupérer les données du customer AVANT de le supprimer
    const customer = await customerService.retrieveCustomer(customerId)
    
    const customerData = {
      customer_id: customerId,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
      has_account: customer.has_account,
      created_at: customer.created_at,
      deleted_at: new Date().toISOString(),
    }
    
    let uniqueAuthIds: string[] = []
    
    try {
      // Recherche par customer_id dans app_metadata
      const authIdsByCustomerId = await query.graph({
        entity: "auth_identity",
        fields: ["id"],
        filters: {
          app_metadata: {
            customer_id: customerId,
          },
        } as any,
      })
      
      const ids = authIdsByCustomerId.data.map((item: any) => item.id)
      uniqueAuthIds = [...new Set(ids)]
    } catch (queryError: any) {
      console.error("⚠️ Erreur recherche auth_identities:", queryError)
    }
    
    await removeCustomerAccountWorkflow(req.scope).run({
      input: { customerId: customerId },
    })
    
    // 🔥 ÉTAPE 3: Supprimer les auth_identities via l'API Auth
    if (uniqueAuthIds.length > 0) {
      const authService = req.scope.resolve(Modules.AUTH)
      
      try {
        await authService.deleteAuthIdentities(uniqueAuthIds)
      } catch (deleteError: any) {
        console.error("❌ Erreur suppression auth_identities:", deleteError)
      }
    }
    
    try {
      const orphanedIdentities = await query.graph({
        entity: "auth_identity",
        fields: ["id"],
        filters: {
          app_metadata: {
            customer_id: null,
          },
        } as any,
      })
      
      if (orphanedIdentities.data && orphanedIdentities.data.length > 0) {
        const orphanedIds = orphanedIdentities.data.map((item: any) => item.id)
        
        const authService = req.scope.resolve(Modules.AUTH)
        await authService.deleteAuthIdentities(orphanedIds)
      }
    } catch (cleanError: any) {
      console.error("⚠️ Erreur nettoyage orphelines:", cleanError)
    }
    
    // 🔔 Émettre l'événement
    await eventBusService.emit({
      name: "customer.deleted",
      data: customerData,
    })
    
    // Détruire la session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) console.error("⚠️ Erreur destruction session:", err)
      })
    }
    
    return res.status(200).json({ 
      success: true,
      message: "Compte supprimé avec succès",
      customer: {
        email: customer.email,
        first_name: customer.first_name,
      }
    })
  } catch (error: any) {
    console.error("❌ Erreur lors de la suppression:", error)
    console.error("Stack:", error.stack)
    return res.status(500).json({
      message: "Erreur lors de la suppression du compte",
      error: error.message,
    })
  }
}