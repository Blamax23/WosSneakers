"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrder = async (id: string) => {
  const headers = await getAuthHeaders()

  // Si pas d'authentification, retourner null
  if (!headers || !headers.authorization) {
    return null
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => {
      if (err?.status === 401 || err?.statusText === "Unauthorized") {
        return null
      }
      return medusaError(err)
    })
}

export const retrieveOrderMetadata = async (id: string) => {
  const headers = await getAuthHeaders()

  // Si pas d'authentification, retourner null
  if (!headers || !headers.authorization) {
    return null
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "metadata",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => {
      if (err?.status === 401 || err?.statusText === "Unauthorized") {
        return null
      }
      return medusaError(err)
    })
}

// export const updateOrder = async (order : HttpTypes.StoreOrder) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   const next = {
//     ...(await getCacheOptions("orders")),
//   }




// }

export const updateOrderTracking = async (cartId: string, paymentMethod: string) => {
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

export const listReturnReasons = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  // const loginRes = await sdk.auth.login("user", "emailpass", {
  //   email: "auth@auth.com",
  //   password: "secret",
  // })

  // const token = loginRes.access_token

  // const headers = {
  //   Authorization: `Bearer ${token}`,
  // }

  let return_reasons = []

  fetch(`${process.env.MEDUSA_BACKEND_URL}/store/return-reasons`)
    .then(res => res.json())
    .then(data => {
      return_reasons = data.return_reasons
    });

  return sdk.admin.returnReason.list({}, headers)
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = await getAuthHeaders()

  // Si pas d'authentification, retourner un tableau vide
  if (!headers || !headers.authorization) {
    return []
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => {
      // Si 401, retourner un tableau vide au lieu de throw
      if (err?.status === 401 || err?.statusText === "Unauthorized") {
        console.error("Unauthorized access to orders, returning empty array")
        return []
      }
      return medusaError(err)
    })
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Le numéro de commande est obligatoire", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
