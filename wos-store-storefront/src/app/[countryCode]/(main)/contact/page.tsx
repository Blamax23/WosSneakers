import { Metadata } from "next"
import ContactPage from "@modules/contact/ContactPage"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Contactez-nous !",
  description:
    "Formulaire de contact pour remonter les commentaires ou les questions.",
}

export default async function Contact(props: {
  params: { countryCode: string }
}) {
  const { countryCode } = props.params
  const region = await getRegion(countryCode)

  if (!region) return null

  return (
    <div className="py-12">
      <ContactPage />
    </div>
  )
}

