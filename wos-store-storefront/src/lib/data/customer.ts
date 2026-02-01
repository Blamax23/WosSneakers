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
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"
import type { PasswordResetState } from "@modules/account/components/forgot-password"
import type { ResetPasswordState } from "@modules/account/components/reset-password-form"

export type ContactState = {
  success?: boolean
  error?: string
}


export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export const updateCustomerPassword = async (
  _currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const oldPassword = formData.get("old_password") as string
  const newPassword = formData.get("new_password") as string
  const confirmPassword = formData.get("confirm_password") as string

  // Validation côté client
  if (!oldPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      error: "Tous les champs sont requis",
    }
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Les nouveaux mots de passe ne correspondent pas",
    }
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      error: "Le nouveau mot de passe doit contenir au moins 8 caractères",
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const response = await sdk.client.fetch(`/store/custom/update-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: {
        old_password: oldPassword,
        new_password: newPassword,
      },
    }) as { message?: string } | null

    if (!response || response.message) {
      return {
        success: true,
        error: null,
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour du mot de passe",
    }
  }
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }


  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export async function updateCustomerEmail(
  _currentState: Record<string, unknown>,
  formData: FormData
) {
  const email = formData.get("email") as string

  if (!email) {
    return { success: false, error: "L'email est requis" }
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      ...(await getAuthHeaders()),
    }

    const response = await fetch("http://localhost:9000/store/custom/update-email", {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Erreur lors de la mise à jour")
    }

    revalidateTag("customer")

    return { success: true, error: null }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour de l'email",
    }
  }
}

export async function requestPasswordReset(
  _state: PasswordResetState,
  formData: FormData
) {
  const email = formData.get("email") as string

  if (!email) {
    return { success: false, error: "L'email est requis" }
  }

  sdk.auth.resetPassword("customer", "emailpass", {
    identifier: email,
  })

  return { success: true }
}

export async function resetPassword(
  _state: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const email = formData.get("email") as string
  const token = formData.get("token") as string
  const newPassword = formData.get("new_password") as string
  const confirmPassword = formData.get("confirm_password") as string

  if (!email || !token || !newPassword || !confirmPassword) {
    return { error: "Tous les champs sont requis" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" }
  }

  if (newPassword.length < 8) {
    return { error: "Mot de passe trop court" }
  }

  await sdk.auth.updateProvider("customer", "emailpass", {
      email,
      password: newPassword,
    }, token)
    .then(() => {
      
    })
    .catch((error) => {
      console.error("❌ Erreur mise à jour mot de passe:", error)
      throw error
    })

  return { success: true }
}

export async function deleteAccount() {
  
  try {
    const authHeaders = await getAuthHeaders()
    
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
    }

    const res = await fetch("http://localhost:9000/account/self-delete", {
      method: "POST",
      headers,
    })
    if (!res.ok) {
      const errorText = await res.text()
      console.error("❌ Erreur response:", errorText)
      throw new Error(`Delete failed: ${errorText}`)
    }

    const data = await res.json()
  
    await removeAuthToken()
    await removeCartId()
    
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return data
  } catch (error: any) {
    console.error("❌ Erreur lors de la suppression:", error)
    throw error
  }
}

export const sendContactMessage = async (
  _state: ContactState,
  formData: FormData
): Promise<ContactState> => {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  try {
    const headers = {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      ...(await getAuthHeaders()),
    }
    const res = await fetch("http://localhost:9000/store/contact", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ name, email, message }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Erreur lors de l'envoi du message")
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de l'envoi du message" }
  }
}

