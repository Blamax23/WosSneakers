import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const dotenv = require("dotenv");
dotenv.config();

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
      resolve: `./src/modules/sendcloud`,
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
          // default provider
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            // if module provider is in a plugin, use `plugin-name/providers/my-fulfillment`
            resolve: "./src/modules/sendcloud-provider",
            id: "my-fulfillment",
            options: {
              sendcloudApiKey: process.env.SENDCLOUD_PUBLIC_KEY,
              sendcloudApiSecret: process.env.SENDCLOUD_PRIVATE_KEY,
            },
          },
          // {
          //   resolve: "./src/modules/shipstation",
          //   id: "shipstation",
          //   options: {
          //     api_key: process.env.SHIPSTATION_API_KEY,
          //   },
          // },
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
              {
                template_id: "customer-created",
                type: "email",
                // les autres templates...
              },
              {
                template_id: "order-placed",
                type: "email",
              },
              {
                template_id: "order-completed",
                type: "email",
              },
            ],
          },
        ],
      },
    },
// {
//   resolve: "./src/modules/algolia",
//   options: {
//     appId: process.env.ALGOLIA_APP_ID!,
//     apiKey: process.env.ALGOLIA_API_KEY!,
//     productIndexName: process.env.ALGOLIA_PRODUCT_INDEX_NAME!,
//   },
// },

    {
      resolve: "./src/modules/documents",
      options: {}
    }
    // {
    //   resolve: '@hifive-dev/medusa-fulfillment-sendcloud',
    //   options: {
    //     api_key: process.env.SENDCLOUD_PUBLIC_KEY,
    //     api_secret: process.env.SENDCLOUD_PRIVATE_KEY,
    //     // Autres options si nécessaire
    //   },
    // },
  ],
})
