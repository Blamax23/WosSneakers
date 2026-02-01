import { MedusaService } from "@medusajs/utils"
import axios, { AxiosError } from "axios"
import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"

type ConstructorArgs = { /* you can inject other services here later */ }
type ModuleOptions = {
  sendcloudApiKey: string
  sendcloudApiSecret: string
}

interface Parcel {
  id: number
  tracking_number?: string
  [key: string]: any
}

interface Label {
  id: string
  tracking_url?: string
  [key: string]: any
}

interface TrackingInfo {
  parcel_id: string
  carrier_code: string
  tracking_number: string
  carrier_tracking_url: string
  statuses: TrackingStatus[]
  [key: string]: any
}

interface TrackingStatus {
  parent_status: string
  carrier_message: string
  carrier_update_timestamp: string
  [key: string]: any
}

interface PickupPoint {
  id: number
  name: string
  street: string
  house_number: string
  postal_code: string
  city: string
  country: string
  distance?: number
  formatted_opening_times?: string
  carrier?: string
  [key: string]: any
}

interface PickupPointsParams {
  postal_code: string
  country: string
  carrier?: string
  limit?: number
}

class SendcloudService {
  protected readonly apiKey_: string
  protected readonly apiSecret_: string
  protected readonly baseUrl_: string

  static identifier = "sendcloud-service"

  constructor(_: ConstructorArgs, options: ModuleOptions) {

    if (!options.sendcloudApiKey || !options.sendcloudApiSecret) {
      throw new Error("SendCloud API credentials are required")
    }

    this.apiKey_ = process.env.SENDCLOUD_PUBLIC_KEY || options.sendcloudApiKey
    this.apiSecret_ = process.env.SENDCLOUD_PRIVATE_KEY || options.sendcloudApiSecret
    this.baseUrl_ = "https://panel.sendcloud.sc/api/v2"
  }

  private async makeRequest(config: {
    method: 'get' | 'post'
    url: string
    data?: any
  }) {
    try {
      const response = await axios({
        method: config.method,
        url: `${this.baseUrl_}${config.url}`,
        data: config.data,
        auth: {
          username: this.apiKey_,
          password: this.apiSecret_
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      console.error("SendCloud API Error:", {
        url: config.url,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      })
      const errorMessage =
        (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data
          ? (axiosError.response.data as { message?: string }).message
          : undefined) || axiosError.message
      throw new Error(
        `Une erreur est survenue.`
      )
    }
  }

  /**
   * Récupère les points relais disponibles
   * Note: L'API Service Points utilise une URL différente de l'API principale
   */
  async getPickupPoints(params: PickupPointsParams): Promise<PickupPoint[]> {

    const queryParams = new URLSearchParams({
      country: params.country,
      ...(params.carrier && { carrier: params.carrier }),
    })

    // L'API Service Points de Sendcloud utilise une URL différente
    const servicePointsUrl = `https://servicepoints.sendcloud.sc/api/v2/service-points/?${queryParams.toString()}&address=${encodeURIComponent(params.postal_code)}`

    try {
      const response = await axios({
        method: 'get',
        url: servicePointsUrl,
        auth: {
          username: this.apiKey_,
          password: this.apiSecret_
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      const points = response.data || []
      
      // Limiter les résultats si demandé
      if (params.limit && points.length > params.limit) {
        return points.slice(0, params.limit)
      }
      
      return points
    } catch (error) {
      const axiosError = error as AxiosError
      console.error("SendCloud Service Points API Error:", {
        url: servicePointsUrl,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      })
      throw new Error(
        `Vérifiez d'avoir rentré un code postal valide et que des points relais sont disponibles dans cette zone.`
      )
    }
  }

  async createParcel(order: any): Promise<Parcel> {
    const sendcloudMetadata = order.metadata?.sendcloud
    
    const servicePointId = sendcloudMetadata?.to_service_point
    const servicePoint = sendcloudMetadata?.service_point
    const isPickupPoint = !!servicePointId

    const countryCode = order.shipping_address.country_code?.toUpperCase() || 'FR'
    if (!countryCode || countryCode.length !== 2) {
      throw new Error(`Invalid country code: ${order.shipping_address.country_code}`)
    }

    // Calculer le poids total - utiliser le poids du variant si disponible, sinon un poids par défaut
    // Le poids doit être en kg pour Sendcloud (minimum 0.001 kg = 1g)
    const DEFAULT_ITEM_WEIGHT_KG = 0.5 // 500g par défaut si pas de poids défini
    const totalWeightKg = order.items?.reduce((sum: number, item: any) => {
      const itemWeight = item.variant?.weight 
        ? item.variant.weight / 1000 // Convertir de grammes en kg
        : DEFAULT_ITEM_WEIGHT_KG
      const quantity = item.detail?.quantity || item.quantity || 1
      return sum + (itemWeight * quantity)
    }, 0) || DEFAULT_ITEM_WEIGHT_KG

    const payload: any = {
      parcel: {
        name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        email: order.email,
        phone: order.shipping_address.phone || '',
        weight: totalWeightKg.toFixed(3), // Sendcloud attend le poids en kg avec 3 décimales
        order_number: order.id,
        shipment: {
          id: order.shipping_methods[0].data.shipment_id
        },
        parcel_items: order.items?.map((item: any) => ({
          description: item.title,
          quantity: item.detail?.quantity || item.quantity || 1,
          weight: (item.variant?.weight || DEFAULT_ITEM_WEIGHT_KG * 1000).toString(), // Sendcloud parcel_items attend le poids en grammes
          value: item.unit_price,
          hs_code: item.variant?.product?.hs_code || item.variant?.hs_code || '',
          origin_country: (order.shipping_address?.country_code || 'fr').toUpperCase(),
          sku: item.variant?.sku || ''
        }))
      }
    }

    // Si c'est un point relais, utiliser l'adresse du point relais
    if (isPickupPoint) {
      // L'ID du point relais pour Sendcloud
      payload.parcel.to_service_point = parseInt(servicePointId, 10)
      payload.parcel.name = `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
      payload.parcel.company_name = order.shipping_address.company || ''
      
      // Utiliser les infos du service_point sauvegardé ou l'adresse du client
      if (servicePoint) {
        payload.parcel.address = servicePoint.street || ''
        payload.parcel.house_number = servicePoint.house_number || ''
        payload.parcel.postal_code = servicePoint.postal_code || ''
        payload.parcel.city = servicePoint.city || ''
        payload.parcel.country = servicePoint.country || countryCode
      } else {
        // Fallback sur l'adresse du client
        payload.parcel.address = order.shipping_address.address_1 || ''
        payload.parcel.postal_code = order.shipping_address.postal_code || ''
        payload.parcel.city = order.shipping_address.city || ''
        payload.parcel.country = countryCode
      }
    } else {
      // Livraison à domicile classique
      payload.parcel.address = order.shipping_address.address_1
      payload.parcel.house_number = order.shipping_address.house_number || ''
      payload.parcel.postal_code = order.shipping_address.postal_code
      payload.parcel.city = order.shipping_address.city
      payload.parcel.country = countryCode
      payload.parcel.company_name = order.shipping_address.company || ''
      payload.parcel.address_2 = order.shipping_address.address_2 || ''
    }

    const data = await this.makeRequest({
      method: 'post',
      url: '/parcels',
      data: payload
    })
    return data.parcel
  }

  async createLabel(parcelId: number): Promise<Label> {
    const payload = {
      label: {
        parcels: [parcelId]
      }
    }

    const data = await this.makeRequest({
      method: 'post',
      url: '/labels',
      data: payload
    })
    return data.label
  }

  async createLabelForOrder(order: any): Promise<{ parcel: Parcel; label: Label }> {
    const parcel = await this.createParcel(order)
    const label = await this.createLabel(parcel.id)
    return { parcel, label }
  }

  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    if (!trackingNumber) {
      throw new Error("Tracking number is required")
    }

    const data = await this.makeRequest({
      method: 'get',
      url: `/tracking/${encodeURIComponent(trackingNumber)}`
    })

    return data
  }

  async getTrackingLink(labelId: string): Promise<string> {
    const data = await this.makeRequest({
      method: 'get',
      url: `/tracking/${labelId}`
    })

    return data.tracking_url || ''
  }

  async getParcelStatuses(): Promise<any> {
    const data = await this.makeRequest({
      method: 'get',
      url: '/parcels/statuses'
    })

    return data
  }

  async getShippingMethods(): Promise<any> {
    return await this.makeRequest({
      method: 'get',
      url: '/shipping_methods'
    })
  }
}

export default SendcloudService