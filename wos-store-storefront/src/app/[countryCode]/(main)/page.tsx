import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import Atouts from "@modules/home/components/hero/atouts"
import SocialMedia from "@modules/home/components/hero/socialmedia"
import { listTrendingProducts } from "@lib/data/products"
import TrendingProducts from "@modules/home/components/trending-products"
import { sdk } from "@lib/config"
import exp from "constants"


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

  let { collections_full } = await listCollections({
    fields: "id, handle, title",
  })

  const full = sdk.store.collection.list({
    fields: "id,title,handle,metadata"
  }).then(({ collections }) => {
    collections_full = collections
  })

  let trendingProducts = null
  if (region!) {
    trendingProducts = await listTrendingProducts(region)
  }

  if (!collections_full || !region) {
    return null
  }



  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          {trendingProducts && (
            <TrendingProducts products={trendingProducts} region={region} />
          )}

          <FeaturedProducts collections={collections_full} region={region} />
        </ul>
        <Atouts></Atouts>
      </div>
    </>
  )
}
