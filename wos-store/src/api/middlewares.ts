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

// Simple rate limiter en mémoire
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(options: { windowMs: number; max: number }) {
  return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || 
               req.socket?.remoteAddress || 
               "unknown"
    const key = `${ip}:${req.path}`
    const now = Date.now()
    
    let record = rateLimitMap.get(key)
    
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + options.windowMs }
      rateLimitMap.set(key, record)
    } else {
      record.count++
    }
    
    // Nettoyer les anciennes entrées périodiquement
    if (rateLimitMap.size > 10000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetTime) rateLimitMap.delete(k)
      }
    }
    
    if (record.count > options.max) {
      res.status(429).json({ 
        error: "Trop de requêtes. Veuillez réessayer plus tard.",
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      })
      return
    }
    
    next()
  }
}

export default defineMiddlewares({
  routes: [
    // Rate limiting global sur les routes d'authentification
    {
      matcher: "/auth/*",
      method: ["POST"],
      middlewares: [
        rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 tentatives par 15 min
      ],
    },
    {
      matcher: "/store/custom/update-password",
      method: ["POST"],
      middlewares: [
        rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 tentatives par heure
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
        rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 tentatives par heure
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
    {
      // Route publique pour récupérer les points relais Sendcloud
      matcher: "/store/sendcloud/service-points",
      method: ["GET"],
      additionalDataValidator: undefined,
      middlewares: [],
    },
  ],
})