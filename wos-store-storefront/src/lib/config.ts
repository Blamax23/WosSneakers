import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"
import { getLocaleHeader } from "@lib/util/get-locale-header"
import { 
  liteClient as algoliasearch, 
  LiteClient as SearchClient,
} from "algoliasearch/lite"

// Defaults to standard port for Medusa server
let NEXT_PUBLIC_MEDUSA_BACKEND_URL = "http://localhost:9000"

const cleanEnv = (v?: string) =>
  (v || "").trim().replace(/^['\"]|['\"]$/g, "")

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  NEXT_PUBLIC_MEDUSA_BACKEND_URL = cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
}

export const sdk = new Medusa({
  baseUrl: NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: cleanEnv(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY),
})

// Override fetch to include locale header
const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}

export const searchClient: SearchClient = {
  ...(algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "", 
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || ""
  )),
  search: async (params) => {
    const request = Array.isArray(params) ? params[0] : params
    const query = "params" in request ? request.params?.query : 
      "query" in request ? request.query : ""

    if (!query) {
      return {
        results: [
          {
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            hitsPerPage: 0,
            processingTimeMS: 0,
            query: "",
            params: "",
          },
        ],
      }
    }

    return await sdk.client.fetch(`/store/products/search`, {
      method: "POST",
      body: {
        query,
      },
    })
  },
}