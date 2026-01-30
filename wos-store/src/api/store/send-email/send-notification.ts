// src/api/send-email/send-notification.ts
import { Router } from 'express'
import cors from 'cors'
import BrevoNotificationService from '../../../modules/newsletter/brevo-notification-service'

const sendNotificationRouter = Router()
const notificationService = new BrevoNotificationService()

// Appliquer CORS à cette route
sendNotificationRouter.use(
    cors({
        origin: "http://localhost:8000",
        methods: ["POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "x-publishable-api-key"],
    })
)

sendNotificationRouter.options('/send-notification', (req, res) => {
    res.sendStatus(200)
})

sendNotificationRouter.post('/send-notification', async (req, res) => {
    const apiKey = req.headers['x-publishable-api-key']
    const { event, to, data } = req.body

    try {
        await notificationService.sendNotification(event, to, data)
        res.status(200).json({ message: 'Notification envoyée avec succès.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Erreur lors de l'envoi de la notification." })
    }
})

export default sendNotificationRouter
