import sibApiV3Sdk from 'sib-api-v3-sdk'

class BrevoProvider {
    static identifier = "brevo"

    transApi: any
    sender: any

    constructor(_, options) {
        const defaultClient = sibApiV3Sdk.ApiClient.instance
        const apiKey = defaultClient.authentications['api-key']
        apiKey.apiKey = options.apiKey

        this.transApi = new sibApiV3Sdk.TransactionalEmailsApi()
        this.sender = options.sender
    }

    async sendNotification(
        event: string,
        to: string,
        data: any,
        attachmentGenerator: any // tu peux le typer plus tard si besoin
    ) {
    try {
        await this.transApi.sendTransacEmail({
            to: [{ email: to }],
            sender: this.sender,
            subject: data.subject || "Notification",
            htmlContent: data.html || "<p>Contenu vide</p>",
        })
        } catch (err) {
            console.error("Erreur Brevo:", err)
            throw err
        }
    }

    async resendNotification(notification, config) {
        return this.sendNotification(
            notification.event_name,
            notification.to,
            notification.data,
            config.attachmentGenerator // ce champ est généralement là dans `config`
        )
    }  
}

export default BrevoProvider
