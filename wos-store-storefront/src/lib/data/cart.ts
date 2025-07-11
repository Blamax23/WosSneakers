"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { Weight } from "lucide-react"
import { OrderEdit } from "@medusajs/js-sdk/dist/admin/order-edit"
/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const availableOptions = await sdk.store.fulfillment.listCartOptions({ cart_id: cartId }, {})
  const selectedOption = availableOptions.shipping_options.find(
    (option) => option.id === shippingMethodId
  )

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      if (selectedOption) {
        await sdk.store.cart.update(
          cartId,
          {
            metadata: {
              selected_shipping_option: selectedOption,
            },
          },
          {},
          headers
        )
      }

      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}


export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeaders()),
  }

  console.log("Cart : ", cart)
  console.log("Data : ", data)
  console.log("Headers : ", headers)

  const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${cart.id}/payment-sessions`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    },
    credentials: "include", // 👈 indispensable pour que les cookies partent
    body: JSON.stringify(data),
  })

  console.log("Voici le res : ", res)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error("Payment session init failed:", err)
    throw new Error(err.message || "Échec de l'initiation du paiement")
  }

  // 🔁 Revalidation côté serveur si nécessaire
  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  return await res.json()
}


export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)
  console.log("Placing order for country code:", cartRes);

  if (cartRes?.type === "order") {
    const order = cartRes.order
    const countryCode = order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)    // Clean up + redirect
    removeCartId()
    // NE PAS faire le redirect ici !
    return order
  }

  // Par défaut retourne null ou throw
  return null
}

export async function getSessionId(email: string, password: string) {
  const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const loginData = await loginRes.json()
  if (!loginRes.ok) throw new Error(loginData.message || 'Login failed')

  const jwtToken = loginData.token

  const sessionRes = await fetch(`${BACKEND_URL}/auth/session`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwtToken}` },
    credentials: 'include',
  })

  const rawSetCookie = sessionRes.headers.get('set-cookie')
  if (!rawSetCookie) throw new Error('No session cookie received')

  const sidMatch = rawSetCookie.match(/connect\.sid=([^;]+)/)
  if (!sidMatch) throw new Error('Session ID not found')
  const sessionId = sidMatch[1]

  return sessionId
}

const BACKEND_URL = 'http://localhost:9000'
const email = 'auth@auth.com'
const password = 'secret'
const PUBLISHABLE_API_KEY = 'pk_91e7eb4015e608a7313f9ec6174511c516e8847d77d16835545c113595633fda'

export async function sendOrderToSendCloud(order: any) {
  console.log("order data here ", order)
  console.log("weight : ", order.items[0].product?.weight || '')
  console.log("hs_code : ", order.items[0].product?.hs_code || '')

  try {
    const payload = {
      order: {
        id: order.id,
        email: order.email,
        status: order.status,
        fulfillment_status: order.fulfillment_status,
        currency_code: order.currency_code,
        shipping_address: {
          first_name: order.shipping_address?.first_name || '',
          last_name: order.shipping_address?.last_name || '',
          address_1: order.shipping_address?.address_1 || '',
          address_2: order.shipping_address?.address_2 || '',
          city: order.shipping_address?.city || '',
          postal_code: order.shipping_address?.postal_code || '',
          country_code: order.shipping_address?.country_code || '',
          phone: order.shipping_address?.phone || '',
          company: order.shipping_address?.company || ''
        },
        items: order.items?.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          weight: item.product?.weight || '',
          hs_tariff_number: item.product?.hs_code || '',
          variant: {
            sku: item.variant?.sku || '',
            product: {
              title: item.product?.title || '',
            }
          }
        })) || [],
        shipping_methods: order.shipping_methods?.map((method: any) => ({
          shipping_option: {
            name: method.name || '',
            price: method.amount,
            id: order.shipping_methods[0].data.shipment_id
          }
        })) || [],
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    };

    console.log("Voici le payload : ", payload.order)

    const sessionId = getSessionId(email, password)

    const labelRes = await fetch(`${BACKEND_URL}/store/sendscloud/label/${order.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.PUBLISHABLE_API_KEY || PUBLISHABLE_API_KEY,
        Cookie: `connect.sid=${sessionId}`,
      },
      body: JSON.stringify(payload),
    })

    console.log("Label Res : ", labelRes)

    const labelData = await labelRes.json()

    if (!labelRes.ok) {
      console.error('❌ SendCloud Error:', labelData.message)
    } else {
      console.log('✅ SendCloud Label Created:', labelData)
      return labelData
    }
  } catch (err: any) {
    console.error('❌ Failed to send order to SendCloud:', err.message)
  }
}

export async function getTrackingLinkOrder(labelId: string) {
  const sessionId = getSessionId(email, password)

  console.log("J'ai bien le labelId avant l'envoi à Sendcloud : ", labelId)

  const labelRes = await fetch(`${BACKEND_URL}/store/sendscloud/trackinglink/${labelId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': process.env.PUBLISHABLE_API_KEY || PUBLISHABLE_API_KEY,
      Cookie: `connect.sid=${sessionId}`,
    },
  })

  console.log("Label Res pour le tracking link : ", labelRes)

  const labelData = await labelRes.json()

  if (!labelRes.ok) {
    console.error('❌ SendCloud Error:', labelData.message)
  } else {
    console.log('✅ SendCloud Tracking Link :', labelData.trackingLink)
    return labelData.trackingLink
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}

// À ajouter dans votre fichier @lib/data/cart

export const updateCartPaymentMethod = async (cartId: string, paymentMethod: string) => {
  try {
    // Utiliser directement le client Medusa
    const response = await sdk.store.cart.update(cartId, {
      metadata: {
        selected_payment_method: paymentMethod,
      },
    })

    return response.cart
  } catch (error) {
    console.error('Error updating payment method:', error)
    throw error
  }
}


// Ou si vous n'avez pas de client Medusa configuré, utilisez fetch directement
export const updateCartPaymentMethodFetch = async (cartId: string, paymentMethod: string) => {
  try {
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const response = await fetch(`${medusaUrl}/store/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          selected_payment_method: paymentMethod,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to update payment method: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating payment method:', error)
    throw error
  }
}