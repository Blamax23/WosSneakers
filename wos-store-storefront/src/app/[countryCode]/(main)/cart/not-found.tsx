import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404",
  description: "Une erreur s'est produite",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Oups... On dirait que nous avons un cailloux dans la chaussure...</h1>
      <p className="text-small-regular text-ui-fg-base">
        Le panier que vous recherchez n'existe pas ou a été supprimé. Nettoyez vos cookies et essayez à nouveau.
      </p>
      <InteractiveLink href="/">Retourner à l'accueil</InteractiveLink>
    </div>
  )
}
