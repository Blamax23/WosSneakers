import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { Lifetime } from "awilix"
import { CreateFulfillmentResult, FulfillmentDTO, FulfillmentItemDTO, FulfillmentOrderDTO, Logger } from "@medusajs/framework/types"
import SendcloudService from "../sendcloud/service"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  apiKey: string
}

type OrderItemWithVariant = {
  variant: any // ou ProductVariant si t’as le type
  detail?: any
}


class SendcloudProviderService extends AbstractFulfillmentProviderService {
  protected logger_: Logger
  protected options_: Options
  // assuming you're initializing a client
  protected client
  protected readonly sendcloudService_

  constructor(
    { logger }: InjectedDependencies,
    options: Options,
    sendcloudService: SendcloudService
  ) {
    super()

    this.logger_ = logger
    this.options_ = options

    console.log("Options : ", options)

    // Import et instanciation manuelle pour tester
    const SendcloudService = require("../sendcloud/service").default
    this.sendcloudService_ = new SendcloudService(
      { logger },
      options
    )
  }

  static identifier = "my-fulfillment"
  static lifeTime = Lifetime.SCOPED


  async getFulfillmentOptions(): Promise<any[]> {
    const methods = await this.sendcloudService_.getShippingMethods()

    return methods.shipping_methods
      .filter(method =>
        method.countries.some(c => c.iso_2 === 'FR') &&
        parseFloat(method.min_weight) > 1.99 &&
        parseFloat(method.max_weight) < 5.01 &&
        // Filtrer uniquement Chronopost ici
        (
          method.carrier !== 'chronopost' ||
          (
            method.carrier === 'chronopost' &&
            method.name.includes('Chrono 18') &&
            !method.name.toLowerCase().includes('relais')
          )
        )
      )
      .map(method => ({
        id: `sendcloud-${method.id}`,
        name: method.name,
        data: {
          service_point_required: method.service_point_input || false,
          carrier: method.carrier,
          sendcloud_method_id: method.id,
        },
      }))
  }


  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {

    console.log("Voici le data que je reçois", data)
    console.log("Voici les items que je reçois", items)
    console.log("Voici l'order que je reçois", order)
    console.log("Voici le fulfillment que je reçois", fulfillment)
    // Exemple d'appel à un service externe
    const { parcel, label } = await this.sendcloudService_.createLabelForOrder(order)

    console.log("Voici la parcel créé ", parcel)
    console.log("Voici le label créé ", label)

    return {
      data: {
        ...(fulfillment as object || {}),
        ...parcel
      },
      labels: []
      // Optionnel : labels si tu veux ajouter des étiquettes de suivi
      // labels: [...]
    };
  }



  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any
  ): Promise<any> {
    // assuming your client retrieves an ID from the
    // third-party service
    let shipment_id = optionData.data.sendcloud_method_id

    console.log("Shipment id", data)
    console.log("context", context)
    console.log("Option DAta", optionData)


    return {
      ...data,
      shipment_id,
      metadata: {
        shipment_id, // <- ici
      }
    }
  }

}

export default SendcloudProviderService
