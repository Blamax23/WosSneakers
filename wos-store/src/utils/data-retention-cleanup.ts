import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Job de nettoyage automatique des données selon la politique RGPD
 * 
 * Règles de rétention (selon PrivacyPage.tsx):
 * - Données de compte : Supprimées si compte inactif depuis 3 ans
 * - Données de commande : Conservées 5 ans (obligations légales)
 * - Comptes supprimés : Anonymisation immédiate, suppression définitive après 30 jours
 */

interface CleanupResult {
    status: "completed" | "partial" | "error"
    timestamp: string
    stats: {
        ordersAnonymized: number
        inactivityWarningsSent: number
        accountsDeleted: number
        errors: string[]
    }
}

// Données anonymisées pour RGPD
const ANONYMOUS_DATA = {
    email: "anonyme@rgpd-supprime.wossneakers.fr",
    first_name: "Client",
    last_name: "Anonyme",
    phone: "",
    company: "",
    address_1: "Adresse supprimée (RGPD)",
    address_2: "",
    city: "---",
    postal_code: "00000",
}

export default async function dataRetentionCleanup(container: MedusaContainer): Promise<CleanupResult> {
    
    const query = container.resolve("query")
    const customerService = container.resolve(Modules.CUSTOMER)
    const notificationService = container.resolve(Modules.NOTIFICATION)
    
    const now = new Date()
    const stats = {
        ordersAnonymized: 0,
        inactivityWarningsSent: 0,
        accountsDeleted: 0,
        errors: [] as string[],
    }
    
    console.log("🔒 [RGPD] Démarrage du nettoyage des données...")
    console.log(`📅 Date d'exécution: ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`)
    
    // =========================================================================
    // 1. ANONYMISER LES COMMANDES DE PLUS DE 5 ANS
    // =========================================================================
    console.log("\n📦 Étape 1: Anonymisation des commandes de plus de 5 ans...")
    
    const fiveYearsAgo = new Date(now)
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    
    try {
        // Récupérer les commandes anciennes non encore anonymisées
        const { data: oldOrders } = await query.graph({
            entity: "order",
            fields: [
                "id", 
                "email", 
                "created_at",
                "metadata",
                "shipping_address.id",
                "shipping_address.first_name",
                "billing_address.id",
                "billing_address.first_name",
            ],
            filters: {
                created_at: { $lt: fiveYearsAgo.toISOString() },
            }
        })
        
        // Filtrer les commandes non anonymisées
        const ordersToAnonymize = oldOrders?.filter(
            (order: any) => order.email !== ANONYMOUS_DATA.email && 
                           !order.metadata?.rgpd_anonymized
        ) || []
        
        if (ordersToAnonymize.length > 0) {
            console.log(`   → ${ordersToAnonymize.length} commande(s) à anonymiser`)
            
            const orderService = container.resolve(Modules.ORDER)
            
            for (const order of ordersToAnonymize) {
                try {
                    const orderEmail = order.email || "unknown"
                    
                    // Mettre à jour l'email de la commande
                    await orderService.updateOrders([{
                        id: order.id,
                        email: ANONYMOUS_DATA.email,
                        metadata: {
                            ...order.metadata,
                            rgpd_anonymized: true,
                            rgpd_anonymized_at: now.toISOString(),
                            original_email_hash: hashEmail(orderEmail),
                        }
                    }])
                    
                    // Anonymiser l'adresse de livraison
                    if (order.shipping_address?.id && order.shipping_address.first_name !== ANONYMOUS_DATA.first_name) {
                        await orderService.updateOrderAddresses({
                            id: order.shipping_address.id,
                            first_name: ANONYMOUS_DATA.first_name,
                            last_name: ANONYMOUS_DATA.last_name,
                            phone: ANONYMOUS_DATA.phone,
                            company: ANONYMOUS_DATA.company,
                            address_1: ANONYMOUS_DATA.address_1,
                            address_2: ANONYMOUS_DATA.address_2,
                        })
                    }
                    
                    // Anonymiser l'adresse de facturation
                    if (order.billing_address?.id && order.billing_address.first_name !== ANONYMOUS_DATA.first_name) {
                        await orderService.updateOrderAddresses({
                            id: order.billing_address.id,
                            first_name: ANONYMOUS_DATA.first_name,
                            last_name: ANONYMOUS_DATA.last_name,
                            phone: ANONYMOUS_DATA.phone,
                            company: ANONYMOUS_DATA.company,
                            address_1: ANONYMOUS_DATA.address_1,
                            address_2: ANONYMOUS_DATA.address_2,
                        })
                    }
                    
                    stats.ordersAnonymized++
                    console.log(`   ✓ Commande ${order.id} anonymisée (${new Date(order.created_at).toLocaleDateString('fr-FR')})`)
                    
                } catch (error: any) {
                    const errorMsg = `Erreur anonymisation commande ${order.id}: ${error.message}`
                    stats.errors.push(errorMsg)
                    console.error(`   ✗ ${errorMsg}`)
                }
            }
        } else {
            console.log("   ✓ Aucune commande à anonymiser")
        }
        
    } catch (error: any) {
        const errorMsg = `Erreur lors de la recherche des anciennes commandes: ${error.message}`
        stats.errors.push(errorMsg)
        console.error(`   ✗ ${errorMsg}`)
    }
    
    // =========================================================================
    // 2. NOTIFIER LES COMPTES INACTIFS DEPUIS 3 ANS
    // =========================================================================
    console.log("\n👤 Étape 2: Notification des comptes inactifs (3 ans)...")
    
    const threeYearsAgo = new Date(now)
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
    
    // Date limite pour la suppression (30 jours après notification)
    const deletionDate = new Date(now)
    deletionDate.setDate(deletionDate.getDate() + 30)
    
    try {
        const { data: inactiveCustomers } = await query.graph({
            entity: "customer",
            fields: [
                "id", 
                "email", 
                "first_name", 
                "last_name", 
                "created_at", 
                "updated_at",
                "metadata",
            ],
            filters: {
                updated_at: { $lt: threeYearsAgo.toISOString() },
            }
        })
        
        // Filtrer ceux qui n'ont pas déjà reçu une notification récente
        const customersToNotify = inactiveCustomers?.filter((customer: any) => {
            const lastWarning = customer.metadata?.rgpd_inactivity_warning_sent
            if (!lastWarning) return true
            
            // Si la notification date de plus de 25 jours, on peut en renvoyer une
            const warningDate = new Date(lastWarning)
            const daysSinceWarning = Math.floor((now.getTime() - warningDate.getTime()) / (1000 * 60 * 60 * 24))
            return daysSinceWarning > 25
        }) || []
        
        if (customersToNotify.length > 0) {
            console.log(`   → ${customersToNotify.length} client(s) à notifier`)
            
            for (const customer of customersToNotify) {
                try {
                    if (!customer.email) {
                        console.log(`   → Client ${customer.id}: pas d'email, ignoré`)
                        continue
                    }
                    
                    // Vérifier si le client a des commandes récentes
                    // On cherche les commandes avec l'email du client
                    const { data: recentOrders } = await query.graph({
                        entity: "order",
                        fields: ["id", "created_at", "email"],
                        filters: {
                            created_at: { $gte: threeYearsAgo.toISOString() }
                        }
                    })
                    
                    // Filtrer manuellement par email du client
                    const customerRecentOrders = recentOrders?.filter(
                        (o: any) => o.email === customer.email
                    ) || []
                    
                    if (customerRecentOrders.length > 0) {
                        // Client a des commandes récentes, on met à jour son compte
                        console.log(`   → ${customer.email}: ${customerRecentOrders.length} commande(s) récente(s), compte conservé`)
                        await customerService.updateCustomers(customer.id, {
                            metadata: {
                                ...customer.metadata,
                                last_order_check: now.toISOString(),
                            }
                        })
                        continue
                    }
                    
                    // Envoyer l'email d'avertissement
                    await notificationService.createNotifications({
                        to: customer.email,
                        channel: "email",
                        template: "rgpd-inactivity-warning",
                        data: {
                            first_name: customer.first_name,
                            email: customer.email,
                            last_activity_date: new Date(customer.updated_at).toLocaleDateString('fr-FR'),
                            deletion_date: deletionDate.toLocaleDateString('fr-FR'),
                        },
                    })
                    
                    // Marquer le client comme notifié
                    await customerService.updateCustomers(customer.id, {
                        metadata: {
                            ...customer.metadata,
                            rgpd_inactivity_warning_sent: now.toISOString(),
                            rgpd_scheduled_deletion: deletionDate.toISOString(),
                        }
                    })
                    
                    stats.inactivityWarningsSent++
                    console.log(`   ✓ Notification envoyée à ${customer.email}`)
                    
                } catch (error: any) {
                    const errorMsg = `Erreur notification ${customer.email}: ${error.message}`
                    stats.errors.push(errorMsg)
                    console.error(`   ✗ ${errorMsg}`)
                }
            }
        } else {
            console.log("   ✓ Aucun compte inactif à notifier")
        }
        
    } catch (error: any) {
        const errorMsg = `Erreur lors de la recherche des comptes inactifs: ${error.message}`
        stats.errors.push(errorMsg)
        console.error(`   ✗ ${errorMsg}`)
    }
    
    // =========================================================================
    // 3. SUPPRIMER LES COMPTES AVEC SUPPRESSION PLANIFIÉE DÉPASSÉE
    // =========================================================================
    console.log("\n🗑️  Étape 3: Suppression définitive des comptes...")
    
    try {
        // Récupérer tous les clients avec leurs métadonnées
        const { data: allCustomers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "first_name", "metadata"],
            filters: {},
        })
        
        // Filtrer ceux qui ont une suppression planifiée dépassée
        const customersToDelete = allCustomers?.filter((customer: any) => {
            const scheduledDeletion = customer.metadata?.rgpd_scheduled_deletion
            if (!scheduledDeletion) return false
            
            const deletionDate = new Date(scheduledDeletion)
            return deletionDate <= now
        }) || []
        
        if (customersToDelete.length > 0) {
            console.log(`   → ${customersToDelete.length} compte(s) à supprimer définitivement`)
            
            for (const customer of customersToDelete) {
                try {
                    if (!customer.email) {
                        console.log(`   → Client ${customer.id}: pas d'email, ignoré`)
                        continue
                    }
                    
                    // Envoyer l'email de confirmation de suppression
                    try {
                        await notificationService.createNotifications({
                            to: customer.email,
                            channel: "email",
                            template: "rgpd-account-deleted",
                            data: {
                                first_name: customer.first_name,
                                email: customer.email,
                                deletion_reason: "inactivity",
                            },
                        })
                    } catch (emailError: any) {
                        console.warn(`   ⚠️  Email de confirmation non envoyé: ${emailError.message}`)
                    }
                    
                    // Supprimer les adresses du client
                    try {
                        const { data: addresses } = await query.graph({
                            entity: "customer_address",
                            fields: ["id"],
                            filters: { customer_id: customer.id }
                        })
                        
                        if (addresses?.length) {
                            for (const address of addresses) {
                                await customerService.deleteCustomerAddresses([address.id])
                            }
                        }
                    } catch (addrError: any) {
                        console.warn(`   ⚠️  Erreur suppression adresses: ${addrError.message}`)
                    }
                    
                    // Supprimer définitivement le client
                    await customerService.deleteCustomers([customer.id])
                    
                    stats.accountsDeleted++
                    console.log(`   ✓ Compte ${customer.email} supprimé définitivement`)
                    
                } catch (error: any) {
                    const errorMsg = `Erreur suppression ${customer.email}: ${error.message}`
                    stats.errors.push(errorMsg)
                    console.error(`   ✗ ${errorMsg}`)
                }
            }
        } else {
            console.log("   ✓ Aucun compte à supprimer")
        }
        
    } catch (error: any) {
        const errorMsg = `Erreur lors de la suppression des comptes: ${error.message}`
        stats.errors.push(errorMsg)
        console.error(`   ✗ ${errorMsg}`)
    }
    
    // =========================================================================
    // RÉSUMÉ
    // =========================================================================
    console.log("\n" + "=".repeat(60))
    console.log("📊 RÉSUMÉ DU NETTOYAGE RGPD")
    console.log("=".repeat(60))
    console.log(`   📦 Commandes anonymisées: ${stats.ordersAnonymized}`)
    console.log(`   📧 Notifications d'inactivité envoyées: ${stats.inactivityWarningsSent}`)
    console.log(`   🗑️  Comptes supprimés: ${stats.accountsDeleted}`)
    
    if (stats.errors.length > 0) {
        console.log(`   ⚠️  Erreurs: ${stats.errors.length}`)
        stats.errors.forEach((err, i) => console.log(`      ${i + 1}. ${err}`))
    }
    
    console.log("=".repeat(60))
    console.log("✅ [RGPD] Nettoyage terminé.\n")
    
    return {
        status: stats.errors.length > 0 ? "partial" : "completed",
        timestamp: now.toISOString(),
        stats,
    }
}

/**
 * Hash simple de l'email pour audit (non réversible)
 */
function hashEmail(email: string): string {
    let hash = 0
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`
}
