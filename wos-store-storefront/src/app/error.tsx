"use client"

import { ArrowUpRightMini } from "@medusajs/icons"
import { Button, Text } from "@medusajs/ui"
import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur côté client (vous pouvez envoyer à un service de monitoring)
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="text-center">
        <h1 className="text-2xl-semi text-ui-fg-base mb-2">
          Oups... Une erreur s'est produite
        </h1>
        <p className="text-small-regular text-ui-fg-subtle max-w-md">
          Nous sommes désolés, quelque chose ne s'est pas passé comme prévu.
          Veuillez réessayer ou retourner à l'accueil.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => reset()}
          variant="primary"
        >
          Réessayer
        </Button>
        
        <Link href="/">
          <Button variant="secondary" className="flex gap-x-1 items-center group">
            <Text>Retourner à l'accueil</Text>
            <ArrowUpRightMini
              className="group-hover:rotate-45 ease-in-out duration-150"
            />
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl w-full">
          <p className="text-red-800 font-mono text-sm break-all">
            {error.message}
          </p>
          {error.digest && (
            <p className="text-red-600 text-xs mt-2">
              Digest: {error.digest}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
