import { 
    Text, 
    Column, 
    Container, 
    Heading, 
    Html, 
    Img, 
    Row, 
    Section, 
    Tailwind, 
    Head, 
    Preview, 
    Body, 
    Link, 
  } from "@react-email/components"
  import { BigNumberValue, CustomerDTO, OrderDTO } from "@medusajs/framework/types"
  
  type OrderPlacedEmailProps = {
    order: OrderDTO & {
      customer: CustomerDTO
    }
    email_banner?: {
      body: string
      title: string
      url: string
    }
  }

function OrderCompletedEmailComponent({ order, email_banner }: OrderPlacedEmailProps) {
  const shouldDisplayBanner = email_banner && "title" in email_banner

  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: order.currency_code,
  })

  const formatPrice = (price: BigNumberValue) => {
    if (typeof price === "number") return formatter.format(price)
    if (typeof price === "string") return formatter.format(parseFloat(price))
    return price?.toString() || ""
  }

  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Ta commande est bien arrivée chez toi !</Preview>
        <Body className="bg-white my-10 mx-auto w-full max-w-2xl">

          <Container className="p-6">
            <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center mb-4">
                <img
                    src="https://i.ibb.co/qMLmLrrw/logo-Wos-Black.png"
                    alt="logo-Wos-Black"
                    className="w-24" // tu ajustes comme tu veux
                />
            </a>
            <Heading className="text-2xl font-bold text-center text-gray-800">
              Ta commande est arrivée, {order.customer?.first_name || order.shipping_address?.first_name} 👟
            </Heading>
            <Text className="text-center text-gray-600 mt-2">
              On espère que tout est nickel ! Si t’as un souci, n'hésite pas à nous contacter.
            </Text>
          </Container>

          {shouldDisplayBanner && (
            <Container
              className="mb-4 rounded-lg p-7"
              style={{
                background: "linear-gradient(to right, #10b981, #059669)",
              }}
            >
              <Section>
                <Row>
                  <Column align="left">
                    <Heading className="text-white text-xl font-semibold">
                      {email_banner.title}
                    </Heading>
                    <Text className="text-white mt-2">{email_banner.body}</Text>
                  </Column>
                  <Column align="right">
                    <Link href={email_banner.url} className="font-semibold px-2 text-white underline">
                      Je découvre
                    </Link>
                  </Column>
                </Row>
              </Section>
            </Container>
          )}

          <Container className="px-6">
            <Heading className="text-xl font-semibold text-gray-800 mb-4">
              Ce que tu as reçu
            </Heading>
            {order.items?.map((item) => (
              <Section key={item.id} className="border-b border-gray-200 py-4">
                <Row>
                  <Column className="w-1/3">
                    <Img
                      src={item.thumbnail ?? ""}
                      alt={item.product_title ?? ""}
                      className="rounded-lg"
                      width="100%"
                    />
                  </Column>
                  <Column className="w-2/3 pl-4">
                    <Text className="text-lg font-semibold text-gray-800">
                      {item.product_title}
                    </Text>
                    <Text className="text-gray-600">{item.variant_title}</Text>
                    <Text className="text-gray-800 mt-2 font-bold">
                      {formatPrice(item.total)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}
          </Container>

          <Section className="bg-gray-50 p-6 mt-10">
            <Text className="text-center text-gray-500 text-sm">
              Une question ? Réponds à ce mail ou écris-nous à blamaxsolutions@gmail.com
            </Text>
            <Text className="text-center text-gray-500 text-sm">
              Id Commande: {order.id}
            </Text>
            <Text className="text-center text-gray-400 text-xs mt-4">
              © {new Date().getFullYear()} WOS, Inc. Tous droits réservés.
            </Text>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  )
}

export const orderCompletedEmail = (props: OrderPlacedEmailProps) => (
    <OrderCompletedEmailComponent {...props} />
)

const mockOrder = {
    "order": {
        "id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
        "display_id": 1,
        "email": "afsaf@gmail.com",
        "currency_code": "eur",
        "total": 20,
        "subtotal": 20,
        "discount_total": 0,
        "shipping_total": 10,
        "tax_total": 0,
        "item_subtotal": 10,
        "item_total": 10,
        "item_tax_total": 0,
        "customer_id": "cus_01JSNXD6VQC1YH56E4TGC81NWX",
        "items": [
        {
            "id": "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
            "title": "L",
            "subtitle": "Medusa Sweatshirt",
            "thumbnail": "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            "variant_id": "variant_01JSNXAQCZ5X81A3NRSVFJ3ZHQ",
            "product_id": "prod_01JSNXAQBQ6MFV5VHKN420NXQW",
            "product_title": "Medusa Sweatshirt",
            "product_description": "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
            "product_subtitle": null,
            "product_type": null,
            "product_type_id": null,
            "product_collection": null,
            "product_handle": "sweatshirt",
            "variant_sku": "SWEATSHIRT-L",
            "variant_barcode": null,
            "variant_title": "L",
            "variant_option_values": null,
            "requires_shipping": true,
            "is_giftcard": false,
            "is_discountable": true,
            "is_tax_inclusive": false,
            "is_custom_price": false,
            "metadata": {},
            "raw_compare_at_unit_price": null,
            "raw_unit_price": {
                "value": "10",
                "precision": 20,
            },
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "tax_lines": [],
            "adjustments": [],
            "compare_at_unit_price": null,
            "unit_price": 10,
            "quantity": 1,
            "raw_quantity": {
                "value": "1",
                "precision": 20,
            },
            "detail": {
                "id": "orditem_01JSNXDH9DK1XMESEZPADYFWKY",
                "version": 1,
                "metadata": null,
                "order_id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
                "raw_unit_price": null,
                "raw_compare_at_unit_price": null,
                "raw_quantity": {
                "value": "1",
                "precision": 20,
                },
                "raw_fulfilled_quantity": {
                "value": "0",
                "precision": 20,
                },
                "raw_delivered_quantity": {
                "value": "0",
                "precision": 20,
                },
                "raw_shipped_quantity": {
                "value": "0",
                "precision": 20,
                },
                "raw_return_requested_quantity": {
                "value": "0",
                "precision": 20,
                },
                "raw_return_received_quantity": {
                "value": "0",
                "precision": 20,
                },
                "raw_return_dismissed_quantity": {
                "value": "0",
                "precision": 20,
                },
                "raw_written_off_quantity": {
                "value": "0",
                "precision": 20,
                },
                "created_at": new Date(),
                "updated_at": new Date(),
                "deleted_at": null,
                "item_id": "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
                "unit_price": null,
                "compare_at_unit_price": null,
                "quantity": 1,
                "fulfilled_quantity": 0,
                "delivered_quantity": 0,
                "shipped_quantity": 0,
                "return_requested_quantity": 0,
                "return_received_quantity": 0,
                "return_dismissed_quantity": 0,
                "written_off_quantity": 0,
            },
            "subtotal": 10,
            "total": 10,
            "original_total": 10,
            "discount_total": 0,
            "discount_subtotal": 0,
            "discount_tax_total": 0,
            "tax_total": 0,
            "original_tax_total": 0,
            "refundable_total_per_unit": 10,
            "refundable_total": 10,
            "fulfilled_total": 0,
            "shipped_total": 0,
            "return_requested_total": 0,
            "return_received_total": 0,
            "return_dismissed_total": 0,
            "write_off_total": 0,
            "raw_subtotal": {
                "value": "10",
                "precision": 20,
            },
            "raw_total": {
                "value": "10",
                "precision": 20,
            },
            "raw_original_total": {
                "value": "10",
                "precision": 20,
            },
            "raw_discount_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_discount_subtotal": {
                "value": "0",
                "precision": 20,
            },
            "raw_discount_tax_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_tax_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_original_tax_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_refundable_total_per_unit": {
                "value": "10",
                "precision": 20,
            },
            "raw_refundable_total": {
                "value": "10",
                "precision": 20,
            },
            "raw_fulfilled_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_shipped_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_return_requested_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_return_received_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_return_dismissed_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_write_off_total": {
                "value": "0",
                "precision": 20,
            },
        },
    ],
    "shipping_address": {
        "id": "caaddr_01JSNXD6W0TGPH2JQD18K97B25",
        "customer_id": null,
        "company": "",
        "first_name": "Maxime",
        "last_name": "Bailly",
        "address_1": "257 Rue des Blés d'Or",
        "address_2": "",
        "city": "Saint Denis lès Bourg",
        "country_code": "fr",
        "province": "",
        "postal_code": "01000",
        "phone": "",
        "metadata": null,
        "created_at": "2025-04-25T07:25:48.801Z",
        "updated_at": "2025-04-25T07:25:48.801Z",
        "deleted_at": null,
    },
    "billing_address": {
        "id": "caaddr_01JSNXD6W0V7RNZH63CPG26K5W",
        "customer_id": null,
        "company": "",
        "first_name": "safasf",
        "last_name": "asfaf",
        "address_1": "asfasf",
        "address_2": "",
        "city": "asfasf",
        "country_code": "dk",
        "province": "",
        "postal_code": "asfasf",
        "phone": "",
        "metadata": null,
        "created_at": "2025-04-25T07:25:48.801Z",
        "updated_at": "2025-04-25T07:25:48.801Z",
        "deleted_at": null,
    },
    "shipping_methods": [
        {
            "id": "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
            "name": "Standard Shipping",
            "description": null,
            "is_tax_inclusive": false,
            "is_custom_amount": false,
            "shipping_option_id": "so_01JSNXAQA64APG6BNHGCMCTN6V",
            "data": {},
            "metadata": null,
            "raw_amount": {
                "value": "10",
                "precision": 20,
            },
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "tax_lines": [],
            "adjustments": [],
            "amount": 10,
            "order_id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
            "detail": {
                "id": "ordspmv_01JSNXDH9B5RAF4FH3M1HH3TEA",
                "version": 1,
                "order_id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
                "return_id": null,
                "exchange_id": null,
                "claim_id": null,
                "created_at": new Date(),
                "updated_at": new Date(),
                "deleted_at": null,
                "shipping_method_id": "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
            },
            "subtotal": 10,
            "total": 10,
            "original_total": 10,
            "discount_total": 0,
            "discount_subtotal": 0,
            "discount_tax_total": 0,
            "tax_total": 0,
            "original_tax_total": 0,
            "raw_subtotal": {
                "value": "10",
                "precision": 20,
            },
            "raw_total": {
                "value": "10",
                "precision": 20,
            },
            "raw_original_total": {
                "value": "10",
                "precision": 20,
            },
            "raw_discount_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_discount_subtotal": {
                "value": "0",
                "precision": 20,
            },
            "raw_discount_tax_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_tax_total": {
                "value": "0",
                "precision": 20,
            },
            "raw_original_tax_total": {
                "value": "0",
                "precision": 20,
            },
        },
        ],
        "customer": {
            "id": "cus_01JSNXD6VQC1YH56E4TGC81NWX",
            "company_name": null,
            "first_name": null,
            "last_name": null,
            "email": "afsaf@gmail.com",
            "phone": null,
            "has_account": false,
            "metadata": null,
            "created_by": null,
            "created_at": "2025-04-25T07:25:48.791Z",
            "updated_at": "2025-04-25T07:25:48.791Z",
            "deleted_at": null,
        },
    },
}
  // @ts-ignore
export default () => <OrderCompletedEmailComponent {...mockOrder} />
