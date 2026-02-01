"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import SendcloudPickup from "./SendcloudPickup"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

/**
 * Mapping des délais de livraison par transporteur (en jours)
 * À personnaliser selon vos contrats avec les transporteurs
 */
const CARRIER_DELIVERY_TIMES: Record<string, { min: number; max: number }> = {
  colissimo: { min: 2, max: 5 },
  chronopost: { min: 1, max: 2 },
  ups_standard: { min: 3, max: 5 },
  ups_express: { min: 1, max: 2 },
  ups: { min: 2, max: 5 }, // fallback pour UPS
  mondial_relay: { min: 3, max: 5 },
  dhl: { min: 2, max: 4 },
  dpd: { min: 2, max: 4 },
  gls: { min: 2, max: 4 },
  postnl: { min: 2, max: 5 },
  bpost: { min: 2, max: 4 },
}

/**
 * Détermine la clé du transporteur en fonction du nom et du carrier
 */
function getCarrierKey(optionName: string, carrier: string): string {
  const nameLower = optionName.toLowerCase()
  const carrierLower = carrier?.toLowerCase() || ''
  
  // Détection UPS Express vs Standard
  if (carrierLower === 'ups') {
    if (nameLower.includes('express') || nameLower.includes('worldwide express')) {
      return 'ups_express'
    }
    if (nameLower.includes('standard')) {
      return 'ups_standard'
    }
  }
  
  // Détection Chronopost (express) vs Colissimo (standard)
  if (carrierLower === 'colissimo' || carrierLower === 'chronopost') {
    if (nameLower.includes('express') || nameLower.includes('chrono')) {
      return 'chronopost'
    }
  }
  
  return carrierLower
}

/**
 * Formate le délai de livraison en jours
 * @param option - L'option de livraison avec les données Sendcloud
 * @returns Le texte formaté du délai ou null
 */
function formatDeliveryTime(option: HttpTypes.StoreCartShippingOption): string | null {
  const data = option.data as any
  const nestedData = data?.data // Les données Sendcloud sont dans data.data
  
  // Vérifier les différentes propriétés possibles pour le délai
  const leadTimeHours = data?.lead_time_hours || nestedData?.lead_time_hours
  const deliveryDays = data?.delivery_days || nestedData?.delivery_days
  const minDays = data?.min_delivery_days || nestedData?.min_delivery_days
  const maxDays = data?.max_delivery_days || nestedData?.max_delivery_days
  
  if (deliveryDays) {
    return `${deliveryDays} jour${deliveryDays > 1 ? 's' : ''}`
  }
  
  if (minDays && maxDays) {
    if (minDays === maxDays) {
      return `${minDays} jour${minDays > 1 ? 's' : ''}`
    }
    return `${minDays}-${maxDays} jours`
  }
  
  if (leadTimeHours) {
    const days = Math.ceil(leadTimeHours / 24)
    return `${days} jour${days > 1 ? 's' : ''}`
  }
  
  // Fallback: utiliser le mapping par transporteur avec détection express/standard
  const carrier = nestedData?.carrier
  const optionName = option.name || data?.name || ''
  
  if (carrier) {
    const carrierKey = getCarrierKey(optionName, carrier)
    if (CARRIER_DELIVERY_TIMES[carrierKey]) {
      const { min, max } = CARRIER_DELIVERY_TIMES[carrierKey]
      if (min === max) {
        return `${min} jour${min > 1 ? 's' : ''}`
      }
      return `${min}-${max} jours`
    }
  }
  
  return null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )
  const [servicePointSelected, setServicePointSelected] = useState<boolean>(
    !!(cart as any)?.metadata?.sendcloud?.to_service_point
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  // Vérifie si la méthode de livraison sélectionnée nécessite un point relais
  const selectedShippingMethod = availableShippingMethods?.find(
    (sm) => sm.id === shippingMethodId
  )
  const isServicePointRequired = !!(selectedShippingMethod as any)?.data?.service_point_required ||
    selectedShippingMethod?.name?.toLowerCase().includes('relais') ||
    selectedShippingMethod?.name?.toLowerCase().includes('mondial')

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      }
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = async () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)
    // Reset service point selection when changing shipping method
    setServicePointSelected(false)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    const selectedOption = availableShippingMethods?.find(
      (method) => method.id === currentId
    )


    let success = false

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .then(() => {
        success = true
      })
      .catch((err) => {
        setShippingMethodId(currentId)

        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })

    // Ensure server components receive the updated cart quickly
    if (success) {
      router.refresh()
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Livraison
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <Button
                onClick={handleEdit}
                variant="secondary"
                data-testid="edit-delivery-button"
              >
                Modifier
              </Button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <>
          <div className="grid">
            <div className="flex flex-col">
              <span className="font-medium txt-medium text-ui-fg-base">
                Mode de livraison
              </span>
              <span className="mb-4 text-ui-fg-muted txt-medium">
                Comment voulez-vous que nous vous livrions votre commande ?
              </span>
            </div>
            <div data-testid="delivery-options-container">
              <div className="pb-8 md:pt-0 pt-2">
                <RadioGroup
                  value={shippingMethodId}
                  onChange={(v) => handleSetShippingMethod(v, "shipping")}
                >
                  {_shippingMethods?.map((option) => {
                    const isDisabled =
                      option.price_type === "calculated" &&
                      !isLoadingPrices &&
                      typeof calculatedPricesMap[option.id] !== "number"
                    
                    const deliveryTime = formatDeliveryTime(option)

                    return (
                      <Radio
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        disabled={isDisabled}
                        className={clx(
                          "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                          {
                            "border-ui-border-interactive":
                              option.id === shippingMethodId,
                            "hover:shadow-brders-none cursor-not-allowed":
                              isDisabled,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                          <MedusaRadio
                            checked={option.id === shippingMethodId}
                          />
                          <div className="flex flex-col">
                            <span className="text-base-regular">
                              {option.name}
                            </span>
                            {deliveryTime && (
                              <span className="text-sm text-ui-fg-subtle">
                                Livraison estimée : {deliveryTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="justify-self-end text-ui-fg-base">
                          {option.price_type === "flat" ? (
                            convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })
                          ) : calculatedPricesMap[option.id] ? (
                            convertToLocale({
                              amount: calculatedPricesMap[option.id],
                              currency_code: cart?.currency_code,
                            })
                          ) : isLoadingPrices ? (
                            <Loader />
                          ) : (
                            "-"
                          )}
                        </span>
                      </Radio>
                    )
                  })}
                </RadioGroup>

                {/* Affiche le sélecteur de point relais si la méthode sélectionnée le requiert */}
                {isServicePointRequired && shippingMethodId && (
                  <SendcloudPickup
                    cartId={cart.id}
                    current={(cart as any)?.metadata?.sendcloud}
                    shippingAddress={cart.shipping_address}
                    onPointSelected={() => setServicePointSelected(true)}
                  />
                )}
              </div>
            </div>
          </div>

          {hasPickupOptions && (
            <div className="grid">
              <div className="flex flex-col">
                <span className="font-medium txt-medium text-ui-fg-base">
                  Click & Collect
                </span>
                <span className="mb-4 text-ui-fg-muted txt-medium">
                  Choisissez de récupérer votre commande en main propre
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pb-8 md:pt-0 pt-2">
                  <RadioGroup
                    value={shippingMethodId}
                    onChange={(v) => handleSetShippingMethod(v, "pickup")}
                  >
                    {_pickupMethods?.map((option) => {
                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          disabled={option.insufficient_inventory}
                          data-testid="delivery-option-radio"
                          className={clx(
                            "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                            {
                              "border-ui-border-interactive":
                                option.id === shippingMethodId,
                              "hover:shadow-brders-none cursor-not-allowed":
                                option.insufficient_inventory,
                            }
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <MedusaRadio
                              checked={option.id === shippingMethodId}
                            />
                            <div className="flex flex-col">
                              <span className="text-base-regular">
                                {option.name}
                              </span>
                              <span className="text-base-regular text-ui-fg-muted">
                                {formatAddress(
                                  option.service_zone?.fulfillment_set?.location
                                    ?.address
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="justify-self-end text-ui-fg-base">
                            {convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="large"
              className="mt"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                !shippingMethodId || 
                isLoading || 
                (isServicePointRequired && !servicePointSelected)
              }
              data-testid="submit-delivery-option-button"
            >
              Continuer vers le paiement
            </Button>
            
            {isServicePointRequired && !servicePointSelected && (
              <p className="text-rose-500 text-sm mt-2">
                Veuillez sélectionner un point relais avant de continuer.
              </p>
            )}
          </div>
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Mode de livraison
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {cart.shipping_methods?.at(-1)?.name}{" "}
                  {convertToLocale({
                    amount: cart.shipping_methods.at(-1)?.amount!,
                    currency_code: cart?.currency_code,
                  })}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
