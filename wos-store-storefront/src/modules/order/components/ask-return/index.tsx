import { HttpTypes } from "@medusajs/types"
import { Button, Heading, toast } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"


type OrderSummaryProps = {
    order: HttpTypes.StoreOrder
}

const AskReturn = ({ order }: OrderSummaryProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const handleReturn = async () => {
        setIsLoading(true)
        try {
            // ... logique métier ...
            setIsLoading(false)
            toast.success("Redirection vers le formulaire de retour…")
            router.push(`/`)
        } catch (error) {
            setIsLoading(false)
            toast.error(`Erreur : ${error}`)
        }
    }
    return (
        <div className="mt-6">
            <Heading className="text-base-semi">
                Votre produit a un défaut ou il n'est pas à votre taille ?
            </Heading>
            <div className="text-base-regular my-2">
                <ul className="flex flex-row justify-between items-center">
                    <li>
                        Vous pouvez faire une demande de retour si vous le souhaitez.
                    </li>
                    <li>
                        <Button onClick={handleReturn}>Demander un retour</Button>
                    </li>
                </ul>
            </div>
        </div>

    )
}

export default AskReturn
