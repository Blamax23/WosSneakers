WosSneakers Patch — Sendcloud Service Points, Stripe Webhook, Order Emails
=========================================================================

What I changed
--------------
1) **Service point capture in checkout (storefront)**:
   - New API route: `wos-store-storefront/src/app/api/sendcloud/service-point/route.ts`
     -> Stores the selected service point in the cart's `metadata.sendcloud` (fields: `to_service_point`, `to_post_number`, `service_point`, `shipment_id?`).
   - New UI component: `wos-store-storefront/src/modules/checkout/components/shipping/SendcloudPickup.tsx`
     -> Adds a small panel in the shipping step to either open the Sendcloud picker (optional feature flag) or enter the Service Point ID manually, then persists it.
   - Injected `<SendcloudPickup />` into the shipping step (pickup block).

   Optional flags for the widget:
   - `NEXT_PUBLIC_SENDCLOUD_SPP_ENABLED=true`
   - `NEXT_PUBLIC_SENDCLOUD_SPP_SRC` (optional) — custom script URL for the picker

2) **Sendcloud parcel creation (backend)**:
   - New workflow step: `wos-store/src/workflows/steps/create-sendcloud-parcel.ts`
     -> Invoked in `send-order-confirmation` workflow (on `order.placed`) before sending emails.
   - Enhanced `wos-store/src/modules/sendcloud/service.ts`:
     -> Adds `email`, `to_service_point`, `to_post_number`, `shipment` (id), and optional `contract` (id) to the `parcel` payload.
     -> Cleans `undefined` payload fields before request.

3) **Stripe webhook hardening**:
   - `wos-store/src/api/store/stripe/handle-stripe-webhook.ts` now:
     -> Verifies signatures when `STRIPE_WEBHOOK_SECRET` and `req.rawBody` are available.
     -> Falls back to non-verified body in dev only (avoid in production; ensure raw body is enabled).

4) **Email behavior**:
   - In `send-order-confirmation.ts`, if `SENDCLOUD_EMAILS_ENABLED=true`, the workflow skips internal transactional emails (Resend) assuming Sendcloud tracking emails are enabled in your Sendcloud panel.

Environment variables (example .env)
------------------------------------
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Medusa
DATABASE_URL=postgresql://user:pass@localhost:5432/medusa
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:7001

# Sendcloud API keys (server-side — DO NOT prefix with NEXT_PUBLIC)
SENDCLOUD_PUBLIC_KEY=live_xxx
SENDCLOUD_PRIVATE_KEY=live_xxx
# Optional: choose a specific carrier contract
SENDCLOUD_CONTRACT_ID=12345
# If you want Sendcloud to handle shipment emails (and skip Resend emails):
SENDCLOUD_EMAILS_ENABLED=false

# Storefront (optional feature flag to try the picker)
NEXT_PUBLIC_SENDCLOUD_SPP_ENABLED=false
# Optionally override the script URL for the picker demo
NEXT_PUBLIC_SENDCLOUD_SPP_SRC=https://sendcloud.github.io/spp-integration-example/spp.js

How to test locally
-------------------
1) **Checkout / Pickup + Service Point**
   - Start backend (`wos-store`): `yarn dev` (ensure env vars).
   - Start storefront (`wos-store-storefront`): `yarn dev`.
   - Go to Checkout → choose pickup delivery → open the panel “Livraison en point relais”.
     - Either open the picker (if flagged) or enter a known `service_point_id` manually.
     - Click “Enregistrer”. This persists the data into `cart.metadata.sendcloud`.

2) **Place order and create Sendcloud parcel**
   - Complete the order.
   - The `order.placed` subscriber triggers the workflow, which calls `sendcloudService.createParcel(order)`.
   - Verify in logs and your Sendcloud panel.
   - If `SENDCLOUD_EMAILS_ENABLED=true` and tracking emails are enabled in Sendcloud, customers will receive Sendcloud-branded emails.

3) **Stripe webhooks**
   - Use `stripe listen --forward-to http://localhost:9000/store/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET` accordingly.
   - Make sure raw body is available for the route; otherwise the handler logs a warning and treats payload as unverified (dev-only).

Notes
-----
- If Maxime adds **new Sendcloud contracts**, set `SENDCLOUD_CONTRACT_ID` or pass a `sendcloud.contract_id` in order/cart metadata to target the right contract per parcel.
- If Maxime creates **new customer accounts**, the existing `customer-created` subscriber will add them to your Resend audience automatically. You can optionally extend it to Brevo if needed.
- Enabling Service Points must be done in your Sendcloud panel under **Settings → Integrations → API → Edit → Enable Service Points** and choose carriers. See docs.
