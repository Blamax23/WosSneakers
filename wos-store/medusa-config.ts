import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://127.0.0.1:8000",
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    disable: false,
    vite: () => {
      return {
        server: {
          allowedHosts: [".ngrok-free.app"],
        },
      }
    },
  },
  modules: [
    {
      resolve: "./src/modules/sendcloud",
      options: {
        sendcloudApiKey: process.env.SENDCLOUD_PUBLIC_KEY,
        sendcloudApiSecret: process.env.SENDCLOUD_PRIVATE_KEY,
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/sendcloud-provider",
            id: "sendcloud_two",
            options: {
              sendcloudApiKey: process.env.SENDCLOUD_PUBLIC_KEY,
              sendcloudApiSecret: process.env.SENDCLOUD_PRIVATE_KEY,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
            templates: [
              { template_id: "customer-created", type: "email" },
              { template_id: "order-placed", type: "email" },
              { template_id: "order-completed", type: "email" },
              { template_id: "password-reset", type: "email" },
              { template_id: "customer-deleted", type: "email" }
            ],
          },
        ],
      },
    },
    {
      resolve: "./src/modules/documents",
      options: {},
    },
    {
      resolve: "./src/modules/algolia",
      options: {
        appId: process.env.ALGOLIA_APP_ID!,
        apiKey: process.env.ALGOLIA_API_KEY!,
        productIndexName: process.env.ALGOLIA_PRODUCT_INDEX_NAME!,
      },
    },
  ],
})