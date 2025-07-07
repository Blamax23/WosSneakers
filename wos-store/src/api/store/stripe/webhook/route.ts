import { handleRequest } from "../handle-request";
import { POST as handleStripeWebhook } from "../handle-stripe-webhook";

export const POST = handleRequest(handleStripeWebhook);
