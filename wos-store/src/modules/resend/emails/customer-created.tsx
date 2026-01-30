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
import { EmailFonts } from "../lib/font"
import Footer from "../lib/footer"

type WelcomeEmailProps = {
  first_name?: string
}

function WelcomeEmailComponent({ first_name }: WelcomeEmailProps) {
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <EmailFonts />
        <Preview>Bienvenue chez WOS Sneakers !</Preview>
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
              Bienvenue {first_name ?? ""} 👋
            </Heading>
            <Text className="text-center text-gray-600 mt-2">
              Merci de t'être inscrit chez <strong>WOS Sneakers</strong>.<br />
              Prêt à partir du bon pied ? <br />
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

export const customerCreatedEmail = (props: WelcomeEmailProps) => (
  <WelcomeEmailComponent {...props} />
)

// @ts-ignore
export default () => <WelcomeEmailComponent first_name="Maxime" />
