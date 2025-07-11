import { Router } from "express"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type WebhookPayload = {
    action: string
    [key: string]: any // ← autorise les autres champs dynamiques
}

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {

    console.log("Voici ce que j'ai reçu : ", req.body)

    const result = req.body as WebhookPayload
    res.status(200).send("OK")

    switch (result?.action) {
        case "parcel_status_changed":
            break
    }

}
