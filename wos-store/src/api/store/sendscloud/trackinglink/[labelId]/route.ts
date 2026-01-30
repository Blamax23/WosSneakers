import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: any, res: MedusaResponse) {
    const { labelId } = req.params as { labelId: string }

    const sendcloudService = req.scope.resolve("sendcloudService") as {
        getTrackingLink: (labelId: string) => Promise<string>
    }

    try {
        const trackingLink = await sendcloudService.getTrackingLink(labelId)

        res.status(200).json({
            message: `Lien de suivi récupéré pour le label ${labelId}`,
            trackingLink,
        })
    } catch (error) {
        console.error("Sendcloud error:", error)
        res.status(500).json({ error: "Failed to get tracking link" })
    }
}