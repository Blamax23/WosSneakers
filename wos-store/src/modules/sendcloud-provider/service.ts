import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { Lifetime } from "awilix"
import { 
  CreateFulfillmentResult, 
  FulfillmentDTO, 
  FulfillmentItemDTO, 
  FulfillmentOrderDTO, 
  Logger 
} from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  sendcloudApiKey: string
  sendcloudApiSecret: string
}

class SendcloudProviderService extends AbstractFulfillmentProviderService {
  static identifier = "sendcloud"
  static PROVIDER = "sendcloud"
  static lifeTime = Lifetime.SCOPED

  protected logger_: Logger
  protected options_: Options
  protected sendcloudApiKey: string
  protected sendcloudApiSecret: string
  protected apiUrl = 'https://panel.sendcloud.sc/api/v2'

  constructor(
    { logger }: InjectedDependencies,
    options: Options
  ) {
    super()
    
    this.logger_ = logger
    this.options_ = options
    
    if (!options?.sendcloudApiKey || !options?.sendcloudApiSecret) {
      throw new Error(
        "sendcloudApiKey and sendcloudApiSecret are required in the provider options"
      )
    }
    
    this.sendcloudApiKey = options.sendcloudApiKey
    this.sendcloudApiSecret = options.sendcloudApiSecret
  }

  /**
   * Méthode utilitaire pour faire des appels API à Sendcloud
   */
  private async sendcloudRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.apiUrl}${endpoint}`
    const auth = Buffer.from(
      `${this.sendcloudApiKey}:${this.sendcloudApiSecret}`
    ).toString('base64')

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Sendcloud API error: ${response.status} - ${errorText}`)
    }

    return await response.json()
  }

  /**
   * Récupère les options d'expédition disponibles
   */
  async getFulfillmentOptions(): Promise<any[]> {
    try {
      const data = await this.sendcloudRequest('/shipping_methods')
      
      return data.shipping_methods  
  .filter(method => {
    const isFranceAvailable = method.countries.some(c => c.iso_2 === 'FR');
    
    const isWeightValid = (parseFloat(method.min_weight) >= 2.0 && parseFloat(method.max_weight) <= 5.0) ||
                          (parseFloat(method.min_weight) <= 2.0 && parseFloat(method.max_weight) >= 5.0);
    
    if (!isFranceAvailable || !isWeightValid) {
      return false;
    }
    
    const carrierLower = method.carrier.toLowerCase();
    const nameLower = method.name.toLowerCase();
    
    if (carrierLower === 'mondial_relay') {
      return nameLower.includes('relais') &&
             !nameLower.includes('qr');
    }
    
    if (carrierLower === 'ups') {
      return (nameLower.includes('standard') || nameLower.includes('express')) && !nameLower.includes('-') && !nameLower.includes('to') && !nameLower.includes('plus');
    }
    
    if (carrierLower === 'colissimo') {
      return !nameLower.includes('signature') && 
             !nameLower.includes('relais') &&
             !nameLower.includes('expert') &&
             !nameLower.includes('point');
    }
    
    if (carrierLower === 'chronopost') {
      return nameLower.includes('chrono 18') && !nameLower.includes('relais');
    }
    
    return false;
  })
  .map(method => ({
    id: `sendcloud-${method.id}`,
    name: method.name,
    data: {
      service_point_required: method.service_point_input || false,
      carrier: method.carrier,
      sendcloud_method_id: method.id,
      min_weight: method.min_weight,
      max_weight: method.max_weight,
    },
  }))
    } catch (error) {
      this.logger_.error("Error fetching Sendcloud shipping methods:", error)
      return []
    }
  }

  /**
   * Valide les données d'expédition avant la création
   */
  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any
  ): Promise<any> {
    const shipment_id = optionData?.data?.sendcloud_method_id
    
    if (!shipment_id) {
      throw new Error("sendcloud_method_id is required")
    }
    
    return {
      ...data,
      shipment_id,
      metadata: {
        shipment_id,
        carrier: optionData?.data?.carrier,
        service_point_required: optionData?.data?.service_point_required,
      }
    }
  }

  /**
   * Crée un fulfillment (envoi) et génère l'étiquette d'expédition
   */
  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    
    try {
      // Vérifier si c'est une livraison en point relais (depuis les metadata de la commande)
      const orderMetadata = (order as any)?.metadata || {}
      const sendcloudData = orderMetadata.sendcloud || {}
      const servicePointId = sendcloudData.to_service_point
      const servicePoint = sendcloudData.service_point
      const isPickupPoint = !!servicePointId

      const parcelData: any = {
        parcel: {
          name: order?.shipping_address?.first_name + ' ' + order?.shipping_address?.last_name,
          company_name: order?.shipping_address?.company || '',
          telephone: order?.shipping_address?.phone || '',
          email: order?.email || '',
          order_number: order?.display_id || order?.id,
          shipment: {
            id: data.shipment_id,
          },
          weight: this.calculateWeight(items),
          // Ajouter les items
          parcel_items: items.map(item => ({
            description: item.title || 'Product',
            quantity: item.quantity || 1,
            weight: '0.5', // À adapter selon vos besoins
            value: '0', // À adapter selon vos besoins
          })),
        }
      }

      // Si c'est un point relais, on utilise to_service_point
      if (isPickupPoint && servicePointId) {
        parcelData.parcel.to_service_point = parseInt(servicePointId, 10)
        // L'adresse du point relais est gérée automatiquement par Sendcloud
        // mais on peut ajouter l'adresse du service point si disponible
        if (servicePoint) {
          parcelData.parcel.address = servicePoint.street || ''
          parcelData.parcel.house_number = servicePoint.house_number || ''
          parcelData.parcel.postal_code = servicePoint.postal_code || ''
          parcelData.parcel.city = servicePoint.city || ''
          parcelData.parcel.country = servicePoint.country || order?.shipping_address?.country_code?.toUpperCase() || 'FR'
        } else {
          // Fallback sur l'adresse du client pour les notifications
          parcelData.parcel.address = order?.shipping_address?.address_1 || ''
          parcelData.parcel.postal_code = order?.shipping_address?.postal_code || ''
          parcelData.parcel.city = order?.shipping_address?.city || ''
          parcelData.parcel.country = order?.shipping_address?.country_code?.toUpperCase() || 'FR'
        }
      } else {
        // Livraison à domicile classique
        parcelData.parcel.address = order?.shipping_address?.address_1 || ''
        parcelData.parcel.address_2 = order?.shipping_address?.address_2 || ''
        parcelData.parcel.city = order?.shipping_address?.city || ''
        parcelData.parcel.postal_code = order?.shipping_address?.postal_code || ''
        parcelData.parcel.country = order?.shipping_address?.country_code?.toUpperCase() || 'FR'
      }

      // Créer le colis dans Sendcloud
      const response = await this.sendcloudRequest('/parcels', 'POST', parcelData)

      return {
        data: {
          ...(fulfillment as object || {}),
          sendcloud_parcel_id: response.parcel?.id,
          tracking_number: response.parcel?.tracking_number,
          tracking_url: response.parcel?.tracking_url,
          carrier: response.parcel?.carrier,
        },
        labels: response.parcel?.label ? [
          {
            tracking_number: response.parcel.tracking_number,
            tracking_url: response.parcel.tracking_url,
            label_url: response.parcel.label.label_printer,
          }
        ] : []
      }
    } catch (error) {
      this.logger_.error("Error creating Sendcloud fulfillment:", error)
      throw error
    }
  }

  /**
   * Annule un fulfillment
   */
  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    
    try {
      const parcelId = fulfillment.sendcloud_parcel_id
      
      if (!parcelId) {
        this.logger_.warn("No sendcloud_parcel_id found, skipping cancellation")
        return {}
      }

      // Annuler le colis dans Sendcloud
      await this.sendcloudRequest(`/parcels/${parcelId}/cancel`, 'POST')
      
      return {
        cancelled: true,
        sendcloud_parcel_id: parcelId,
      }
    } catch (error) {
      this.logger_.error("Error cancelling Sendcloud fulfillment:", error)
      // On ne throw pas l'erreur pour ne pas bloquer l'annulation côté Medusa
      return {
        cancelled: false,
        error: error.message,
      }
    }
  }

  /**
   * Crée un retour (return)
   */
  async createReturnFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    
    try {
      const originalParcelId = fulfillment.sendcloud_parcel_id
      
      if (!originalParcelId) {
        throw new Error("No original parcel ID found for return")
      }

      // Récupérer les détails du colis original
      const originalResponse = await this.sendcloudRequest(`/parcels/${originalParcelId}`)
      const originalParcel = originalResponse.parcel

      // Créer un nouveau colis retour (inverser expéditeur et destinataire)
      const returnParcelData = {
        parcel: {
          name: originalParcel.name,
          company_name: originalParcel.company_name || '',
          address: originalParcel.address,
          address_2: originalParcel.address_2 || '',
          city: originalParcel.city,
          postal_code: originalParcel.postal_code,
          country: originalParcel.country,
          telephone: originalParcel.telephone || '',
          email: originalParcel.email || '',
          order_number: `RET-${originalParcel.order_number}`,
          is_return: true,
          shipment: {
            id: originalParcel.shipment?.id,
          },
        }
      }

      const response = await this.sendcloudRequest('/parcels', 'POST', returnParcelData)

      return {
        sendcloud_parcel_id: response.parcel?.id,
        tracking_number: response.parcel?.tracking_number,
        tracking_url: response.parcel?.tracking_url,
        label_url: response.parcel?.label?.label_printer,
      }
    } catch (error) {
      this.logger_.error("Error creating Sendcloud return:", error)
      throw error
    }
  }

  /**
   * Méthode utilitaire pour calculer le poids total
   */
  private calculateWeight(items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[]): string {
    // Calculer le poids total en kg
    // À adapter selon comment vous stockez le poids de vos produits
    const totalWeight = items.reduce((total, item) => {
      const quantity = item.quantity || 1
      // Supposons un poids par défaut de 0.5kg par article
      const itemWeight = 0.5
      return total + (itemWeight * quantity)
    }, 0)
    
    return totalWeight.toFixed(2)
  }
}

export default SendcloudProviderService