"use client"

import { useState } from "react"

type Props = {
  countryCode: string
}

const ContactPage = ({ countryCode }: Props) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })


      console.log("Voici le res : ", res)

      if (!res.ok) throw new Error("Erreur lors de l'envoi")

      setSubmitted(true)
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err)
      // Tu peux ajouter une gestion d'erreur ici
    }
  }


  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Contactez-nous</h1>

      {submitted ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded">
          Merci pour ton message, on revient vers toi rapidement !
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
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
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
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
              value={form.message}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Envoyer
          </button>
        </form>
      )}
    </div>
  )
}

export default ContactPage
