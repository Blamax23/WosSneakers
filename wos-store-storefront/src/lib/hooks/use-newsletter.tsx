import { useState } from "react"

export const useNewsletter = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const apiKey = process.env.NEXT_PUBLIC_PUBLISHABLE_API_KEY_BREVO
    console.log(apiKey)
    if (!apiKey) {
        throw new Error("La clé API n'est pas définie.")
    }

    const subscribe = async (email: string) => {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
        // Appel à l'API backend pour l'inscription
        const response = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": apiKey, // ou la clé en dur si c'est pour test
            },              
            body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Une erreur est survenue")
        }

        setSuccess(true)
        return data
        } catch (err: any) {
        setError(err.message)
        throw err
        } finally {
        setLoading(false)
        }
    }

    const unsubscribe = async (email: string) => {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
        const response = await fetch("/api/newsletter/unsubscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": apiKey
            },
            body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Une erreur est survenue")
        }

        setSuccess(true)
        return data
        } catch (err: any) {
        setError(err.message)
        throw err
        } finally {
        setLoading(false)
        }
    }

    return {
        subscribe,
        unsubscribe,
        loading,
        error,
        success,
    }
}