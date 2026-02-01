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
  Button,
} from "@react-email/components"
import Footer from "../lib/footer"

type InactivityWarningEmailProps = {
  first_name?: string
  email?: string
  last_activity_date?: string
  deletion_date?: string
}

function InactivityWarningEmailComponent({
  first_name,
  email,
  last_activity_date,
  deletion_date,
}: InactivityWarningEmailProps) {
  const storeFrontUrl = process.env.STORE_FRONTEND_URL || "https://wossneakers.fr"
  
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Ton compte WOS Sneakers sera bientôt supprimé</Preview>
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
              {first_name ? `Hey ${first_name}` : "Bonjour"}, tu nous manques ! 👋
            </Heading>
            <Text className="text-center text-gray-600 mt-2">
              Nous avons remarqué que tu n'as pas visité WOS Sneakers depuis un moment.
            </Text>
          </Container>

          {/* Main Content */}
          <Container className="px-6">
            <Section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <Text className="text-yellow-800 font-semibold text-center mb-2">
                ⚠️ Information importante
              </Text>
              <Text className="text-yellow-700 text-sm text-center">
                Conformément à notre politique de confidentialité (RGPD), les comptes inactifs 
                depuis plus de 3 ans sont automatiquement supprimés.
              </Text>
            </Section>

            <Section className="mt-6">
              <Row>
                <Column className="text-center">
                  <Text className="text-gray-500 text-sm">Dernière activité</Text>
                  <Text className="text-gray-800 font-semibold">{last_activity_date || "Il y a plus de 3 ans"}</Text>
                </Column>
                <Column className="text-center">
                  <Text className="text-gray-500 text-sm">Suppression prévue</Text>
                  <Text className="text-red-600 font-semibold">{deletion_date || "Dans 30 jours"}</Text>
                </Column>
              </Row>
            </Section>

            <Section className="mt-6 text-center">
              <Text className="text-gray-600 mb-4">
                Pour conserver ton compte, il te suffit de te connecter une seule fois :
              </Text>
              <Button
                href={`${storeFrontUrl}/fr/account`}
                className="bg-black text-white px-6 py-3 rounded-lg font-semibold no-underline"
              >
                Me connecter maintenant
              </Button>
            </Section>

            <Section className="mt-8 bg-gray-50 rounded-lg p-4">
              <Text className="text-gray-600 text-sm">
                <strong>Ce qui sera supprimé :</strong>
              </Text>
              <Text className="text-gray-500 text-sm mt-2">
                • Tes informations personnelles (nom, adresse, téléphone)<br />
                • Tes adresses enregistrées<br />
                • Ton historique de navigation
              </Text>
              <Text className="text-gray-600 text-sm mt-4">
                <strong>Ce qui sera conservé (obligation légale) :</strong>
              </Text>
              <Text className="text-gray-500 text-sm mt-2">
                • Tes factures et commandes (pendant 5 ans)
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

export function rgpdInactivityWarningEmail(props: InactivityWarningEmailProps) {
  return <InactivityWarningEmailComponent {...props} />
}

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
}

const logo = {
  margin: "0 auto",
}
