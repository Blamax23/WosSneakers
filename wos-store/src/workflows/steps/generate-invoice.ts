import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DOCUMENTS_MODULE } from "../../modules/documents"

type GenerateInvoiceInput = {
    order: Record<string, unknown>
}

export const generateInvoiceStep = createStep(
    "generate-invoice-step",
    async ({ order }: GenerateInvoiceInput, { container }) => {
        try {
            const documentsService: any = container.resolve(DOCUMENTS_MODULE)
            
            const result = await documentsService.generateInvoiceForOrder(order as any)
            
            if (result && result.buffer) {
                return new StepResponse({
                    invoice: result.invoice,
                    buffer: result.buffer,
                })
            }
            
            return new StepResponse({ invoice: null, buffer: null })
        } catch (error) {
            // Si le module documents n'est pas configuré, on continue sans facture
            console.warn("Could not generate invoice:", error)
            return new StepResponse({ invoice: null, buffer: null })
        }
    }
)
