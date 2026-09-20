# Refunds & Returns

Returns bring sold goods back into stock against a sale order; refunds record money owed back to the customer. Preview the amounts with the calculate endpoints, then authorize to post the result.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

7 endpoints.

### POST /v1/sale_orders/{id}/refunds

**Create Refund**

Creates a refund on a sale order, returning money to the customer for some or all of the
ordered items. Use this when a customer is credited back, whether for the full order or just
selected items.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to create the refund on. |

**Request body** `SalesCreateOrUpdateRefund`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | SalesRefundLineItem[] |  | List of original order items to refund. |
| `custom_items` | SalesRefundCustomLineItem[] |  | List of custom line items to refund (e.g., landed costs, fees). |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/refunds' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/refunds/{refund_id}

**Update Refund**

Updates the details of an existing refund on a sale order before it is finalized. The refund
must be in `Draft` status to be edited and stays in `Draft` afterward, so you can
keep adjusting it until it's ready to authorize.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the refund belongs to. |
| `refund_id` | path | integer (int32) | yes | The ID of the refund to update. |

**Request body** `SalesCreateOrUpdateRefund`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | SalesRefundLineItem[] |  | List of original order items to refund. |
| `custom_items` | SalesRefundCustomLineItem[] |  | List of custom line items to refund (e.g., landed costs, fees). |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/refunds/{refund_id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/refunds/{refund_id}/authorize

**Authorize Refund**

Authorizes a draft refund on a sale order, moving it from `Draft` to `Authorized`.
This is the step that confirms the refund once you've reviewed it and it's ready to stand as
a committed credit to the customer.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the refund belongs to. |
| `refund_id` | path | integer (int32) | yes | The ID of the refund to authorize. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/refunds/{refund_id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/refunds/calculate

**Calculate Refund**

Previews the refund amounts for a sale order without creating anything, so you can see what a
refund would come to before committing it. Provide the line item IDs and/or custom item IDs
you're considering refunding to get the expected breakdown back.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to calculate a refund for. |

**Request body** `SalesCalculateRefundRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_item_ids` | integer (int32)[] |  | List of original order line item IDs to include in the refund calculation. |
| `custom_item_ids` | integer (int32)[] |  | List of custom item IDs to include in the refund calculation. |

**Response** `200` `SalesCalculateRefundsResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | Reference number of the calculated refund. |
| `order_id` | integer (int64) |  | The unique identifier of the sale order. |
| `comments` | string |  | Additional notes or comments about the calculated refund. |
| `line_items` | SalesResponseRefundLineItem[] |  | Calculated refund details for the original order items. |
| `custom_line_items` | SalesResponseRefundCustomLineItem[] |  | Calculated refund details for the custom line items. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/refunds/calculate' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/returns

**Create Return**

Creates a return on a sale order for some or all of the ordered items, so you can record
goods coming back from the customer. Use this to start the returns process, whether the
customer is sending back the whole order or just a few items.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes |  |

**Request body** `SalesCreateReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | SalesReturnLineItemRequest[] |  | List of items to return from the original order. |
| `exchange_line_items` | SalesReturnExchangeLineItemRequest[] |  | List of new items to exchange for the returned items. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/returns' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/returns/{return_id}/authorize

**Authorize Return**

Authorizes a draft return on a sale order, moving it from `Draft` to `Authorized`.
This confirms the return once you've checked it, marking it as approved for the goods to come
back.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the return belongs to. |
| `return_id` | path | integer (int32) | yes | The ID of the return to authorize. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/returns/{return_id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/returns/calculate

**Calculate Return**

Previews the return amounts for a sale order without creating anything, so you can see what a
return would come to before committing it. Provide the line item IDs and/or custom item IDs
you're considering returning to get the expected breakdown back.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to calculate a return for. |

**Request body** `SalesCalculateReturnRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_item_ids` | integer (int32)[] |  | List of original order line item IDs to include in the return calculation. |
| `custom_item_ids` | integer (int32)[] |  | List of custom line item IDs to include in the return calculation. |

**Response** `200` `SalesCalculateReturnsResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | Reference number of the calculated return. |
| `order_id` | integer (int64) |  | The unique identifier of the sale order. |
| `comments` | string |  | Additional notes or comments about the calculated return. |
| `return_items` | SalesResponseReturnLineItem[] |  | Calculated return details for the original order items. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/returns/calculate' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

