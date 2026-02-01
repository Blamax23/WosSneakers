/*
 * Copyright 2024 RSC-Labs, https://rsoftcon.com/
 *
 * MIT License
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { generateHr } from "./hr";
import { t } from "i18next";
import { OrderDTO, OrderLineItemDTO } from "@medusajs/framework/types";
import { getDecimalDigits } from "../../../../../utils/currency";
import { BigNumber } from "@medusajs/framework/utils";

/**
 * Extrait une valeur numérique de différents formats possibles:
 * - BigNumber avec .numeric
 * - Objet avec .value (format raw)
 * - Nombre direct
 */
function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (typeof value?.numeric === 'number') return value.numeric;
  if (typeof value?.value !== 'undefined') return parseFloat(value.value) || 0;
  return 0;
}

function amountToDisplay(amount: number, currencyCode: string): string {
  const decimalDigits = getDecimalDigits(currencyCode);
  return `${(amount / Math.pow(10, decimalDigits)).toFixed(
    decimalDigits
  )} ${currencyCode.toUpperCase()}`;
}

function amountToDisplayNormalized(
  amount: number,
  currencyCode: string
): string {
  const decimalDigits = getDecimalDigits(currencyCode);
  return `${parseFloat(amount.toString()).toFixed(
    decimalDigits
  )} ${currencyCode.toUpperCase()}`;
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc.fontSize(10);

  const pageHeight = doc.page.height - 80;
  const descriptionHeight = doc.heightOfString(description, { width: 180 });
  const itemHeight = doc.heightOfString(item, { width: 90 });
  const maxHeight = Math.max(descriptionHeight, itemHeight);
  const height = Math.max(maxHeight, 30);
  let _y = y;
  let nextY = y + height;

  if (nextY > pageHeight) {
    doc.addPage();
    _y = 50;
    nextY = _y + height;
  }

  doc
    .text(item, 50, _y, { width: 90 })
    .text(description, 150, _y, { width: 180 })
    .text(unitCost, 280, _y, { width: 90, align: "right" })
    .text(quantity, 370, _y, { width: 90, align: "right" })
    .text(lineTotal, 0, _y, { align: "right" });

  return nextY;
}

export function generateInvoiceTable(
  doc,
  y,
  order: OrderDTO,
  items: OrderLineItemDTO[]
) {
  let i;
  const invoiceTableTop = y + 35;
  const pageHeight = doc.page.height - 50;

  doc.font("Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Produit",
    "Description",
    "Prix Unitaire",
    "Quantité",
    "Prix Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Regular");

  let initial_total_amount = 0
  let currentY = invoiceTableTop + 30;
  for (i = 0; i < items.length; i++) {
    if (currentY > pageHeight) {
      doc.addPage();
      currentY = 50;
    }

    const item = items[i];
    // Utilise toNumber pour gérer tous les formats possibles (BigNumber, raw, number)
    const unitPrice = toNumber(item.raw_unit_price);
    currentY = generateTableRow(
      doc,
      currentY,
      item.title,
      item.subtitle,
      amountToDisplayNormalized(unitPrice, order.currency_code),
      item.quantity,
      amountToDisplayNormalized(unitPrice * item.quantity, order.currency_code)
    );

    initial_total_amount += unitPrice * item.quantity;

    currentY += 5;

    if (currentY > pageHeight) {
      doc.addPage();
      currentY = 50;
    }

    generateHr(doc, currentY);
    currentY += 5;
    if (currentY > pageHeight) {
      doc.addPage();
      currentY = 50;
    }
  }

  currentY += 20;
  if (currentY > pageHeight) {
    doc.addPage();
    currentY = 50;
  }

  const shippingSubtotal = toNumber(order.shipping_subtotal);
  
  // Utilise discount_total de l'order directement (valeur fiable de Medusa)
  const discountTotal = toNumber(order.discount_total);
  
  // Affiche la réduction seulement s'il y en a une réelle
  if (discountTotal > 0.01) {
    let code = order.items?.[0]?.adjustments?.[0]?.code || "Réduction";
    generateTableRow(
      doc,
      currentY,
      "",
      "",
      "Réduction :",
      code,
      "- " + amountToDisplayNormalized(discountTotal, order.currency_code)
    );
    currentY += 30;
  }

  currentY += 30;
  if (currentY > pageHeight) {
    doc.addPage();
    currentY = 50;
  }
  generateTableRow(
    doc,
    currentY,
    "",
    "",
    "Prix Livraison :",
    "",
    amountToDisplayNormalized(
      shippingSubtotal,
      order.currency_code
    )
  );

  currentY += 30;
  if (currentY > pageHeight) {
    doc.addPage();
    currentY = 50;
  }
  generateTableRow(
    doc,
    currentY,
    "",
    "",
    "Taxes : ",
    "",
    amountToDisplayNormalized(
      toNumber(order.tax_total),
      order.currency_code
    )
  );

  currentY += 45;
  if (currentY > pageHeight) {
    doc.addPage();
    currentY = 50;
  }
  doc.font("Bold");
  generateTableRow(
    doc,
    currentY,
    "",
    "",
    "Prix TTC : ",
    "",
    amountToDisplayNormalized(
      toNumber(order.total),
      order.currency_code
    )
  );
  doc.font("Bold");
}
