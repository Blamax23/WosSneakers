// src/app/api/contact/route.ts
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
    const { name, email, message } = await req.json()

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.CONTACT_EMAIL,
            subject: "Nouveau message via le formulaire de contact",
            text: message,
            html: `<p><strong>Nom:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Erreur d'envoi :", err)
        return NextResponse.json({ message: "Erreur lors de l'envoi du mail" }, { status: 500 })
    }
}
