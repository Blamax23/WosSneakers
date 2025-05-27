import {
  Text,
  Container,
  Heading,
  Html,
  Tailwind,
  Head,
  Preview,
  Body,
  Section,
} from "@react-email/components"

type ContactEmailProps = {
  email: string
  subject: string
  message: string
}

function MessageSentComponent({ email, subject, message }: ContactEmailProps) {
    return (
        <Tailwind>
        <Html className="font-sans bg-gray-100">
            <Head />
            <Preview>Nouveau message via le formulaire de contact</Preview>
            <Body className="bg-white my-10 mx-auto w-full max-w-2xl">
            <Container className="p-6">
                <Heading className="text-2xl font-bold text-center text-gray-800 mb-4">
                {subject}
                </Heading>

                <Text className="text-gray-600 mb-2">
                <strong>Email :</strong> {email}
                </Text>
                <Text className="text-gray-600 mb-4">
                <strong>Message :</strong>
                </Text>
                <Text className="bg-gray-100 p-4 rounded text-gray-700 whitespace-pre-line">
                {message}
                </Text>
            </Container>

            <Section className="bg-gray-50 p-6 mt-10">
                <Text className="text-center text-gray-400 text-xs">
                Cet email a été généré automatiquement depuis le formulaire de contact.
                </Text>
            </Section>
            </Body>
        </Html>
        </Tailwind>
    )
}

export const messageSent = (props: ContactEmailProps) => (
  <MessageSentComponent {...props} />
)

// @ts-ignore
export default () => (
  <MessageSentComponent
    email="jean.dupont@email.com"
    subject="Demande d'informations"
    message="Bonjour,\nJ’aimerais en savoir plus sur vos produits.\nMerci d’avance !"
  />
)
