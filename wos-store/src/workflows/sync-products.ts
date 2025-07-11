import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncProductsStep, SyncProductsStepInput } from "./steps/sync-products"

type SyncProductsWorkflowInput = {
    filters?: Record<string, unknown>
    limit?: number
    offset?: number
}

export const syncProductsWorkflow = createWorkflow(
    "sync-products",
    ({ filters, limit, offset }: SyncProductsWorkflowInput) => {

        const safeFilters = Object.fromEntries(
            Object.entries({
                status: "published",
                ...filters,
            }).filter(([key]) => key?.trim() !== "")
        )
        // @ts-ignore
        const { data, metadata } = useQueryGraphStep({
            entity: "product",
            fields: ["id", "title", "description", "handle", "thumbnail", "categories.*", "tags.*"],
            pagination: {
                take: limit,
                skip: offset,
            },
            filters: safeFilters,
        })

        syncProductsStep({
            products: data,
        } as SyncProductsStepInput)

        return new WorkflowResponse({
            products: data,
            metadata,
        })
    }
)