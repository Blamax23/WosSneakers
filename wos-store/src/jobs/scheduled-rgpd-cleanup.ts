import { MedusaContainer } from "@medusajs/framework/types"
import dataRetentionCleanup from "../utils/data-retention-cleanup"

/**
 * Scheduled Job: Nettoyage RGPD hebdomadaire
 * 
 * S'exécute tous les dimanches à 3h du matin
 * Conforme à la politique de confidentialité de WOS Sneakers
 */
export default async function rgpdCleanupJob(container: MedusaContainer) {
    console.log("🕐 [Scheduled Job] Démarrage du nettoyage RGPD...")
    
    try {
        const result = await dataRetentionCleanup(container)
        console.log("✅ [Scheduled Job] Nettoyage RGPD terminé:", result)
    } catch (error) {
        console.error("❌ [Scheduled Job] Erreur lors du nettoyage RGPD:", error)
    }
}

export const config = {
    name: "rgpd-data-retention-cleanup",
    // Cron: tous les dimanches à 3h00
    schedule: "0 3 * * 0",
}
