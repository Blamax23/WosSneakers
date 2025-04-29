import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email requis" },
        { status: 400 }
      )
    }

    // Envoyer la requête au backend Medusa
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const response = await fetch(`${backendUrl}/store/newsletter/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Erreur de désinscription" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Désinscription réussie!",
    })
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}