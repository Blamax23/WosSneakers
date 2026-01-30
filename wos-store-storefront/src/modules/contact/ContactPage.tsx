"use client"
import { toast } from "@medusajs/ui"
import { useEffect } from "react"
import { sendContactMessage } from "../../lib/data/customer"
import { useActionState } from "react"

type Props = {
  countryCode: string
}

export type ContactState = {
  success?: boolean
  error?: string
}

const ContactPage = ({ countryCode }: Props) => {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendContactMessage,
    {}
  )

  useEffect(() => {
    if (state.success) {
      toast.success("Message envoyé", {
        description: "Merci pour ton message, on revient vers toi rapidement !",
      })
    }
    if (state.error) {
      toast.error("Erreur", {
        description: state.error,
      })
    }
  }, [state])

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Contactez-nous</h1>
      
      {state.success ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded">
          Merci pour ton message, on revient vers toi rapidement !
        </div>
      ) : (
        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              disabled={pending}
              className="w-full border border-gray-300 px-4 py-2 rounded-md disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={pending}
              className="w-full border border-gray-300 px-4 py-2 rounded-md disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              disabled={pending}
              className="w-full border border-gray-300 px-4 py-2 rounded-md disabled:opacity-50"
            />
          </div>

          {state.error && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Envoi en cours..." : "Envoyer"}
          </button>
        </form>
      )}
    </div>
  )
}

export default ContactPage