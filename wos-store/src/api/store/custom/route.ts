import type { NextApiRequest, NextApiResponse } from "next"
import nodemailer from "nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" })
  }

  const { name, email, message } = req.body

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // ou Mailgun, SendGrid, etc.
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.CONTACT_EMAIL, // adresse de réception
      subject: "Nouveau message via le formulaire de contact",
      text: message,
      html: `<p><strong>Nom:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error)
    res.status(500).json({ message: "Erreur lors de l'envoi du mail" })
  }
}
