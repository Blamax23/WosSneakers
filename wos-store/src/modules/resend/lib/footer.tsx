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
import { EmailFonts } from "./font"


export default function Footer() {
  return (
    <Container style={footerContainer}>
          < EmailFonts />
          <Section style={footer}>
            {/* Deux colonnes côte à côte avec table layout */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: "600px", margin: "0 auto" }}>
              <tbody>
                <tr>
                  {/* Colonne gauche */}
                  <td style={columnLeft} width="50%" valign="top">
                    <Text style={blockfooterText}>
                      Des questions ? Besoin d'aide ?
                    </Text>
                    <Link
                      href="https://wossneakers.fr/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={contactButton}
                    >
                      Contactez-nous
                    </Link>
                  </td>

                  {/* Colonne droite */}
                  <td style={columnRight} width="50%" valign="top">
                    <Text style={blockfooterTextLeft}>
                      Suivez-nous
                    </Text>
                    
                    {/* Icônes réseaux sociaux */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: "20px" }}>
                      <tbody>
                        <tr>
                          <td width="50%" align="right" style={{ paddingRight: "8px" }}>
                            <Link
                              href="https://www.instagram.com/wossneakers/"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Img
                                src="http://localhost:8000/instagram.png"
                                alt="Instagram"
                                width="40"
                                height="40"
                                style={socialIcon}
                              />
                            </Link>
                          </td>
                          <td width="50%" align="left" style={{ paddingLeft: "8px" }}>
                            <Link
                              href="https://www.tiktok.com/@wossneakers"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Img
                                src="http://localhost:8000/tiktok.png"
                                alt="TikTok"
                                width="40"
                                height="40"
                                style={socialIcon}
                              />
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bannière */}
            <Section style={bannerSection}>
              <Text style={banner}>
                Ta référence sneakers sur Bourg et alentours !
              </Text>
            </Section>
          </Section>
          <Text style={rights}>
              © {new Date().getFullYear()} Wos Sneakers. All rights reserved.
          </Text>
        </Container>
  )
}
const footerContainer = {
  maxWidth: "600px",
  margin: "50px auto",
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

const banner = {
  width: "100%",
  maxWidth: "600px",
  display: "block",
  fontFamily: "Staatliches, sans-serif",
  fontSize: "24px",
  letterSpacing: "1px",
}

const rights = {
  fontSize: "12px",
  color: "gray",
  textAlign: "center" as const,
  backgroundColor: "white",
}