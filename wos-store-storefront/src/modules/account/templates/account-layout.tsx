import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div
      className="min-h-[95vh] flex flex-col small:py-12"
      data-testid="account-page"
    >
      <div className="content-container flex flex-col flex-1 max-w-5xl mx-auto bg-white">
        {/* Contenu principal */}
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-12 flex-1">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div>{children}</div>
        </div>

        {/* Footer */}
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">Vous avez des questions ?</h3>
            <span className="txt-medium">
              Vous pouvez retrouver facilement les réponses à vos questions dans notre
              <a className="font-semibold" href="/faq"> FAQ</a> ou nous contacter directement
              <a className="font-semibold" href="/contact"> ici</a>.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
