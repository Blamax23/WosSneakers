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

    console.log("Voici le product que j'affiche : ", products)


    return (
        <section className="mb-12">
            <div className="content-container py-6 small:py-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-semibold text-3xl font-bold">Tendances</h2>
                </div>

                <ul className="grid grid-cols-4 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
                    {products.map((product) => {
                        console.log("VOici le produit à chaque fois : ", product)
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

                        console.log("Voici le cheapest Variant : ", cheapestVariant)

                        if (cheapestVariant.variant) {
                            // cheapestVariant.variant est celui avec le prix le plus bas
                            console.log("Variant avec le prix minimum", cheapestVariant.variant)
                        }

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
