import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/framework"
import { syncProductsWorkflow } from "../workflows/sync-products"

export default async function algoliaSyncHandler({ 
    container,
}: SubscriberArgs) {
    const logger = container.resolve("logger")
    
    let hasMore = true
    let offset = 0
    const limit = 50
    let totalIndexed = 0

    logger.info("Début de l'indexation des produits...")

    while (hasMore) {
        const { result: { products, metadata } } = await syncProductsWorkflow(container)
        .run({
            input: {
            limit,
            offset,
            },
        })

        hasMore = offset + limit < (metadata?.count ?? 0)
        offset += limit
        totalIndexed += products.length
    }

    logger.info(`${totalIndexed} produits indexés dans Algolia.`)
}

export const config: SubscriberConfig = {
    event: "algolia.sync",
}