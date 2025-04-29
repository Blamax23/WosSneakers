"use client"

import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"


type Props = {
  products: HttpTypes.StoreProduct[]
  region: any
}

const TrendingProducts = ({ products, region }: Props) => {
    if (!products.length) return null

    return (
        <section className="mb-12">
            <div className="content-container py-6 small:py-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-semibold text-3xl font-bold">Tendances</h2>
                </div>

                <ul className="grid grid-cols-4 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
                    {products.map((product) => (
                        <li key={product.id}>
                        <ProductPreview product={product} region={region} isFeatured />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default TrendingProducts
