import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex gap-x-1 items-center group bg-black text-white rounded-md px-3 py-2 hover:bg-gray-900 transition-colors"
      href={href}
      onClick={onClick}
      {...props}
    >
      <Text className="text-white">{children}</Text>
      <ArrowUpRightMini
        className="group-hover:rotate-45 ease-in-out duration-150"
        color="white"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
