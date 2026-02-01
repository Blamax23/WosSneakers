import {
  Text,
  Container,
  Heading,
  Html,
  Img,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Link,
  Button,
} from "@react-email/components"
import Footer from "../lib/footer"

type AccountDeletedEmailProps = {
  first_name?: string
  email?: string
  deletion_reason?: "inactivity" | "scheduled" | "admin"
}

function AccountDeletedEmailComponent({
  first_name,
  email,
  deletion_reason = "inactivity",
}: AccountDeletedEmailProps) {
  const storeFrontUrl = process.env.STORE_FRONTEND_URL || "https://wossneakers.fr"
  
  const reasonTexts = {
    inactivity: "suite à une inactivité de plus de 3 ans",
    scheduled: "comme demandé lors de ta demande de suppression",
    admin: "par l'équipe WOS Sneakers",
  }
  
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Ton compte WOS Sneakers a été supprimé</Preview>
        <Body className="bg-white my-10 mx-auto w-full max-w-2xl">
          {/* Header */}
          <Container className="p-6">
            <Section style={logoSection}>
              <Link
                href={storeFrontUrl}
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
            <Heading className="text-2xl font-bold text-center text-gray-800">
              Compte supprimé
            </Heading>
            <Text className="text-center text-gray-600 mt-2">
              {first_name ? `Bonjour ${first_name}` : "Bonjour"},
            </Text>
          </Container>

          {/* Main Content */}
          <Container className="px-6">
            <Section className="bg-gray-50 rounded-lg p-6 mt-4">
              <Text className="text-gray-700 text-center">
                Nous t'informons que ton compte WOS Sneakers associé à l'adresse 
                <strong> {email} </strong> a été définitivement supprimé {reasonTexts[deletion_reason]}.
              </Text>
            </Section>

            <Section className="mt-6">
              <Text className="text-gray-600 text-sm">
                <strong>Ce qui a été supprimé :</strong>
              </Text>
              <Text className="text-gray-500 text-sm mt-2">
                ✓ Tes informations personnelles<br />
                ✓ Tes adresses enregistrées<br />
                ✓ Tes préférences de compte
              </Text>
            </Section>

            <Section className="mt-4">
              <Text className="text-gray-600 text-sm">
                <strong>Ce qui est conservé (obligation légale - 5 ans) :</strong>
              </Text>
              <Text className="text-gray-500 text-sm mt-2">
                • Tes factures (données anonymisées)<br />
                • L'historique de tes commandes (données anonymisées)
              </Text>
            </Section>

            <Section className="mt-8 text-center">
              <Text className="text-gray-600 mb-4">
                Tu souhaites revenir ? Tu peux créer un nouveau compte à tout moment :
              </Text>
              <Button
                href={`${storeFrontUrl}/fr/account`}
                className="bg-black text-white px-6 py-3 rounded-lg font-semibold no-underline"
              >
                Créer un nouveau compte
              </Button>
            </Section>

            <Section className="mt-8 border-t border-gray-200 pt-6">
              <Text className="text-gray-500 text-xs text-center">
                Cet email a été envoyé conformément au Règlement Général sur la Protection des Données (RGPD).
                Si tu n'as pas demandé cette suppression et penses qu'il s'agit d'une erreur, 
                contacte-nous immédiatement à contact@wossneakers.fr
              </Text>
            </Section>
          </Container>

          {/* Footer */}
          <Container className="mt-8">
            <Footer />
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

export function rgpdAccountDeletedEmail(props: AccountDeletedEmailProps) {
  return <AccountDeletedEmailComponent {...props} />
}

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
}

const logo = {
  margin: "0 auto",
}
