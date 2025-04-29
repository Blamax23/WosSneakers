export default async (req, res) => {
    const { email, subject, html } = req.body
  
    const notificationService = req.scope.resolve("notificationService")
  
    await notificationService.sendNotification(
      "custom_event", // peu importe, tant que ton provider l'accepte
      email,
      {
        subject,
        html,
      },
      "email" // type (conventionnel)
    )
  
    res.status(200).json({ message: "Email envoyé" })
  }
  