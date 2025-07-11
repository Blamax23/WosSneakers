import { Container, Heading, Text } from "@medusajs/ui"

import { isStripe, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  console.log("PaymentDetails - Order reçu:", order)
  console.log("PaymentDetails - Order type:", typeof order)
  console.log("PaymentDetails - Order null?", order === null)
  console.log("PaymentDetails - Order undefined?", order === undefined)

  // Vérification plus robuste
  if (!order) {
    console.error("Order is null/undefined in PaymentDetails")
    return <div>Loading payment details...</div>
  }

  const metadata = order.metadata as { selected_payment_method?: string }
  const payment_method = metadata.selected_payment_method
  const payment = order.payment_collections?.[0].payments?.[0]


  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Payment
      </Heading>
      <div>
        {payment_method && payment && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Méthode de paiement
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment_method].title}
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Détail du paiement
              </Text>
              <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {paymentInfoMap[payment_method].icon}
                </Container>
                <Text data-testid="payment-amount">
                  {isStripe(payment_method) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                      amount: payment.amount,
                      currency_code: order.currency_code,
                    })} paid at ${new Date(
                      payment.created_at ?? ""
                    ).toLocaleString()}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
