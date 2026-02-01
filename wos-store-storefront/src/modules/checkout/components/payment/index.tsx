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
import { useCallback, useContext, useEffect, useRef, useState } from "react"

// Global lock to prevent concurrent payment session initialization
let globalInitLock = false
let globalInitCartId: string | null = null

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

  // Medusa sessions don't always use the same status value.
  // For Stripe, the reliable signal is data.client_secret.
  const stripeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) =>
      paymentSession?.provider_id?.toLowerCase?.().includes("stripe")
  )

  // Session pour le mode test (pp_system_default)
  const systemSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) =>
      paymentSession?.provider_id === "pp_system_default"
  )

  const activeSession =
    stripeSession && (stripeSession as any)?.data?.client_secret
      ? stripeSession
      : systemSession || null

  const hasStripeSession = !!stripeSession
  const hasSystemSession = !!systemSession
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
      // MODE TEST: Si on utilise pp_system_default, on passe directement à l'étape suivante
      if (hasSystemSession && !stripeSession) {
        router.push(pathname + "?" + createQueryString("step", "review"), {
          scroll: false,
        })
        return
      }

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
          await updateCartPaymentMethod(cart.id, selectedPaymentMethod)
        } catch (err) {
          console.error("Failed to update payment method in cart:", err)
          setError("Impossible d'enregistrer le moyen de paiement. Veuillez réessayer.")
          return
        }
      }

      router.push(pathname + "?" + createQueryString("step", "review"), {
        scroll: false,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const initRuns = useRef(0)

  const initStripe = useCallback(async () => {
    // GLOBAL LOCK: Prevent concurrent initialization across re-renders
    if (globalInitLock) {
      console.log("⏳ Payment init already in progress, skipping...")
      return
    }

    // We only want to init once per open step (or retry a couple of times)
    if (isInitializingStripe || activeSession || paidByGiftcard) return

    // Stripe session already exists but isn't hydrated yet → just refresh/poll
    if (hasStripeSession && !activeSession) {
      setIsInitializingStripe(true)
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 300 + i * 250))
        router.refresh()
      }
      setIsInitializingStripe(false)
      return
    }

    // Stripe init requires at least one shipping method on many setups
    if ((cart?.shipping_methods?.length ?? 0) === 0) return

    // Skip if we already initialized for this cart
    if (globalInitCartId === cart?.id) {
      console.log("⏳ Already initialized for this cart, skipping...")
      return
    }

    initRuns.current += 1
    if (initRuns.current > 3) return

    // Acquire global lock
    globalInitLock = true
    globalInitCartId = cart?.id
    setIsInitializingStripe(true)
    setError(null)

    // Utiliser pp_stripe_stripe pour le paiement Stripe normal
    const providerId = "pp_stripe_stripe"

    try {
      await initiatePaymentSession(cart, {
        provider_id: providerId,
      })

      // Give the backend a short moment to persist & hydrate relations
      await new Promise((r) => setTimeout(r, 250))
      router.refresh()
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : ""
      console.error("Failed to initialize Stripe session:", err)

      // If it looks like a harmless conflict (session already exists), refresh and retry.
      if (/already|exists|initiated|conflict/i.test(msg)) {
        await new Promise((r) => setTimeout(r, 350))
        router.refresh()
        return
      }

      setError("Impossible d'initialiser le paiement. Veuillez réessayer.")
    } finally {
      globalInitLock = false
      setIsInitializingStripe(false)
    }
  }, [cart, isInitializingStripe, activeSession, router, paidByGiftcard, hasStripeSession])


  // Effet pour initialiser Stripe - CORRIGÉ
  useEffect(() => {
    if (!isOpen || !cart?.id || paidByGiftcard) return

    // Wait for delivery step to be saved (shipping methods present)
    if ((cart?.shipping_methods?.length ?? 0) === 0) return

    // If we don't have a usable Stripe session yet, try to ensure it.
    if (!activeSession) {
      initStripe()
    }
  }, [cart?.id, cart?.shipping_methods?.length, isOpen, activeSession, initStripe, paidByGiftcard])


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

  // Condition d'affichage Stripe
  const shouldShowPaymentElement =
    !paidByGiftcard &&
    (availablePaymentMethods?.length ?? 0) > 0 &&
    stripeReady &&
    !!stripeSession &&
    (stripeSession as any)?.data?.client_secret &&
    !isInitializingStripe

  // Condition d'affichage mode test
  const shouldShowTestMode = hasSystemSession && !shouldShowPaymentElement


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
            <Button
              onClick={handleEdit}
              variant="secondary"
              data-testid="edit-payment-button"
            >
              Modifier
            </Button>
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

          {/* MODE TEST - Afficher un message simple */}
          {shouldShowTestMode && (
            <div className="mt-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Text className="text-yellow-800 font-medium">
                🧪 MODE TEST - Paiement simulé
              </Text>
              <Text className="text-yellow-700 text-sm mt-2">
                Aucun paiement réel ne sera effectué. Cliquez sur Continuer pour passer à l&apos;étape suivante.
              </Text>
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
              (!paidByGiftcard && !shouldShowTestMode && (!stripeComplete || !stripe || !elements)) ||
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