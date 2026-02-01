"use server"

import { cookies } from "next/headers"

export async function clearAuthToken() {
  const cookieStore = await cookies()
  cookieStore.delete("_medusa_jwt")
}
