// src/api/stripe/handle-stripe-webhook.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10",
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const sig = req.headers["stripe-signature"];
    let event: Stripe.Event;

    const rawBody = await req.rawBody; // ⚠️ Medusa doit avoir le raw body activé pour ça

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("❌ Erreur de signature Stripe:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // 🔔 Traite l'event ici
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("✅ Checkout terminé pour :", session.id);
            break;

        // Ajoute d'autres cas ici si besoin
        default:
            console.log(`📩 Event Stripe reçu : ${event.type}`);
    }

    res.status(200).send();
};
