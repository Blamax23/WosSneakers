import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import Atouts from "@modules/home/components/hero/atouts"
import { listTrendingProducts } from "@lib/data/products"
import TrendingProducts from "@modules/home/components/trending-products"

export const metadata: Metadata = {
  title: "WOS Sneakers",
  description:
    "Page d'accueil du site e-commerce de WOS Sneakers.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title, metadata",
  })

  const trendingProducts = await listTrendingProducts()

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <TrendingProducts products={trendingProducts} region={region} />
          <FeaturedProducts collections={collections} region={region} />
        </ul>
        <Atouts></Atouts>
      </div>
    </>
  )
}
