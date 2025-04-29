import { Router } from 'express'
import sendNotificationRouter from './send-email/send-notification'

const router = Router()

router.use('/notifications', sendNotificationRouter)

export default router