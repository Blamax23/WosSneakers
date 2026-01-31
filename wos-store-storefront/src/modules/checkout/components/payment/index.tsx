"use client"

import { paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession, updateCartPaymentMethod } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { StripeContext } from "@modules/checkout/components/payment-wrapper/stripe-wrapper"
import Divider from "@modules/common/components/divider"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { StripePaymentElementChangeEvent } from "@stripe/stripe-js"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripeComplete, setStripeComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>()
  const [isInitializingStripe, setIsInitializingStripe] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const stripeReady = useContext(StripeContext)

  // Medusa sessions don't always use the same status value. For Stripe,
  // the reliable signal is data.client_secret.
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) =>
      paymentSession?.provider_id?.includes("stripe") &&
      !!paymentSession?.data?.client_secret
  )
  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) ||
    paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const stripe = stripeReady ? useStripe() : null
  const elements = stripeReady ? useElements() : null

  const handlePaymentElementChange = async (
    event: StripePaymentElementChangeEvent
  ) => {
    if (event.value.type) {
      setSelectedPaymentMethod(event.value.type)
    }
    setStripeComplete(event.complete)

    if (event.complete) {
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!stripe || !elements) {
        setError("Le paiement n'est pas prêt. Veuillez réessayer dans un instant.")
        return
      }

      await elements.submit().catch((err) => {
        console.error(err)
        setError(err.message || "Une erreur est survenue avec le paiement.")
        return
      })

      // Sauvegarder la méthode de paiement dans le panier avant de continuer
      if (selectedPaymentMethod) {
        try {
          console.log("On modifie bien le panier")
          await updateCartPaymentMethod(cart.id, selectedPaymentMethod)
        } catch (err) {
          console.error("Failed to update payment method in cart:", err)
          setError("Impossible d'enregistrer le moyen de paiement. Veuillez réessayer.")
          return
        }
      }

      console.log("Voici le panier après changement : ", cart)

      router.push(pathname + "?" + createQueryString("step", "review"), {
        scroll: false,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const initStripe = useCallback(async () => {
    if (isInitializingStripe || activeSession) return

    setIsInitializingStripe(true)
    try {
      console.log("Je suis juste avant l'initSession", cart)
      await initiatePaymentSession(cart, {
        provider_id: "pp_stripe_stripe",
      })

      // 💡 Refetch du cart ici pour récupérer le payment_session à jour
      router.refresh() // ← ça va relancer le fetch côté server dans Next.js
    } catch (err) {
      console.error("Failed to initialize Stripe session:", err)
      setError("Impossible d'initialiser le paiement. Veuillez réessayer.")
    } finally {
      setIsInitializingStripe(false)
    }
  }, [cart, isInitializingStripe, activeSession, router])


  // Effet pour initialiser Stripe - CORRIGÉ
  useEffect(() => {
    if (!activeSession && isOpen && cart?.id) {
      initStripe()
    }
  }, [cart?.id, isOpen, activeSession, initStripe])


  useEffect(() => {
    setError(null)
  }, [isOpen])

  useEffect(() => {
    const urlError = searchParams.get("error")
    if (urlError) {
      setError("Une erreur est survenue lors du paiement, veuillez réessayer. Si l'erreur persiste, merci de contacter l'assistance.")
    }
  }, [searchParams])

  // Initialiser selectedPaymentMethod depuis les métadonnées du cart
  useEffect(() => {
    if (cart?.metadata?.selected_payment_method) {
      setSelectedPaymentMethod(cart.metadata.selected_payment_method)
    }
  }, [cart?.metadata?.selected_payment_method])

  // Condition d'affichage plus stricte
  const shouldShowPaymentElement =
    !paidByGiftcard &&
    (availablePaymentMethods?.length ?? 0) > 0 &&
    stripeReady &&
    !!activeSession &&
    !isInitializingStripe

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Paiement
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Modifier
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {/* Afficher un loader pendant l'initialisation */}
          {isInitializingStripe && (
            <div className="mt-5 p-4 text-center">
              <Text>Connexion à notre prestataire de paiement...</Text>
            </div>
          )}

          {shouldShowPaymentElement && (
            <div className="mt-5 transition-all duration-150 ease-in-out">
              <PaymentElement
                onChange={handlePaymentElementChange}
                options={{
                  layout: "accordion",
                }}
              />
            </div>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Moyen de paiement
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Carte cadeau
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (!paidByGiftcard && (!stripeComplete || !stripe || !elements)) ||
              isInitializingStripe
            }
            data-testid="submit-payment-button"
          >
            Continuer
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession && selectedPaymentMethod ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Moyen de paiement
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Détails de paiement
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>Les détails apparaîtront après validation</Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Moyen de paiement
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Carte cadeau
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment