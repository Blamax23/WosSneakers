"use client"

import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"
import { convertToLocale } from "../../../../lib/util/money"

export default function PreviewPrice({ price }: { price: any }) {
  if (!price) {
    return null
  }

  // const formatter = new Intl.NumberFormat("fr-FR",{
  //   style: "currency",

  // })

  const original_price = convertToLocale({
    amount: price.original_amount,
    currency_code: price.currency_code
  })

  const calculated_price = convertToLocale({
    amount: price.calculated_amount,
    currency_code: price.currency_code
  })

  return (
    <>
      <Text
        className={clx("text-ui-fg-muted", {
          "text-ui-fg-interactive": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {calculated_price}
      </Text>
      {price.calculated_price.price_list_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {original_price}
        </Text>
      )}
    </>
  )
}
