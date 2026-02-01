"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur critique
    console.error("Critical application error:", error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#f9fafb",
        }}>
          <div style={{ textAlign: "center", maxWidth: "500px" }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "12px",
            }}>
              Une erreur critique s'est produite
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#6b7280",
              marginBottom: "24px",
            }}>
              Nous sommes désolés, le site a rencontré un problème inattendu.
              Veuillez actualiser la page ou réessayer plus tard.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#111827",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Réessayer
              </button>
              
              <a
                href="/"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "#111827",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Retourner à l'accueil
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
