// src/app/api/contact/route.ts
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request, res: NextResponse) {
    const { name, email, message } = await req.json()

    try {

        const notificationModuleService = container.resolve(Modules.NOTIFICATION)

        // Mettre à jour l'email
        await customerService.updateCustomers(customerId, {
        email,
        })

        return res.status(200).json({
        message: "Email mis à jour avec succès",
        })
    } catch (error: any) {
        console.error("❌ Erreur mise à jour email:", error)
        return res.status(500).json({
        message: error?.message || "Erreur lors de la mise à jour de l'email",
        })
    }
}
