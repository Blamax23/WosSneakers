"use client"

import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"


type Props = {
    products: HttpTypes.StoreProduct[]
    region: any
}

type VariantWithPrices = HttpTypes.StoreProductVariant & {
    prices: { amount: number }[]
}

const TrendingProducts = ({ products, region }: Props) => {
    if (!products.length) return null


    return (
        <section className="mb-12">
            <div className="content-container py-6 small:py-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-semibold text-3xl font-bold">Tendances</h2>
                </div>

                <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-12 sm:gap-y-16 lg:gap-y-24">
                    {products.map((product) => {
                        const cheapestVariant = (product.variants ?? [])
                            .map(v => v as VariantWithPrices & { calculated_price?: { calculated_amount: number } })
                            .reduce<{ variant: VariantWithPrices | null; minAmount: number }>(
                                (acc, variant) => {
                                    const price = variant.calculated_price?.calculated_amount ?? Infinity
                                    if (price < acc.minAmount) {
                                        return { variant, minAmount: price }
                                    }
                                    return acc
                                },
                                { variant: null, minAmount: Infinity }
                            )

                        return (
                            <li key={product.id}>
                                <ProductPreview product={{ ...product, cheapestVariant }} region={region} isFeatured />
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}

export default TrendingProducts
