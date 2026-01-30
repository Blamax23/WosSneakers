import {
  Text,
  Container,
  Heading,
  Html,
  Head,
  Preview,
  Body,
  Section,
  Img,
  Link,
  Row,
  Column,
} from "@react-email/components"
import Footer from "../lib/footer"

type ContactEmailProps = {
  name: string
  email: string
  message: string
}

function MessageSentComponent({ name, email, message }: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouveau message via le formulaire de contact</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo centré */}
          <Section style={logoSection}>
            <Link
              href="https://wossneakers.fr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Img
                src="https://wossneakers.fr/WosLogos/logoWosBlack.png"
                alt="logo-Wos-Black"
                width="200"
                style={logo}
              />
            </Link>
          </Section>

          {/* Titre */}
          <Heading style={heading}>
            {name} vous a envoyé un message via le formulaire de contact
          </Heading>

          {/* Informations */}
          <Text style={text}>
            <strong>Email :</strong> {email}
          </Text>

          <Text style={text}>
            <strong>Message :</strong>
          </Text>

          <Section style={messageBox}>
            <Text style={messageText}>{message}</Text>
          </Section>

          {/* Bouton de réponse */}
          <Section style={buttonContainer}>
            <Link href={`mailto:${email}`} style={button}>
              Répondre à {name}
            </Link>
          </Section>
        </Container>

        <Footer />
      </Body>
    </Html>
  )
}

// Styles inline pour compatibilité maximale
const main = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "600px",
}

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
}

const logo = {
  display: "block",
  margin: "0 auto",
  maxWidth: "200px",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#1f2937",
  marginBottom: "24px",
}

const text = {
  fontSize: "16px",
  color: "#4b5563",
  marginBottom: "12px",
}

const messageBox = {
  backgroundColor: "#f3f4f6",
  padding: "16px",
  borderRadius: "8px",
  marginTop: "16px",
  marginBottom: "24px",
}

const messageText = {
  fontSize: "16px",
  color: "#374151",
  whiteSpace: "pre-line" as const,
  margin: "0",
}

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "24px",
}

const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  borderRadius: "6px",
}

export const messageSent = (props: ContactEmailProps) => (
  <MessageSentComponent {...props} />
)

// Preview pour npm run dev:email
export default () => (
  <MessageSentComponent
    name="Jean Dupont"
    email="jean.dupont@email.com"
    message={`Bonjour,

J'aimerais en savoir plus sur vos produits.

Merci d'avance !`}
  />
)