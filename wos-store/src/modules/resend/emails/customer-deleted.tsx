import {
  Text,
  Column,
  Container,
  Heading,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Link,
} from "@react-email/components"
import Footer from "../lib/footer"

type GoodbyeEmailProps = {
  first_name?: string,
  email?: string,
  deleted_at?: string,
}

function GoodbyeEmailComponent({ first_name, email, deleted_at }: GoodbyeEmailProps) {
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>On espère vous revoir bientôt chez WOS Sneakers !</Preview>
        <Body className="bg-white my-10 mx-auto w-full max-w-2xl">
          {/* Header */}
          <Container className="p-6">
            <div className="w-full flex justify-center mb-4">
              <a
                  href="https://wossneakers.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center"
              >
                  <img
                  src="https://wossneakers.fr/WosLogos/logoWosBlack.png"
                  alt="logo-Wos-Black"
                  width="200"
                  style={image}
                  />
              </a>
            </div>
            <Heading className="text-2xl font-bold text-center text-gray-800">
              Au revoir {first_name ?? ""} 🥲
            </Heading>
            <Text className="text-center text-gray-600 mt-2">
              Es-tu sûr de ne t'être pas tiré une balle dans le pied ? <br />
              Blague à part, nous sommes désolés de te voir partir et ton compte a été supprimé avec succès. <br />
              Si tu changes d'avis, notre porte te sera toujours ouverte !
            </Text>
          </Container>

          {/* Optional CTA */}
          <Container className="text-center mt-6">
            Allez, une dernière visite pour la route ? 😉
          </Container>

          {/* Optional CTA */}
          <Container className="text-center mt-6">
            <a
              href="https://wossneakers.fr/"
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-semibold text-decoration-none"
            >
              Re-découvrir la boutique
            </a>
          </Container>
          <Footer />
        </Body>
      </Html>
    </Tailwind>
  )
}

const image= {
    display: "block",
    margin: "0 auto 20px",
}

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

const footerContainer = {
  maxWidth: "600px",
  margin: "50px auto",
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

const footer = {
  backgroundColor: "#f3f4f6",
  padding: "0",
  margin: "0",
}

const columnLeft = {
  padding: "20px",
  textAlign: "center" as const,
  backgroundColor: "#f3f4f6",
}

const columnRight = {
  padding: "20px",
  textAlign: "center" as const,
  backgroundColor: "#CFCAB8",
}

const blockfooterText = {
  color: "black",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
}

const blockfooterTextLeft = {
  color: "black",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
}

const contactButton = {
  color: "#ffffff",
  fontSize: "14px",
  textDecoration: "none",
  fontWeight: "600",
  backgroundColor: "#000000",
  padding: "10px 20px",
  borderRadius: "4px",
  display: "inline-block",
  marginTop: "8px",
}

const socialIcon = {
  display: "inline-block",
  verticalAlign: "middle" as const,
}

const bannerSection = {
  textAlign: "center" as const,
  padding: "0",
  margin: "0",
  backgroundColor: "black",
  color: "white",
  fontFamily: "Staatliches, sans-serif",
  fontSize: "24px",
}

export const customerDeletedEmail = (props: GoodbyeEmailProps) => (
  <GoodbyeEmailComponent {...props} />
)

// @ts-ignore
export default () => <GoodbyeEmailComponent first_name="Maxime" />
