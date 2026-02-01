import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SendcloudService from "../../../../modules/sendcloud/service"

/**
 * GET /store/sendcloud/service-points
 * 
 * Récupère les points relais disponibles pour un code postal et pays donnés.
 * 
 * Query params:
 * - postal_code (required): Code postal
 * - country (required): Code pays ISO2 (ex: FR, BE, NL)
 * - carrier (optional): Filtre par transporteur (ex: mondial_relay, colissimo)
 * - limit (optional): Nombre max de résultats
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { postal_code, country, carrier, limit } = req.query as {
      postal_code?: string
      country?: string
      carrier?: string
      limit?: string
    }

    if (!postal_code || !country) {
      return res.status(400).json({
        error: "postal_code and country are required query parameters"
      })
    }

    // Initialize Sendcloud service with credentials
    const sendcloudService = new SendcloudService(
      {},
      {
        sendcloudApiKey: process.env.SENDCLOUD_PUBLIC_KEY || "",
        sendcloudApiSecret: process.env.SENDCLOUD_PRIVATE_KEY || ""
      }
    )

    const servicePoints = await sendcloudService.getPickupPoints({
      postal_code,
      country: country.toUpperCase(),
      carrier,
      limit: limit ? parseInt(limit, 10) : 20
    })

    return res.status(200).json({
      service_points: servicePoints,
      count: servicePoints.length
    })
  } catch (error: any) {
    console.error("Error fetching service points:", error)
    return res.status(500).json({
      error: error.message || "Failed to fetch service points"
    })
  }
}
