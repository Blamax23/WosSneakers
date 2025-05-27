import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const { name, email, message } = body

  // 🔥 Ici tu peux trigger un event, un job, ou envoyer une notif
  console.log("message.sent:", { name, email, message })

  // Exemple avec event system (si tu en as un)
  // eventBus.emit("message.sent", { name, email, message })

  return NextResponse.json({ success: true })
}


export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.sendStatus(200);
}
