import BrevoProvider from './brevo-provider'

class BrevoNotificationService {
    private provider: BrevoProvider

    constructor() {
        // Initialisation du provider Brevo avec les données de configuration
        this.provider = new BrevoProvider({}, {
            apiKey: process.env.BREVO_API_KEY,
            sender: {
                name: "WOS Sneakers",
                email: "Blamaxsolutions@gmail.com",
            },
        })
    }

    async sendNotification(event: string, to: string, data: any) {
      // Appel de la méthode sendNotification du provider
        await this.provider.sendNotification(event, to, data, null)
    }

    
}

export default BrevoNotificationService