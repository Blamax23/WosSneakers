import { handleRequest } from "../handle-request";
import { POST as handleStripeWebhook } from "../handle-stripe-webhook";

// @ts-ignore - Type compatibility between webhook handler and handleRequest
export const POST = handleRequest(handleStripeWebhook);
