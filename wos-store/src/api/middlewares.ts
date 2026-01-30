import { 
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
  type MedusaRequest,
  type MedusaResponse,
  type MedusaNextFunction,
} from "@medusajs/framework/http"
import { SearchSchema } from "./store/products/search/route"
import jwt from "jsonwebtoken"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom/update-password",
      method: ["POST"],
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const authHeader = req.headers.authorization
          
          if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.substring(7)
            
            try {
              const decoded = jwt.decode(token)
              const secret = process.env.JWT_SECRET || "supersecret"
              const verified = jwt.verify(token, secret)
            } catch (error: any) {
              console.error("❌ Erreur vérification token:", error.message)
            }
          }
          
          next()
        },
        
        authenticate("customer", ["bearer", "session"]),
        
        (req: any, res: any, next: any) => {
          next()
        },
      ],
    },
    {
      matcher: "/store/custom/update-email",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },
    {
      matcher: "/store/products/search",
      method: ["POST"],
      middlewares: [
        (req, res, next) => {
          next()
        },
        validateAndTransformBody(SearchSchema),
      ],
    },
    {
      matcher: "/account/self-delete",
      method: ["POST"],
      middlewares: [
        // AUCUN middleware - on gère tout manuellement dans la route
      ],
    },
  ],
})