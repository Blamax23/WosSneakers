import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        Panier
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        Vous n'avez rien dans votre panier. Changeons ça, vous ne pensez pas ? <br/>
        Cliquez sur le bouton ci-dessous pour explorer nos produits !
      </Text>
      <div>
        <InteractiveLink href="/store">Voir les produits</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
