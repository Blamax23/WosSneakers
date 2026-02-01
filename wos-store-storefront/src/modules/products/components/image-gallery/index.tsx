"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const activeImage = images[activeIndex]

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="flex flex-col items-center relative">
      <div className="flex-1 w-full small:mx-16">
        <Container
          className="relative aspect-[16/9] w-full overflow-hidden bg-ui-bg-subtle"
          id={activeImage.id}
        >
          {!!activeImage.url && (
            <Image
              src={activeImage.url}
              priority
              className="absolute inset-0 rounded-rounded"
              alt={`Image produit ${activeIndex + 1}`}
              fill
              sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
              style={{
                objectFit: "cover",
              }}
            />
          )}
        </Container>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex items-center justify-between w-full small:mx-16 gap-x-4">
          <button
            type="button"
            onClick={handlePrev}
            className="text-xs uppercase tracking-wide underline underline-offset-4 disabled:opacity-50"
            disabled={images.length <= 1}
          >
            Précédente
          </button>

          <div className="flex items-center gap-x-2">
            {images.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-2 rounded-full ${
                  index === activeIndex ? "bg-ui-fg-base" : "bg-ui-border-base"
                }`}
                aria-label={`Voir l'image ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="text-xs uppercase tracking-wide underline underline-offset-4 disabled:opacity-50"
            disabled={images.length <= 1}
          >
            Suivante
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
