import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import { Instagram, Facebook, Music2 } from "lucide-react"
import NewsletterForm from "./newsletter"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-20">
          {/* <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            >
              
            </LocalizedClientLink>
          </div> */}
          <div className="text-small-regular w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-x-16">
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Marques
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Réseaux sociaux</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://www.instagram.com/wossneakers?igsh=eTRveHFnaGwwbWow"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base flex items-center gap-x-2"
                  >
                    <Instagram size={16} /> Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.tiktok.com/@wossneakers?_r=1&_t=ZN-91WbDLd4ZXS"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base flex items-center gap-x-2"
                  >
                    <Music2 size={16} /> TikTok
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Informations légales</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="/infos/cgv"
                    className="hover:text-ui-fg-base"
                  >
                    CGV
                  </a>
                </li>
                <li>
                  <a
                    href="/infos/mentionslegales"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Mentions légales
                  </a>
                </li>
                <li>
                  <a
                    href="/infos/privacy"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="/infos/retours"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Politique de retour
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Newsletter</span>
              <Text className="txt-compact-small">
                Inscrivez-vous à notre newsletter pour recevoir les dernières
                nouvelles et offres exclusives.
              </Text>
              <NewsletterForm />
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} WOS Sneakers. Tous droits réservés.
          </Text>
        </div>
      </div>
    </footer>
  )
}
