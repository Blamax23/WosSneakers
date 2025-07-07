import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export function handleRequest(
    handler: (req: MedusaRequest, res: MedusaResponse) => Promise<void>
) {
    return async (req: MedusaRequest, res: MedusaResponse) => {
        try {
            await handler(req, res);
        } catch (error: any) {
            console.error("❌ API Handler Error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    };
}
