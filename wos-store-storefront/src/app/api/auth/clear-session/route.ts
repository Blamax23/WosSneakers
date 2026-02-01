import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  
  // Supprimer tous les cookies d'authentification
  cookieStore.delete("_medusa_jwt")
  cookieStore.delete("_medusa_cart_id")
  
  // Récupérer le countryCode depuis l'URL ou utiliser "fr" par défaut
  const searchParams = request.nextUrl.searchParams
  const countryCode = searchParams.get("country") || "fr"
  
  // Rediriger vers la page de connexion avec le message d'expiration
  return NextResponse.redirect(
    new URL(`/${countryCode}/account?expired=true`, request.url)
  )
}
