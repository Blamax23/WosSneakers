"use client"

import { isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Choisissez un moyen de paiement</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { countryCode } = useParams()


  const paymentSession =
  cart.payment_collection?.payment_sessions?.find(
    (session) =>
      isStripe(session.provider_id) &&
      ["pending", "authorized", "requires_more"].includes(session.status as any)
  ) ??
  cart.payment_collection?.payment_sessions?.find((session) =>
    isStripe(session.provider_id)
  )

  const onPaymentCompleted = async () => {
  try {
    await placeOrder()
  } catch (err: any) {
    setErrorMessage(err?.message ?? "Impossible de finaliser la commande.")
    throw err
  }
}

  const stripe = useStripe()
  const elements = useElements()

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
  if (!stripe || !elements || !cart) return

  setSubmitting(true)
  setErrorMessage(null)

  try {
    // 1) Validation du PaymentElement côté client
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message ?? "Erreur de validation du paiement.")
      return
    }

    const clientSecret = paymentSession?.data?.client_secret as string | undefined
    if (!clientSecret) {
      setErrorMessage(
        "Impossible de récupérer la session Stripe (client_secret manquant). Vérifiez la configuration Stripe côté Medusa."
      )
      return
    }

    // 2) Confirmation du paiement (sans redirection si pas nécessaire)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/api/capture-payment/${cart.id}?country_code=${countryCode}`,
        payment_method_data: {
          billing_details: {
            name: `${cart.billing_address?.first_name ?? ""} ${cart.billing_address?.last_name ?? ""}`.trim(),
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email ?? undefined,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      },
      redirect: "if_required",
    })

    // Cas d'erreur Stripe
    if (error) {
      const pi = error.payment_intent

      // Parfois Stripe renvoie une "error" mais le PI est en réalité validé
      if (pi?.status && ["requires_capture", "succeeded", "processing"].includes(pi.status)) {
        await onPaymentCompleted()
        return
      }

      setErrorMessage(error.message ?? "Erreur de paiement.")
      return
    }

    // Cas OK (pas d'erreur) : on doit analyser le PaymentIntent
    if (!paymentIntent) {
      setErrorMessage("Paiement confirmé, mais aucun PaymentIntent n'a été retourné.")
      return
    }

    if (["requires_capture", "succeeded", "processing"].includes(paymentIntent.status)) {
      await onPaymentCompleted()
      return
    }

    if (paymentIntent.status === "requires_action") {
      setErrorMessage("Une action supplémentaire est requise pour finaliser le paiement.")
      return
    }

    setErrorMessage(`Paiement non finalisé (statut Stripe: ${paymentIntent.status}).`)
  } catch (err: any) {
    setErrorMessage(err?.message ?? "Une erreur est survenue.")
  } finally {
    setSubmitting(false)
  }
}


// useEffect(() => {
  //   if (cart.payment_collection?.status === "authorized") {
  //     onPaymentCompleted()
  //   }
  // }, [cart.payment_collection?.status])

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Confirmer la commande
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

export default PaymentButton