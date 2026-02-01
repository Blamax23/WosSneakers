import * as React from "react"
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Img,
} from "@react-email/components"
import Footer from "../lib/footer"

interface PasswordResetEmailProps {
  resetLink: string
  customerName?: string
}

export const passwordResetEmail = ({
  resetLink,
  customerName,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de votre mot de passe WOS Sneakers</Preview>
      <Body style={main}>
        <Container style={container}>
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
          <Heading style={h1}>Réinitialisation de mot de passe</Heading>
          
          <Text style={text}>
            {customerName ? `Bonjour ${customerName},` : "Bonjour,"}
          </Text>
          
          <Text style={text}>
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte chez WOS Sneakers.
          </Text>
          
          <Text style={text}>
            Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
          </Text>
          
          <Link href={resetLink} style={button}>
            Réinitialiser mon mot de passe
          </Link>
          
          <Text style={text}>
            Ce lien est valable pendant 1 heure.
          </Text>
          
          <Text style={textSmall}>
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
          </Text>
          
          <Footer />
        </Container>
      </Body>
    </Html>
  )
}

export default passwordResetEmail


const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const textSmall = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0px",
}


const image= {
  display: "block",
  margin: "0 auto 20px",
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

const text = {
  fontSize: "16px",
  color: "#4b5563",
  marginBottom: "12px",
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