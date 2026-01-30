import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const corsHeaders = {
    'Access-Control-Allow-Origin': `${process.env.STORE_CORS?.split(",")[0] || 'http://localhost:8000'}`,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-publishable-api-key',
    'Access-Control-Max-Age': '86400', // facultatif mais utile
};

// Gestion du preflight CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    });
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {

        const { email } = req.body as { email: string };

        if (!email) {
            return res.status(400).json({ error: "L'email est obligatoire" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Format d'email invalide" });
        }

        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY manquant");
            return res.status(500).json({ error: "Configuration serveur manquante" });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailParts = email.split('@')[0].split('.');
        const firstName = emailParts[0] || '';
        const lastName = emailParts[1] || '';

        await resend.contacts.create({
            email,
            firstName,
            lastName,
            unsubscribed: false,
            audienceId: process.env.RESEND_AUDIENCE_ID || '5cd7e419-f1b1-45b2-b408-d5e4c9e73a34',
        });

        res.setHeader("Access-Control-Allow-Origin", process.env.STORE_CORS?.split(",")[0] || "http://localhost:8000");
        return res.status(200).json({ message: "Inscription réussie à la newsletter" });

    } catch (error: any) {
        console.error("Newsletter subscription error:", error);

        if (error.message?.includes("contact_conflict")) {
            return res.status(409).json({ error: "Cette adresse email est déjà inscrite" });
        }

        return res.status(500).json({ error: "Erreur lors de l'inscription à la newsletter" });
    }
};