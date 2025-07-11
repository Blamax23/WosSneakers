"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

function fetchWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam === 1) ? 0 : (_pageParam - 1) * limit;

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
    const result = await fetchWithTimeout(
      sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
        `/store/products`,
        {
          method: "GET",
          query: {
            limit,
            offset,
            region_id: region?.id,
            fields:
              "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
            ...queryParams,
          },
          headers,
          next,
          cache: "force-cache",
        }
      ),
      8000 // 8 seconds timeout
    );
    const { products, count } = result;
    const nextPage = count > offset + limit ? pageParam + 1 : null;
    return {
      response: {
        products,
        count,
      },
      nextPage: nextPage,
      queryParams,
    };
  } catch (error) {
    console.error("listProducts error:", error);
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    };
  }
}

export const listTrendingProducts = async (region: StoreRegion) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  console.log("Voici la region : ", region.id)

  // Utiliser le SDK pour récupérer les produits
  try {
    const result = await fetchWithTimeout(
      sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
        `/store/products`,
        {
          method: "GET",
          query: {
            fields: "*variants,*variants.prices,*metadata,*calculated_price",
            region_id: region.id
          },
          headers,
          next,
          cache: "force-cache",
        }
      ),
      8000
    );

    console.log("Produits à la fraiche, fraichement récupérés : ", result.products)
    const trendingProducts = result.products.filter(
      (product) => product.metadata?.Tendance === true
    );
    return trendingProducts;
  } catch (error) {
    console.error("listTrendingProducts error:", error);
    return [];
  }
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  price
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  price?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  let [priceMin, priceMax] = price?.split("-").map(Number) || [null, null]

  if (Number.isNaN(priceMin)) priceMin = null
  if (Number.isNaN(priceMax)) priceMax = null


  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const filteredProducts = products.filter(product => {
    // calcule le prix minimum variant
    const minVariantPrice = Math.min(
      ...(product.variants?.map(v => v.calculated_price?.original_amount ?? Infinity) ?? [])
    )

    console.log(Math.min(
      ...(product.variants?.map(v => v.calculated_price?.original_amount ?? Infinity) ?? [])
    ))

    return (
      (priceMin === null || minVariantPrice >= priceMin) &&
      (priceMax === null || minVariantPrice <= priceMax)
    )
  })

  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
