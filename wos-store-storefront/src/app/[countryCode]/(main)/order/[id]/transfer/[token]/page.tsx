import { Heading, Text } from "@medusajs/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  return (
    <div className="flex flex-col gap-y-4 items-start w-2/5 mx-auto mt-10 mb-20">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        <Heading level="h1" className="text-xl text-zinc-900">
          Demande de transfert pour la commande n°{id}
        </Heading>
        <Text className="text-zinc-600">
          Vous avez reçu une demande de transfert de propriété de votre commande
          ({id}). Si vous acceptez cette demande, vous pouvez approuver le
          transfert en cliquant sur le bouton ci-dessous.
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <Text className="text-zinc-600">
          Si vous acceptez, le nouveau propriétaire prendra en charge toutes les
          responsabilités et autorisations associées à cette commande.
        </Text>
        <Text className="text-zinc-600">
          Si vous n'êtes pas le propriétaire de cette commande, veuillez ignorer
          ce message. Si vous avez des questions, veuillez contacter le
          service client de WOS Sneakers.
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}
