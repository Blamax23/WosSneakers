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
} from "@react-email/components"

type WelcomeEmailProps = {
  first_name?: string
}

function WelcomeEmailComponent({ first_name }: WelcomeEmailProps) {
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Bienvenue chez WOS Sneakers !</Preview>
        <Body className="bg-white my-10 mx-auto w-full max-w-2xl">
          {/* Header */}
          <Container className="p-6">
            <div className="w-full flex justify-center mb-4">
              <a
                href="https://imgbb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                <img
                  src="https://i.ibb.co/qMLmLrrw/logo-Wos-Black.png"
                  alt="logo-Wos-Black"
                  className="w-24"
                />
              </a>
            </div>
            <Heading className="text-2xl font-bold text-center text-gray-800">
              Bienvenue {first_name ?? ""} 👋
            </Heading>
            <Text className="text-center text-gray-600 mt-2">
              Merci de t'être inscrit chez <strong>WOS Sneakers</strong>.<br />
              On est ravi de t'accueillir dans la team ! Prépare-toi à découvrir les meilleures paires 🔥
            </Text>
          </Container>

          {/* Optional CTA */}
          <Container className="text-center mt-6">
            <a
              href="https://wos-sneakers.com"
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-semibold text-decoration-none"
            >
              Découvrir la boutique
            </a>
          </Container>

          {/* Footer */}
          <Section className="bg-gray-50 p-6 mt-10">
            <Text className="text-center text-gray-500 text-sm">
              Si tu as des questions, n'hésite pas à répondre à cet e-mail ou à nous contacter à blamaxsolutions@gmail.com
            </Text>
            <Text className="text-center text-gray-400 text-xs mt-4">
              © {new Date().getFullYear()} WOS, Inc. Tous droits réservés.
            </Text>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  )
}

export const customerCreatedEmail = (props: WelcomeEmailProps) => (
  <WelcomeEmailComponent {...props} />
)

// @ts-ignore
export default () => <WelcomeEmailComponent first_name="Maxime" />
