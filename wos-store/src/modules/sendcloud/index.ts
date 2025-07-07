import { Module } from "@medusajs/framework/utils"
import SendcloudService from "./service"

export const SENDCLOUD_MODULE = "sendcloudService"

export default Module(SENDCLOUD_MODULE, {
  service: SendcloudService,
})