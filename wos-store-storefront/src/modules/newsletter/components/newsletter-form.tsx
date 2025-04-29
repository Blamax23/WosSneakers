"use client"

import { useState } from "react"
import { useNewsletter } from "@lib/hooks/use-newsletter"

const NewsletterForm = () => {
  const [email, setEmail] = useState("")
  const { subscribe, loading, error, success } = useNewsletter()
  const [message, setMessage] = useState("")

  const sendNotification = async () => {
    console.log("Je suis entré dans le sendnotif")
    const notificationData = {
      event: 'order.created', // Exemple d'événement
      to: 'Mb191157@gmail.com',
      data: {
        subject: 'Nouvelle commande',
        html: '<p>Votre commande a été créée !</p>',
      },
    }

    console.log(notificationData)
  
    try {
      const apiKey = process.env.NEXT_PUBLIC_PUBLISHABLE_API_KEY_BREVO;

      if (!apiKey){
        return null
      }

      console.log(apiKey)

      const response = await fetch("http://localhost:9000/store/notifications/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_PUBLISHABLE_API_KEY_BREVO!,
        },
        body: JSON.stringify(notificationData),
      })    
  
      if (response.ok) {
        alert('Notification envoyée avec succès')
      } else {
        console.log(response)
        alert(response)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi de la notification')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return
    
    try {
      sendNotification()
      // await subscribe(email)
      // setEmail("")
      // setMessage("Merci pour votre inscription !")
    } catch (err: any) {
      setMessage(err.message || "Une erreur est survenue")
    }
  }
  
  return (
    <div className="flex flex-col items-start gap-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Restez informé</h3>
        <p className="text-gray-700">
          Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-x-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            required
            className="flex-grow min-w-0 p-2 border border-gray-300 rounded"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "En cours..." : "S'abonner"}
          </button>
        </div>
        
        {message && (
          <p className={`mt-2 text-sm ${success ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

export default NewsletterForm