import { createStep } from "@medusajs/framework/workflows-sdk"

export const createSendcloudParcelStep = createStep(
  "create-sendcloud-parcel",
  async (order: any, { container }) => {
    const sendcloudService = container.resolve("sendcloudService") as {
      createParcel: (order: any) => Promise<any>
    }

    try {
      const parcel = await sendcloudService.createParcel(order)
      return parcel
    } catch (e) {
      console.error("Failed to create Sendcloud parcel:", e)
      return null
    }
  }
)
