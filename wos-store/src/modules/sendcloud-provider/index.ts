import { Modules, ModuleProvider } from "@medusajs/framework/utils"
import SendcloudProviderService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [SendcloudProviderService],
})
