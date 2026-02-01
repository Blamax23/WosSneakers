import { redirect } from "next/navigation"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "fr"

export default async function medusaError(error: any): Promise<never> {
  // Log pour debug
  console.error("medusaError received:", JSON.stringify(error, null, 2))
  
  // Vérifier si c'est une erreur 401 (différents formats possibles)
  const status = error.response?.status || error.status || error.statusCode
  const message = error.response?.data?.message || error.message || "Unknown error"
  
  if (status === 401 || message?.toLowerCase().includes("unauthorized")) {
    // Rediriger vers la route API qui supprime les cookies et redirige
    redirect(`/api/auth/clear-session?country=${DEFAULT_REGION}`)
  }

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    // Extracting the error message from the response data
    const errorMessage = error.response.data.message || error.response.data

    throw new Error(errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1) + ".")
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response received: " + error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error("Error setting up the request: " + message)
  }
}
