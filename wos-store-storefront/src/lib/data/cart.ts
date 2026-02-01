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

const cleanEnv = (v?: string) => (v || "").trim().replace(/^['\"]|['\"]$/g, "")

/** Optional: some Medusa setups require it when creating carts */
function getSalesChannelId(): string | undefined {
  const id = cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_SALES_CHANNEL_ID)
  return id ? id : undefined
}

function getBackendUrl(): string {
  return (cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) || "http://localhost:9000").replace(
    /\/$/,
    ""
  )
}

function getStorefrontUrl(): string {
  // In server context, use the internal URL; in browser, use relative path
  if (typeof window === "undefined") {
    return cleanEnv(process.env.NEXT_PUBLIC_BASE_URL) || "http://localhost:8000"
  }
  return ""
}

function getPublishableKey(): string {
  const key =
    cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) ||
    cleanEnv(process.env.MEDUSA_PUBLISHABLE_KEY)

  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing. Add it to your storefront .env"
    )
  }

  return key
}

async function getStoreHeaders() {
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": getPublishableKey(),
    ...(await getAuthHeaders()),
  } as Record<string, string>
}

// Some Medusa/MikroORM versions crash (500) when requesting certain deep relations
// (ex: `shipping_methods.shipping_option`). That breaks Stripe init and forces the user
// to refresh the checkout page 1-3 times.
//
// We keep the cart query as complete as possible, but avoid the known-crashy relation.
// If your backend supports it, you can re-add it later.
const CART_FIELDS =
  "*items,*region,*items.product,*items.variant,*items.thumbnail,*items.metadata,+items.total,*promotions,*payment_collection,*payment_collection.payment_sessions,*shipping_methods,*billing_address,*shipping_address"

const CART_FIELDS_FALLBACK =
  "*items,*region,+items.total,*payment_collection,*payment_collection.payment_sessions,*shipping_methods,*billing_address,*shipping_address"
/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) return null

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  try {
    const { cart } = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
      `/store/carts/${id}`,
      {
        method: "GET",
        query: {
          fields: CART_FIELDS,
        },
        headers,
        next,
        cache: "no-store",
      }
    )

    return cart
  } catch (error) {
    // Some Medusa projects don't expose all relations. Retry with a smaller field set.
    try {
      const { cart } = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
        `/store/carts/${id}`,
        {
          method: "GET",
          query: {
            fields: CART_FIELDS_FALLBACK,
          },
          headers,
          next,
          cache: "no-store",
        }
      )

      return cart
    } catch {
      return null
    }
  }
}

 /** Always fetches a fresh cart (no cache) — useful after payment/shipping mutations. */
async function retrieveCartFresh(cartId: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    return await sdk.client
      .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
        method: "GET",
        query: { fields: CART_FIELDS },
        headers,
        cache: "no-store",
      })
      .then(({ cart }) => cart)
  } catch {
    // IMPORTANT: this is the call path used by Stripe init (polling for client_secret).
    // If the backend rejects some relations with a 500, fall back to a smaller field set
    // instead of making the checkout flaky.
    return await sdk.client
      .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
        method: "GET",
        query: { fields: CART_FIELDS_FALLBACK },
        headers,
        cache: "no-store",
      })
      .then(({ cart }) => cart)
  }
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

  const salesChannelId = getSalesChannelId()

  // If the cart already exists but was created without a sales channel,
  // attach it so subsequent updates don't fail.
  if (cart && salesChannelId && !(cart as any).sales_channel_id) {
    try {
      const { cart: updated } = await sdk.store.cart.update(
        cart.id,
        { sales_channel_id: salesChannelId } as any,
        {},
        headers
      )
      cart = updated
    } catch {
      // ignore - we'll handle errors on the next request
    }
  }

  if (!cart) {
    const payload: any = { region_id: region.id }
    if (salesChannelId) payload.sales_channel_id = salesChannelId

    const cartResp = await sdk.store.cart.create(payload, {}, headers)
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    const payload: any = { region_id: region.id }
    if (salesChannelId) payload.sales_channel_id = salesChannelId

    await sdk.store.cart.update(cart.id, payload, {}, headers)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error(
      "No existing cart found, please create one before updating"
    )
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const salesChannelId = process.env.NEXT_PUBLIC_MEDUSA_SALES_CHANNEL_ID

  // Medusa v2 requires a sales channel for cart updates. If your cart was created without it,
  // include it in every update call to avoid 400 errors.
  const payload: any = {
    ...data,
    ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
  }

  const { cart } = await sdk.store.cart.update(cartId, payload, {}, headers)

  revalidateTag("carts")
  return cart
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

  // Optional: keep the selected option in cart metadata for the UI.
  const availableOptions = await sdk.store.fulfillment.listCartOptions(
    { cart_id: cartId },
    {},
    headers
  )
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

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      // Return a fresh cart so the UI doesn't stay stuck (button grayed out).
      return await retrieveCartFresh(cartId)
    })
    .catch(medusaError)
}

/**
 * Init paiement robuste:
 * - crée une payment collection si absente
 * - init la session via /payment-sessions
 * - renvoie un cart frais
 */
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  if (!cart?.id) {
    throw new Error("Cart is missing an id")
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const isStripeProvider = (id?: string) =>
    (id || "").toLowerCase().includes("stripe")

  const backendUrl = getBackendUrl()
  const headers = await getStoreHeaders()

  // 1) Ensure payment collection exists
  let paymentCollectionId = (cart as any)?.payment_collection?.id as
    | string
    | undefined

  if (!paymentCollectionId) {
    const pcRes = await fetch(`${backendUrl}/store/payment-collections`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ cart_id: cart.id }),
    })

    if (!pcRes.ok) {
      // Some Medusa setups return a conflict if the payment collection already exists
      // (e.g. two concurrent requests). In that case we can just refetch the cart.
      if (pcRes.status !== 409) {
        const err = await pcRes.json().catch(() => ({} as any))
        throw new Error(
          err?.message || "Échec de la création de la payment collection"
        )
      }

      const fresh = await retrieveCartFresh(cart.id)
      paymentCollectionId = (fresh as any)?.payment_collection?.id
    } else {
      const pcJson = (await pcRes.json().catch(() => ({} as any))) as {
        payment_collection?: { id?: string }
      }
      paymentCollectionId = pcJson.payment_collection?.id
    }

    if (!paymentCollectionId) {
      throw new Error("Payment collection created but missing id in response")
    }
  }

  // 2) Init payment session via API route (fixes Safari cookie issues)
  const authHeaders = await getAuthHeaders()
  const psRes = await fetch(
    `${getStorefrontUrl()}/api/payment/init-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store",
      body: JSON.stringify({
        paymentCollectionId,
        providerId: data.provider_id,
      }),
    }
  )

  if (!psRes.ok) {
    const err = await psRes.json().catch(() => ({} as any))
    const msg = err?.message || "Échec de l'initiation du paiement"

    console.error("❌ Payment session creation failed:", {
      status: psRes.status,
      statusText: psRes.statusText,
      error: err,
      paymentCollectionId,
      providerId: data?.provider_id,
    })

    // If a payment session already exists (common with concurrent refreshes),
    // treat it as non-fatal and just refetch/poll for a client_secret.
    const looksLikeAlreadyExists =
      psRes.status === 409 ||
      /already|exists|initiated|conflict/i.test(String(msg))

    if (!looksLikeAlreadyExists) {
      throw new Error(msg)
    }
  }

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  // Stripe's PaymentElement needs client_secret. On some setups, the session
  // is created but the cart relation is not immediately hydrated.
  // Poll a few times to avoid a flaky first render.
  if (isStripeProvider((data as any)?.provider_id)) {
    for (let i = 0; i < 6; i++) {
      const fresh = await retrieveCartFresh(cart.id)
      const stripeSession = (fresh as any)?.payment_collection?.payment_sessions?.find(
        (s: any) => isStripeProvider(s?.provider_id) && !!s?.data?.client_secret
      )

      if (stripeSession) {
        return fresh
      }

      await sleep(250 + i * 150)
    }
  }

  return await retrieveCartFresh(cart.id)
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

export async function submitPromotionForm(
  _currentState: unknown,
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
export async function setAddresses(_currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }

    // Ensure cart exists (cookie)
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data: any = {
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
    }

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on") {
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
 * Places an order for a cart.
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
    .then(async (res) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return res
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const order = cartRes.order

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    await removeCartId()
    return order
  }

  return null
}

// -------------------- Sendcloud helpers (kept from your project) --------------------

const BACKEND_URL = "http://localhost:9000"
const email = "auth@auth.com"
const password = "secret"
const PUBLISHABLE_API_KEY =
  "pk_91e7eb4015e608a7313f9ec6174511c516e8847d77d16835545c113595633fda"

export async function getSessionId(email: string, password: string) {
  const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const loginData = await loginRes.json().catch(() => ({} as any))
  if (!loginRes.ok) throw new Error(loginData.message || "Login failed")

  const jwtToken = loginData.token

  const sessionRes = await fetch(`${BACKEND_URL}/auth/session`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwtToken}` },
    credentials: "include",
  })

  const rawSetCookie = sessionRes.headers.get("set-cookie")
  if (!rawSetCookie) throw new Error("No session cookie received")

  const sidMatch = rawSetCookie.match(/connect\.sid=([^;]+)/)
  if (!sidMatch) throw new Error("Session ID not found")
  return sidMatch[1]
}

export async function sendOrderToSendCloud(order: any) {
  try {
    const payload = {
      order: {
        id: order.id,
        email: order.email,
        status: order.status,
        fulfillment_status: order.fulfillment_status,
        currency_code: order.currency_code,
        shipping_address: {
          first_name: order.shipping_address?.first_name || "",
          last_name: order.shipping_address?.last_name || "",
          address_1: order.shipping_address?.address_1 || "",
          address_2: order.shipping_address?.address_2 || "",
          city: order.shipping_address?.city || "",
          postal_code: order.shipping_address?.postal_code || "",
          country_code: order.shipping_address?.country_code || "",
          phone: order.shipping_address?.phone || "",
          company: order.shipping_address?.company || "",
        },
        items:
          order.items?.map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            weight: item.product?.weight || "",
            hs_tariff_number: item.product?.hs_code || "",
            variant: {
              sku: item.variant?.sku || "",
              product: {
                title: item.product?.title || "",
              },
            },
          })) || [],
        shipping_methods:
          order.shipping_methods?.map((method: any) => ({
            shipping_option: {
              name: method.name || "",
              price: method.amount,
              id: order.shipping_methods?.[0]?.data?.shipment_id,
            },
          })) || [],
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
    }

    const sessionId = await getSessionId(email, password)
    const publishableKey =
      cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) || PUBLISHABLE_API_KEY

    const labelRes = await fetch(`${BACKEND_URL}/store/sendscloud/label/${order.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
        Cookie: `connect.sid=${sessionId}`,
      },
      body: JSON.stringify(payload),
    })

    const labelData = await labelRes.json().catch(() => ({} as any))

    if (!labelRes.ok) {
      console.error("❌ SendCloud Error:", labelData.message)
      return null
    }

    return labelData
  } catch (err: any) {
    console.error("❌ Failed to send order to SendCloud:", err.message)
    return null
  }
}

export async function getTrackingLinkOrder(labelId: string) {
  try {
    const sessionId = await getSessionId(email, password)
    const publishableKey =
      cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) || PUBLISHABLE_API_KEY

    const labelRes = await fetch(
      `${BACKEND_URL}/store/sendscloud/trackinglink/${labelId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
          Cookie: `connect.sid=${sessionId}`,
        },
      }
    )

    const labelData = await labelRes.json().catch(() => ({} as any))
    if (!labelRes.ok) {
      console.error("❌ SendCloud Error:", labelData.message)
      return null
    }

    return labelData.trackingLink
  } catch (err: any) {
    console.error("❌ Failed to get SendCloud tracking link:", err.message)
    return null
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
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
    cache: "no-store",
  })
}

// -------------------- Payment method metadata helpers --------------------

export const updateCartPaymentMethod = async (
  cartId: string,
  paymentMethod: string
) => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.store.cart.update(
      cartId,
      {
        metadata: {
          selected_payment_method: paymentMethod,
        },
      },
      {},
      headers
    )

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    return response.cart
  } catch (error) {
    console.error("Error updating payment method:", error)
    throw error
  }
}

export const updateCartPaymentMethodFetch = async (
  cartId: string,
  paymentMethod: string
) => {
  const medusaUrl = getBackendUrl()
  const headers = await getStoreHeaders()

  const response = await fetch(`${medusaUrl}/store/carts/${cartId}`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      metadata: {
        selected_payment_method: paymentMethod,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({} as any))
    throw new Error(
      err?.message ||
        `Failed to update payment method: ${response.status} ${response.statusText}`
    )
  }

  return await response.json()
}
