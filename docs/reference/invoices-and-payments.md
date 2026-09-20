# Invoices & Payments

Invoices record what you are charging a customer for a sale order; authorize an invoice to post the amount owed. Payments record money received against the order, reducing the balance due.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

3 endpoints.

### POST /v1/sale_orders/{id}/invoices

**Create Invoice**

Creates a draft invoice for a sale order, the first step in billing the customer. The invoice
starts as a draft so you can review it; authorize it with the invoice authorization endpoint
once it's ready to count toward payment and reporting.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes |  |

**Request body** `SalesCreateInvoice`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `sale_order_id` | integer (int32) |  | Sale order identifier. For public API calls this is taken from the route. |
| `line_items` | SalesInvoiceItemRequest[] |  | Sale order line items to include on the invoice. Omit this list to invoice all remaining line items. |
| `custom_items` | SalesInvoiceCustomItemRequest[] |  | Custom items to include on the invoice. Omit this list to invoice all remaining custom items. |

**Response** `200` `SaleOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique sales order ID. |
| `number` | string |  | Sales order number. |
| `created_time` | string (date-time) |  | Order creation date. (ISO 8601 format) |
| `updated_at` | string (date-time) |  | Last update date (ISO 8601 format). |
| `shipped_date` | string (date-time) |  | Shipping date (ISO 8601 format). |
| `due_date` | string (date-time) |  | Payment due date (ISO 8601 format). |
| `line_items` | SaleOrderLineItem[] |  | Represents products included in the sales order. |
| `custom_lines` | SaleOrderCustomLine[] |  | Non-product line items added to the order, such as fees, shipping charges, or adjustments. |
| `status` | string |  | Current status of the order. |
| `sale_agent` | SaleAgentBase |  | The sales agent who created or owns this order. |
| `external_id` | string |  | External reference from another system |
| `integration` | SalesIntegrationBase |  | The external integration that synced this order. |
| `is_archived` | boolean |  | Indicates whether the order has been archived. |
| `is_deleted` | boolean |  | Indicates whether the order has been soft-deleted. |
| `is_locked` | boolean |  | Indicates whether the order is locked for edits because it is still syncing with the sale channel it came from. Unlocking it stops changes from being synced back. |
| `notes` | string |  | Public-facing notes visible to the customer. |
| `private_notes` | string |  | Internal notes visible only to staff. |
| `shipping_address` | Address |  | The address associated with the action. |
| `billing_address` | Address |  | The address associated with the action. |
| `origin_location` | SalesLocationBase |  |  |
| `invoices` | SalesInvoice[] |  | Represents invoice information linked to the order. |
| `shipments` | SalesShipment[] |  | Represents shipment information linked to the order. |
| `refunds` | SalesRefund[] |  | Represents refund information linked to the order. |
| `returns` | SalesReturn[] |  | Represents return information linked to the order. |
| `customer` | SalesContactBase |  | Represents customer information. |
| `custom_fields` | CustomField[] |  | A list of custom fields attached to this order. |
| `is_tax_inclusive` | boolean |  | Indicates whether the listed prices already include tax. |
| `currency` | string |  | The currency code used for the order. |
| `exchange_rate` | number (double) |  | The exchange rate applied to convert the order currency to the base currency. |
| `tags` | string |  | Comma-separated labels used to categorize or filter orders. |
| `picking_status` | string |  | Reflects the warehouse picking progress for the order. |
| `packing_status` | string |  | Reflects the warehouse packing progress for the order. |
| `shipping_status` | string |  | Reflects the shipping progress for the order. |
| `total_tax` | number (double) |  | The total tax amount applied to the order. |
| `total` | number (double) |  | The total monetary value of the order including tax. |
| `total_refund` | number (double) |  | The total amount refunded for the order. |
| `payment_status` | string |  | Current state of a payment in a transaction or order process. |
| `reference_id` | string |  | A secondary reference identifier, often used for cross-system linking. |
| `stock_status` | enum(`AwaitingStock`, `ReadyToShip`, `Fulfilled`, `PartiallyReceived`, `Received`, `NotApplicable`, `OnHold`) |  | Current availability of a product in inventory. |
| `invoicing_status` | enum(`Draft`, `Partial`, `Completed`) |  | Tracks the invoicing stage of the order. |
| `refund_status` | enum(`Draft`, `Partial`, `Completed`) |  | Current state of a refund in its lifecycle. |
| `source_name` | string |  | The name of the channel or source that generated the order. |
| `attachments` | OrderAttachment[] |  | A list of files attached to the order (e.g. PDFs, images). |
| `reference` | string |  | A free-text reference note attached to the order. |
| `cogs` | number (double) |  | The order's cost of goods sold, in the order currency. Returned only when the request expands `cogs`. |
| `allocations` | SalesOrderAllocation[] |  | A list of inventory allocations reserved to fulfill this order. |
| `deposits` | SalesPaymentDeposite[] |  | A list of upfront or partial payments made before invoicing. |
| `price_list` | SalesPriceListBase |  | The price list assigned to this order. |
| `sources` | SalesRelatedOrder[] |  | A list of orders or documents that preceded and generated this order (e.g. a Quote that became this Sale Order). |
| `targets` | SalesRelatedOrder[] |  | A list of orders or documents that were created from this order (e.g. a Purchase Order triggered by this sale). |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/invoices' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/invoices/{invoice_id}/authorize

**Authorize Invoice**

Authorizes a draft invoice, moving it from `Draft` to `Authorized` so it becomes a
finalized invoice that counts toward payment and reporting. Run this after reviewing the draft
invoice created for the order.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes |  |
| `invoice_id` | path | integer (int32) | yes |  |

**Response** `200` `SalesAuthorizedInvoice`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Invoice identifier. |
| `number` | string |  | Invoice number shown to customers and used in accounting workflows. |
| `order_id` | integer (int32) |  | Sale order identifier for the order this invoice belongs to. |
| `created_time` | string (date-time) |  | Date and time when the invoice was created. |
| `due_date` | string (date-time) |  | Date when payment is due for this invoice. |
| `last_updated_time` | string (date-time) |  | Date and time when the invoice was last updated. |
| `invoice_items` | SalesAuthorizedInvoiceItem[] |  | Line items from the order included in this invoice. |
| `custom_items` | SalesAuthorizedInvoiceCustomItem[] |  | Custom order items included in this invoice. |
| `status` | string |  | Invoice status after the authorization operation. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/invoices/{invoice_id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/payments

**Create Payment**

Records a payment received against a sale order, keeping the order's paid and outstanding
balances current as your customer settles up. The amount is given in the presentment currency
(the currency shown to the customer), along with the exchange rate used to convert it to your
base currency.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to record the payment against. |

**Request body** `SalesCreatePayment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reference` | string |  | External reference identifier for the payment. |
| `amount_in_presentment_currency` | number (double) |  | The payment amount in the currency presented to the customer. |
| `presentment_currency` | string |  | The currency code used for the payment. |
| `currency_rate` | number (double) |  | The exchange rate applied at the time of the payment. |
| `gateway` | string |  | The payment gateway used to process the payment |
| `payment_date` | string (date-time) |  | The date and time when the payment was made. |
| `sale_channel_reference_id` | string |  | The reference identifier from the sales channel associated with the payment. |

**Response** `200` `SaleOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique sales order ID. |
| `number` | string |  | Sales order number. |
| `created_time` | string (date-time) |  | Order creation date. (ISO 8601 format) |
| `updated_at` | string (date-time) |  | Last update date (ISO 8601 format). |
| `shipped_date` | string (date-time) |  | Shipping date (ISO 8601 format). |
| `due_date` | string (date-time) |  | Payment due date (ISO 8601 format). |
| `line_items` | SaleOrderLineItem[] |  | Represents products included in the sales order. |
| `custom_lines` | SaleOrderCustomLine[] |  | Non-product line items added to the order, such as fees, shipping charges, or adjustments. |
| `status` | string |  | Current status of the order. |
| `sale_agent` | SaleAgentBase |  | The sales agent who created or owns this order. |
| `external_id` | string |  | External reference from another system |
| `integration` | SalesIntegrationBase |  | The external integration that synced this order. |
| `is_archived` | boolean |  | Indicates whether the order has been archived. |
| `is_deleted` | boolean |  | Indicates whether the order has been soft-deleted. |
| `is_locked` | boolean |  | Indicates whether the order is locked for edits because it is still syncing with the sale channel it came from. Unlocking it stops changes from being synced back. |
| `notes` | string |  | Public-facing notes visible to the customer. |
| `private_notes` | string |  | Internal notes visible only to staff. |
| `shipping_address` | Address |  | The address associated with the action. |
| `billing_address` | Address |  | The address associated with the action. |
| `origin_location` | SalesLocationBase |  |  |
| `invoices` | SalesInvoice[] |  | Represents invoice information linked to the order. |
| `shipments` | SalesShipment[] |  | Represents shipment information linked to the order. |
| `refunds` | SalesRefund[] |  | Represents refund information linked to the order. |
| `returns` | SalesReturn[] |  | Represents return information linked to the order. |
| `customer` | SalesContactBase |  | Represents customer information. |
| `custom_fields` | CustomField[] |  | A list of custom fields attached to this order. |
| `is_tax_inclusive` | boolean |  | Indicates whether the listed prices already include tax. |
| `currency` | string |  | The currency code used for the order. |
| `exchange_rate` | number (double) |  | The exchange rate applied to convert the order currency to the base currency. |
| `tags` | string |  | Comma-separated labels used to categorize or filter orders. |
| `picking_status` | string |  | Reflects the warehouse picking progress for the order. |
| `packing_status` | string |  | Reflects the warehouse packing progress for the order. |
| `shipping_status` | string |  | Reflects the shipping progress for the order. |
| `total_tax` | number (double) |  | The total tax amount applied to the order. |
| `total` | number (double) |  | The total monetary value of the order including tax. |
| `total_refund` | number (double) |  | The total amount refunded for the order. |
| `payment_status` | string |  | Current state of a payment in a transaction or order process. |
| `reference_id` | string |  | A secondary reference identifier, often used for cross-system linking. |
| `stock_status` | enum(`AwaitingStock`, `ReadyToShip`, `Fulfilled`, `PartiallyReceived`, `Received`, `NotApplicable`, `OnHold`) |  | Current availability of a product in inventory. |
| `invoicing_status` | enum(`Draft`, `Partial`, `Completed`) |  | Tracks the invoicing stage of the order. |
| `refund_status` | enum(`Draft`, `Partial`, `Completed`) |  | Current state of a refund in its lifecycle. |
| `source_name` | string |  | The name of the channel or source that generated the order. |
| `attachments` | OrderAttachment[] |  | A list of files attached to the order (e.g. PDFs, images). |
| `reference` | string |  | A free-text reference note attached to the order. |
| `cogs` | number (double) |  | The order's cost of goods sold, in the order currency. Returned only when the request expands `cogs`. |
| `allocations` | SalesOrderAllocation[] |  | A list of inventory allocations reserved to fulfill this order. |
| `deposits` | SalesPaymentDeposite[] |  | A list of upfront or partial payments made before invoicing. |
| `price_list` | SalesPriceListBase |  | The price list assigned to this order. |
| `sources` | SalesRelatedOrder[] |  | A list of orders or documents that preceded and generated this order (e.g. a Quote that became this Sale Order). |
| `targets` | SalesRelatedOrder[] |  | A list of orders or documents that were created from this order (e.g. a Purchase Order triggered by this sale). |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/payments' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

