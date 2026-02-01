import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import dataRetentionCleanup from "../../../utils/data-retention-cleanup"

/**
 * Route admin pour déclencher manuellement le nettoyage RGPD
 * POST /admin/rgpd-cleanup
 * 
 * ⚠️ Réservé aux administrateurs authentifiés
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        console.log("🔒 [Admin] Déclenchement manuel du nettoyage RGPD...")
        
        const result = await dataRetentionCleanup(req.scope)
        
        return res.status(200).json({
            success: true,
            message: "Nettoyage RGPD exécuté",
            result,
        })
    } catch (error: any) {
        console.error("❌ Erreur nettoyage RGPD:", error)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

/**
 * GET /admin/rgpd-cleanup - Prévisualisation sans action
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const query = req.scope.resolve("query")
        const now = new Date()
        
        const fiveYearsAgo = new Date(now)
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
        
        const threeYearsAgo = new Date(now)
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
        
        // Compter les commandes à anonymiser
        const { data: oldOrders } = await query.graph({
            entity: "order",
            fields: ["id", "email", "created_at", "metadata"],
            filters: {
                created_at: { $lt: fiveYearsAgo.toISOString() },
            }
        })
        
        const ordersToAnonymize = oldOrders?.filter(
            (order: any) => order.email !== "anonyme@rgpd-supprime.wossneakers.fr" && 
                           !order.metadata?.rgpd_anonymized
        ) || []
        
        // Compter les comptes inactifs
        const { data: inactiveCustomers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "updated_at", "metadata"],
            filters: {
                updated_at: { $lt: threeYearsAgo.toISOString() },
            }
        })
        
        const customersToNotify = inactiveCustomers?.filter((customer: any) => {
            const lastWarning = customer.metadata?.rgpd_inactivity_warning_sent
            if (!lastWarning) return true
            const warningDate = new Date(lastWarning)
            const daysSinceWarning = Math.floor((now.getTime() - warningDate.getTime()) / (1000 * 60 * 60 * 24))
            return daysSinceWarning > 25
        }) || []
        
        // Compter les comptes à supprimer
        const { data: allCustomers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "metadata"],
            filters: {},
        })
        
        const customersToDelete = allCustomers?.filter((customer: any) => {
            const scheduledDeletion = customer.metadata?.rgpd_scheduled_deletion
            if (!scheduledDeletion) return false
            return new Date(scheduledDeletion) <= now
        }) || []
        
        return res.status(200).json({
            success: true,
            message: "Prévisualisation du nettoyage RGPD (aucune action effectuée)",
            preview: {
                ordersToAnonymize: {
                    count: ordersToAnonymize.length,
                    samples: ordersToAnonymize.slice(0, 5).map((o: any) => ({
                        id: o.id,
                        email: o.email?.substring(0, 3) + "***",
                        created_at: o.created_at,
                    })),
                },
                customersToNotify: {
                    count: customersToNotify.length,
                    samples: customersToNotify.slice(0, 5).map((c: any) => ({
                        id: c.id,
                        email: c.email?.substring(0, 3) + "***",
                        last_activity: c.updated_at,
                    })),
                },
                customersToDelete: {
                    count: customersToDelete.length,
                    samples: customersToDelete.slice(0, 5).map((c: any) => ({
                        id: c.id,
                        email: c.email?.substring(0, 3) + "***",
                        scheduled_deletion: c.metadata?.rgpd_scheduled_deletion,
                    })),
                },
            },
            thresholds: {
                ordersOlderThan: fiveYearsAgo.toISOString(),
                inactivityThreshold: threeYearsAgo.toISOString(),
            },
        })
    } catch (error: any) {
        console.error("❌ Erreur prévisualisation RGPD:", error)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
