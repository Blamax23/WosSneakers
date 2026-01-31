import { 
    defineMiddlewares,
    validateAndTransformBody, 
} from "@medusajs/framework/http"
import { SearchSchema } from "./store/products/search/route"

console.log("🔥 middleware.ts chargé")

export default defineMiddlewares({
    routes: [
        {
            matcher: "/store\/products\/search",
            method: ["POST"],
            middlewares: [
                (req, res, next) => {
                    console.log("middleware OK")
                    next()
                },
                validateAndTransformBody(SearchSchema),
            ],
        },
    ],
})