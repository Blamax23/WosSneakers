import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const dotenv = require("dotenv");
dotenv.config();

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
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
    {
      resolve: "./src/modules/algolia",
      options: {
        appId: process.env.ALGOLIA_APP_ID!,
        apiKey: process.env.ALGOLIA_API_KEY!,
        productIndexName: process.env.ALGOLIA_PRODUCT_INDEX_NAME!,
      },
    },
    // {
    //   resolve: '@hifive-dev/medusa-fulfillment-sendcloud',
    //   options: {
    //     api_key: process.env.SENDCLOUD_PUBLIC_KEY,
    //     api_secret: process.env.SENDCLOUD_PRIVATE_KEY,
    //     // Autres options si nécessaire
    //   },
    // },
  ],

  // plugins: [
  //   {
  //     resolve: `medusa-fulfillment-mondialrelay`,
  //     options: {
  //       apiBaseUrl: process.env.MONDIAL_RELAY_API_BASE_URL,
  //       culture: process.env.MONDIAL_RELAY_CULTURE,
  //       login: process.env.MONDIAL_RELAY_LOGIN,
  //       password: process.env.MONDIAL_RELAY_PASSWORD,
  //       customerId: process.env.MONDIAL_RELAY_CUSTOMER_ID
  //     },
  //   },
  // ],
  // modules: [
  //   {
  //     resolve: "@medusajs/medusa/notification",
  //     options: {
  //       providers: [
  //         {
  //           resolve: "./src/modules/mailgun-notification", // chemin vers votre module
  //           id: "mailgun",
  //           options: {
  //             channels: ["email"],
  //             apiKey: "48fdcd808ad7df651e370bd89b8b2ec8-67bd41c2-70b21982",
  //             domain: "sandboxea103a0c2f944bb3a10367dd9e2a8f8a.mailgun.org",
  //             // autres options nécessaires
  //           },
  //         },
  //       ],
  //     },
  //   },
  // ],

})
