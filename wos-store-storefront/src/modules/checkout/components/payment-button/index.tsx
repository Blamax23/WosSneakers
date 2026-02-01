"use client"

import { isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

// src/modules/checkout/components/payment-button/index.tsx
import { useEffect } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"

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

  const { countryCode } = useParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Chercher la session de paiement (Stripe ou System)
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.provider_id === "pp_stripe_stripe" || session.provider_id === "pp_system_default"
  )

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case paymentSession?.provider_id === "pp_system_default":
      return (
        <SystemPaymentButton
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

  const router = useRouter()
  const pathname = usePathname()

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
  if (!stripe || !elements || !cart) {
    return
  }
  setSubmitting(true)

  const { error: submitError } = await elements.submit()
  if (submitError) {
    setErrorMessage(submitError.message || null)
    setSubmitting(false)
    return
  }

  const clientSecret = paymentSession?.data?.client_secret as string

  await stripe
    .confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${
          window.location.origin
        }/api/capture-payment/${cart.id}?country_code=${countryCode}`,
        payment_method_data: {
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      },
      redirect: "if_required",
    })
    .then(({ error, paymentIntent }) => {
      if (error) {
        const pi = error.payment_intent

        if (
          (pi && pi.status === "requires_capture") ||
          (pi && pi.status === "succeeded")
        ) {
          onPaymentCompleted()
          return
        }

        setErrorMessage(error.message || null)
        setSubmitting(false)
        return
      }

      if (
        paymentIntent.status === "requires_capture" ||
        paymentIntent.status === "succeeded"
      ) {
        onPaymentCompleted()
      }
    })
}


useEffect(() => {
  if (cart.payment_collection?.status === "authorized") {
    onPaymentCompleted()
  }
}, [cart.payment_collection?.status])

useEffect(() => {
  elements?.getElement("payment")?.on("change", (e) => {
    if (!e.complete) {
      router.push(pathname + "?step=payment", {
        scroll: false,
      })
    }
  })
}, [elements])

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

// Bouton de paiement pour le mode test (pp_system_default)
const SystemPaymentButton = ({
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
  const router = useRouter()

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      // Directement compléter la commande sans vrai paiement
      const order = await placeOrder()
      
      if (order) {
        // Rediriger vers la page de confirmation
        router.push(`/${countryCode}/order/${order.id}/confirmed`)
      } else {
        setErrorMessage("La commande n'a pas pu être créée.")
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Impossible de finaliser la commande.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        [TEST] Confirmer la commande
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="system-payment-error-message"
      />
    </>
  )
}

export default PaymentButton