# Sale Orders

A sale order is a customer's order and the hub of your outbound fulfillment and billing workflow. It records the customer, ordered line items, pricing, and the order's progress, and produces the documents that fulfill and settle it. These endpoints manage sale orders and their shipments (picking, packing, dispatch, and delivery notes), invoices, payments, refunds, returns, and stock allocations, along with saved views and CSV or sales-channel imports. Responses return the sale order together with these related records so you can reconcile fulfillment and billing in one place.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

30 endpoints.

### GET /v1/sale_orders

**List Sale Orders**

Returns a paginated list of your sale orders together with their related detail:
line items, payments, shipments, invoices, refunds, returns, and current order status.
This is the endpoint operators use to browse and reconcile orders across the fulfillment
and billing lifecycle in one call.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Page number used for pagination. |
| `created_at_min` | query | string (date-time) |  | Enter a specific creation date for a sales order to return records created after that date. (ISO 8601 format) |
| `created_at_max` | query | string (date-time) |  | Enter a specific creation date for a sales order to return records created before that date. (ISO 8601 format) |
| `expand` | query | string |  | Comma separated values of properties to expand on and include in the response. Commonly used values: `customer`, `customer.addresses`, `invoices`, `shipments`, `refunds`, `returns`, `addresses`, `custom_fields`, and `line_items.product_variant` to include each line item's variant details (sku, name, cost, image). Also supports `sale_agent`, `price_list`, `allocations`, `deposits`, `related_orders`, `invoices.invoice_items`, and `invoices.custom_items`, matching the single sale order GET endpoint. |
| `status[]` | query | enum(`Quote`, `Open`, `Closed`, `Canceled`)[] |  | Sales order status to apply |
| `updated_at_min` | query | string (date-time) |  | Enter a specific update date for a sales order to return records updated after that date |
| `updated_at_max` | query | string (date-time) |  | Enter a specific update date for a sales order to return records updated before that date. |
| `shipping_status[]` | query | enum(`Failed`, `Draft`, `Picked`, `Packed`, `Completed`, `Canceled`)[] |  | Sale order shipping status to apply |
| `stock_status[]` | query | enum(`AwaitingStock`, `ReadyToShip`, `Fulfilled`, `NotApplicable`, `OnHold`)[] |  | Sale order stock status to apply |
| `invoice_status[]` | query | enum(`Draft`, `Partial`, `Completed`)[] |  | Sale order invoice status to apply |
| `payment_status[]` | query | enum(`Unpaid`, `PartiallyPaid`, `FullyPaid`)[] |  | Sale order payment status to apply |
| `assignee_ids[]` | query | integer (int32)[] |  | Filters sales orders based on the provided assignee IDs. |
| `location_ids[]` | query | integer (int32)[] |  | Filters sales orders based on the provided location IDs. |
| `variant_ids[]` | query | integer (int32)[] |  | Filters sales orders based on the provided variant IDs. |
| `tags[]` | query | string[] |  | Filters sales orders based on the provided tags. |
| `include_deleted` | query | boolean |  | Determines whether deleted records should be included. |
| `reference` | query | string |  | Searches by reference value. |
| `number` | query | string |  | Searches by order number |
| `filters` | query | string |  |  |
| `sort_by` | query | string |  |  |
| `include_count` | query | boolean |  |  |

**Response** `200` `SaleOrderResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of sales orders (before the filtering). |
| `filtered_count` | integer (int32) |  | Number of sales orders after filters are applied. |
| `sale_orders` | SaleOrder[] |  | List of sales order objects. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders

**Create Sale Order**

Creates a new sale order, a customer's request to purchase one or more products from your shop.
A sale order created through the API starts as a Quote and no inventory is reserved yet, so you
can build up and adjust the order before committing stock to it. To reserve inventory once the
order is ready, use the Allocate endpoint.

**Request body** `CreateSaleOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | The order number assigned to the newly created sale order. |
| `created_time` | string (date-time) |  | Creation date of the order (ISO 8601 format). |
| `sale_agent` | SaleAgentBase |  | The sales agent who created or owns this order. |
| `customer` | SalesContactBase |  | Represents customer information. |
| `shipping_address` | Address |  | The address associated with the action. |
| `billing_address` | Address |  | The address associated with the action. |
| `origin_location` | SalesOrginiLocation |  | The warehouse or location from which this order will be fulfilled |
| `is_tax_inclusive` | boolean |  | Whether the prices provided already include tax. |
| `currency` | string |  | The currency code for this order. |
| `exchange_rate` | number (double) |  | Rate used to convert the order currency to the base currency (eg. 1 USD = 0.92 EUR.). |
| `comments` | string |  | Public-facing notes or comments visible on the order. |
| `private_notes` | string |  | Internal notes visible only to staff. |
| `tags` | string |  | Comma-separated labels used to categorize or filter the order. |
| `line_items` | SalesLineItem[] |  |  |
| `custom_lines` | SalesCustomLine[] |  |  |
| `source_name` | string |  | The channel or source that generated this order |
| `customer_reference` | string |  | Customer-facing reference/PO number supplied by the customer for this order. |
| `price_list` | SalesPriceListBase |  | The price list assigned to this order. |
| `delivery_date` | string (date-time) |  | The date the order is expected to be delivered (ISO 8601 format). |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/sale_orders/{id}

**Get Sale Order**

Retrieves a single sale order by its ID, with the full detail you need to inspect one
order: its line items, payments, shipments, invoices, refunds, returns, and status.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The ID of the sale order to retrieve. |
| `expand` | query | string |  | Comma-separated list of related resources to include in the response. Supported values: - `invoices` - `invoices.invoice_items` - `invoices.custom_items` - `shipments` - `refunds` - `returns` - `returns.return_items` - `returns.return_custom_items` - `returns.exchange_line_items` - `addresses` - `customer` - `customer.addresses` - `sale_agent` - `integration` - `price_list` - `allocations` - `deposits` - `custom_fields` - `related_orders` |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}

**Update Sale Order**

Updates an existing sale order, changing only the fields you supply in the request body and
leaving everything else untouched. Some fields lock once the order progresses: currency,
exchange rate, tax-inclusive, and price list can no longer be changed once the order has been
invoiced, and customer, origin location, currency, exchange rate, tax-inclusive, price list,
and delivery date can no longer be changed once the order is closed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to update. |

**Request body** `UpdateSaleOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | The order number. |
| `customer_reference` | string |  | Customer-facing reference/PO number supplied by the customer for this order. |
| `sale_agent` | SaleAgentBase |  | The sales agent who created or owns this order. |
| `customer` | SalesContactBase |  | Represents customer information. |
| `shipping_address` | Address |  | The address associated with the action. |
| `billing_address` | Address |  | The address associated with the action. |
| `origin_location` | SalesOrginiLocation |  | The warehouse or location from which this order will be fulfilled |
| `is_tax_inclusive` | boolean |  | Whether the prices provided already include tax. |
| `currency` | string |  | The currency code for this order. |
| `exchange_rate` | number (double) |  | Rate used to convert the order currency to the base currency (eg. 1 USD = 0.92 EUR.). |
| `price_list` | SalesPriceListBase |  | The price list assigned to this order. |
| `delivery_date` | string (date-time) |  | The date the order is expected to be delivered (ISO 8601 format). |
| `comments` | string |  | Public-facing notes or comments visible on the order. |
| `tags` | string |  | Comma-separated labels used to categorize or filter the order. |
| `line_items` | UpdateSaleOrderLineItem[] |  | Line items to add (omit Id) or update (existing Id). |
| `custom_lines` | UpdateSaleOrderCustomLine[] |  | Custom lines to add (omit Id) or update (existing Id). |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/allocate

**Allocate Sale Order**

Allocates available stock to the specified line items on a sale order, reserving it so the
same inventory can't be committed to another order. This is how you commit stock to an order
once it's ready to be fulfilled.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to allocate stock to. |

**Request body** `Gostad.Application.Sales.Dtos.AllocateOrderDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  |  |
| `allocations` | Gostad.Application.Sales.Dtos.AllocationItemDto[] |  |  |

**Response** `200` `SalesOrderFulfillment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | The unique identifier of the sale order. |
| `number` | string |  | The sale order number. |
| `status` | string |  | The current status of the sale order. |
| `stock_status` | string |  | The current stock status of the sale order. |
| `picking_status` | string |  | The current picking status of the sale order. |
| `packing_status` | string |  | The current packing status of the sale order. |
| `shipping_status` | string |  | The current shipping status of the sale order. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/allocate' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/sale_orders/{id}/attachments

**List Attachments**

Returns the files attached to a sale order, such as the customer purchase order, signed quote, or
delivery note, so you can keep the order's supporting paperwork in one place.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the sale order. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file_meta_data_id` | integer (int32) |  | Unique identifier for the file metadata record. |
| `file_size` | integer (int32) |  | The size of the file in bytes. |
| `upload_time` | string (date-time) |  | Timestamp of when the file was uploaded. |
| `file_name` | string |  | The name of the attached file. |
| `url` | string |  | The URL where the file can be accessed or downloaded. |
| `discriminator` | string |  | Internal classifier for the type of attachment. |
| `product_id` | integer (int32) |  | Reference to the product this attachment is linked to, if applicable. |
| `position` | integer (int32) |  | The display order of the attachment. |
| `last_updated_time` | string (date-time) |  | Timestamp of the last update to the attachment record. |
| `order_id` | integer (int32) |  | Reference to the order this attachment belongs to. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/attachments' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/attachments

**Upload Attachment**

Attaches a supporting file to a sale order Submit the file as a multipart form upload.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the sale order. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `ContentType` | string |  |  |
| `ContentDisposition` | string |  |  |
| `Headers` | object |  |  |
| `Length` | integer (int64) |  |  |
| `Name` | string |  |  |
| `FileName` | string |  |  |

**Response** `200` `OrderAttachment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file_meta_data_id` | integer (int32) |  | Unique identifier for the file metadata record. |
| `file_size` | integer (int32) |  | The size of the file in bytes. |
| `upload_time` | string (date-time) |  | Timestamp of when the file was uploaded. |
| `file_name` | string |  | The name of the attached file. |
| `url` | string |  | The URL where the file can be accessed or downloaded. |
| `discriminator` | string |  | Internal classifier for the type of attachment. |
| `product_id` | integer (int32) |  | Reference to the product this attachment is linked to, if applicable. |
| `position` | integer (int32) |  | The display order of the attachment. |
| `last_updated_time` | string (date-time) |  | Timestamp of the last update to the attachment record. |
| `order_id` | integer (int32) |  | Reference to the order this attachment belongs to. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/attachments' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/sale_orders/{id}/attachments/{attachment_id}

**Delete Attachment**

Permanently removes a previously uploaded attachment from a sale order, for example a file added
in error or no longer needed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the sale order. |
| `attachment_id` | path | integer (int64) | yes | The unique identifier of the attachment to delete. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/attachments/{attachment_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/cancel

**Cancel Sale Order**

Cancels a sale order, moving it from its current status (for example Open) to Cancelled.
Once cancelled the order is no longer active and no further actions such as shipping or
invoicing can be performed on it, so use this when an order won't be fulfilled.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to cancel. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/cancel' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/close

**Close Sale Order**

Marks a sale order as Closed, its completed end state, once the order has been fully
fulfilled and billed. Operators use this to finalize an order and take it out of the
active work queue.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to close. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/close' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/sale_orders/{id}/custom_lines

**Delete Custom Lines**

Removes one or more custom lines from a sale order. All lines are removed together as a single
all-or-nothing operation. A custom line cannot be removed once it has been invoiced.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to remove custom lines from. |

**Request body** `Qoblex.Api.Sales.Dto.BulkDeleteSaleOrderCustomLinesDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `custom_line_ids` | integer (int32)[] |  | Unique identifiers of the custom lines to remove. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/custom_lines' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/deallocate

**Deallocate Sale Order**

Releases stock previously allocated to a sale order back to available inventory, freeing it
up for other orders. Use this to undo an allocation when an order is cancelled, changed, or
no longer needs the reserved stock.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to deallocate stock from. |

**Request body** `Gostad.Application.Sales.Dtos.DeallocateOrderDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  |  |
| `allocation_ids` | integer (int32)[] |  |  |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/deallocate' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/drop_ship

**Drop Ship Sale Order**

Creates supplier purchase orders that instruct suppliers to ship goods directly to the
customer, bypassing your warehouse. Target specific line items by passing their IDs in the
request body, or omit them to process all eligible drop ship items on the order. A single
request may produce several purchase orders, typically one per supplier.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to drop ship. |

**Request body** `SalesDropShipRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `selected_order_item_ids` | integer (int32)[] |  | The Unique Identifier of specific line items to drop ship. Pass `null` or omit to drop ship all eligible items in the sale order. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `number` | string |  | Reference number of the purchase order. |
| `created_at` | string (date-time) |  | Date and time when the purchase order was created. |
| `last_updated_at` | string (date-time) |  | Date and time when the purchase order was last updated. |
| `due_date` | string (date-time) |  | Expected delivery date of the purchase order. |
| `line_items` | PurchaseOrderLineItem[] |  | List of product items included in the purchase order. |
| `custom_lines` | PurchaseOrderCustomLine[] |  | List of custom lines (e.g., landed costs) associated with the order. |
| `status` | string |  | Current status of the purchase order. |
| `billing_status` | string |  | Current billing status of the purchase order. |
| `receiving_status` | string |  | Current receiving status of the purchase order. |
| `payment_status` | string |  | Current payment status of the purchase order. |
| `type` | enum(`RegularPO`, `FreightPO`, `DropShipPo`) |  | Type of the purchase order: `RegularPO`, `FreightPO` or `DropShipPo`. |
| `shipping_location_id` | integer (int32) |  | ID of the location where the order will be shipped to. |
| `billing_location_id` | integer (int32) |  | ID of the location where the order will be billed to. |
| `price_list_id` | integer (int32) |  | Optional price list ID associated with the purchase order. |
| `supplier` | SupplierBase |  | Basic information (ID and name) about the supplier, for embedding in related records such as purchase orders. |
| `currency` | string |  | Currency used for the purchase order |
| `currency_exchange_rate` | number (double) |  | Exchange rate applied to the currency at the time of the order. |
| `is_tax_inclusive` | boolean |  | Indicates whether the prices include tax. |
| `comments` | string |  | Additional notes or comments about the purchase order. |
| `supplier_reference` | string |  | Supplier reference |
| `private_notes` | string |  | Internal notes not visible to the supplier. |
| `tags` | string |  | Tags associated with the purchase order for categorization. |
| `good_receipts` | PurchaseGoodReceiptBasic[] |  | List of good receipts linked to the purchase order. |
| `bills` | PurchaseBillBasic[] |  | List of bills linked to the purchase order. |
| `supplier_returns` | PurchaseSupplierReturnBasic[] |  | List of supplier returns linked to the purchase order. |
| `total` | number (double) |  | Total value of the order (line items plus custom lines, tax applied), in the tenant's base currency. |
| `subtotal` | number (double) |  | Sum of quantity x price across purchase orders's line items and custom charge lines, before tax. |
| `tax_total` | number (double) |  | Total tax across the purchase orders's line items and custom charge lines. |
| `received_units` | number (double) |  | Total quantity being received across the purchase orders's line items. |
| `total_in_currency` | number (double) |  | Order total amount in original currency |
| `total_discount` | number (double) |  | Order total discount |
| `drop_ship_order` | DropShipOrder |  | Represents the sale order a drop-ship purchase order was raised for, including its ID, number, status, customer name, and shipping address. |
| `deposits` | SupplierDepositBasic[] |  | List of supplier deposits recorded against the order. Only present when requested via `expand=deposits`. |
| `refunds` | SupplierRefund[] |  | List of supplier refunds recorded against the order. Only present when requested via `expand=refunds`. |
| `related_orders` | RelatedOrder[] |  | Other orders linked to this purchase order — for example a back-order it's linked to, or the sale order it drop-ships for. Only present when requested via `expand=related_orders`. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/drop_ship' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/sale_orders/{id}/drop_ship/items

**List Drop Ship Items**

Lists the drop ship items on a sale order, the products fulfilled directly by the supplier to
the customer and bypassing your warehouse entirely. Only items flagged as drop ship on the
order are included, giving you the set you can raise supplier purchase orders for.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to list drop ship items for. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_item_id` | integer (int32) |  | Unique identifier of the sale order line item. |
| `product_name` | string |  | The name of the product to be drop shipped. |
| `sku` | string |  | The stock keeping unit code identifying the product. |
| `quantity` | number (double) |  | The quantity of the product to be drop shipped. |
| `quantity_unit` | string |  | The unit of measurement for the quantity. |
| `image` | string |  | Url of the product image. |
| `option_values` | ProductOptions[] |  | The variant option values, used to display the product variant. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/drop_ship/items' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/duplicate

**Duplicate Sale Order**

Creates a new Quote sale order by copying the source order's customer, addresses, currency,
delivery date, comments, sale agent, and line items. Private notes, tags, custom fields,
attachments, payments, invoices, shipments, refunds, returns, linked orders, and status are
never copied.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to duplicate. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/duplicate' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/hold

**Hold Allocations**

Places the specified allocations on hold, keeping the reserved stock committed to the order
but pausing it from moving forward until you explicitly deallocate or fulfill it. Useful when
an order needs to wait (for payment, a customer confirmation, or a stock check) without giving
up its reserved inventory.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order whose allocations to put on hold. |

**Request body** `Gostad.Application.Sales.Dtos.DeallocateOrderDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  |  |
| `allocation_ids` | integer (int32)[] |  |  |

**Response** `200` `SalesOrderFulfillment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | The unique identifier of the sale order. |
| `number` | string |  | The sale order number. |
| `status` | string |  | The current status of the sale order. |
| `stock_status` | string |  | The current stock status of the sale order. |
| `picking_status` | string |  | The current picking status of the sale order. |
| `packing_status` | string |  | The current packing status of the sale order. |
| `shipping_status` | string |  | The current shipping status of the sale order. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/hold' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/sale_orders/{id}/line_items

**Delete Line Items**

Removes one or more line items from a sale order. All items are removed together as a single
all-or-nothing operation. A line item cannot be removed once it has been shipped or invoiced.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to remove line items from. |

**Request body** `Qoblex.Api.Sales.Dto.BulkDeleteSaleOrderLineItemsDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_item_ids` | integer (int32)[] |  | Unique identifiers of the line items to remove. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/line_items' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/sale_orders/{id}/line_items/export

**Export Line Items**

Starts a background export of a single sale order's line items and custom lines
(including "Landed Cost" rows) to a CSV file. Because the export runs in the background,
this returns a job right away; poll `GET /v1/jobs?name=sale_order_line_items_export`
and read the job's output for a signed download URL once it completes.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to export. |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/line_items/export' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/line_items/import

**Import Line Items**

Uploads a CSV of line items and custom lines and applies it to an existing sale order in the
background. Rows that match an existing line item's product variant (by SKU or barcode)
overwrite that item's quantity, price, discount, and tax; rows that don't match are added as
new line items. This is only available while the order is still a Quote. Poll
`GET /v1/jobs?name=sale_order_line_items_import` or `GET /v1/activity` for the result.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to import line items into. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | string (binary) |  | The sale order line items CSV file. |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/line_items/import' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/open

**Open Sale Order**

Opens a sale order, moving it from Draft to Open so it becomes an active order ready for
fulfillment and billing. This is the step that promotes a draft into your live order flow.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to open. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/open' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/revert_to_quote

**Revert Sale Order to Quote**

Reverts an Open sale order back to Quote status, useful when an order was opened prematurely
and needs further changes before it re-enters the active flow.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to revert to a quote. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/revert_to_quote' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/unlock

**Unlock Sale Order**

Lifts the edit lock on a sale order that was imported from a connected sale channel
(for example `Shopify`, `WooCommerce`, or `Amazon`). Channel-imported orders
are locked by default to stay in sync with the source; unlock one when you need to edit it
manually in Qoblex.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to unlock. |

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
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/unlock' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/create_purchase_orders

**Create Purchase Orders From Sale Orders**

Aggregates line items across one or more sale orders into new Draft purchase orders, one
per supplier - the backend equivalent of the "Create Purchase Order" action available both
from the sale order list (bulk, pass several ids) and a single order's details page (pass
one id). Each generated purchase order is linked back to every sale order that contributed
to it. This is unrelated to Drop Ship - the generated orders receive at the supplied
shipping location and stay Draft, awaiting normal review and approval. Use
`GET /v1/sale_orders/preview_purchase_orders` first to find out which sold products
need a supplier assigned via request's `supplier_assignments`.

**Request body** `SalesCreatePurchaseOrdersRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `sale_order_ids` | integer (int32)[] |  | The sale order(s) to aggregate line items from. Pass a single id for the details page action, or several for the list page's bulk action. |
| `shipping_location_id` | integer (int32) |  | The shipping location the purchase order(s) will receive stock at - applied to every purchase order generated by this call. |
| `default_supplier_id` | integer (int32) |  | Optional. Used only for sold products that have no supplier of their own and that are not covered by Qoblex.Api.Sales.Dto.CreatePurchaseOrdersFromSaleOrdersDto.SupplierAssignments - such a product is added to this supplier's purchase order instead of being skipped. |
| `supplier_assignments` | SalesProductSupplierAssignment[] |  | Optional. Per-product supplier choices, for any sold product - lets one call route different products to different suppliers, rather than every one falling back to the single Qoblex.Api.Sales.Dto.CreatePurchaseOrdersFromSaleOrdersDto.DefaultSupplierId. Get the full list of purchasable products (and their already resolved supplier, if any) from `GET /v1/sale_orders/preview_purchase_orders`. An assignment here overrides a product's own resolved supplier for this purchase order only; checked before Qoblex.Api.Sales.Dto.CreatePurchaseOrdersFromSaleOrdersDto.DefaultSupplierId. |

**Response** `200` `SalesCreatePurchaseOrdersResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `purchase_orders` | PurchaseOrder[] |  | The newly created purchase orders, one per supplier. |
| `skipped_product_names` | string[] |  | Names of sold products that could not be included in any purchase order - either because they are bundle products, which are never purchased from a supplier as a single SKU, or because they have no supplier resolved and no default supplier was given. Other products still get their purchase orders created; this list is informational, not an error. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/create_purchase_orders' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/export

**Export Sale Orders**

Exports the given sale orders to a CSV in the background, with one row per order item, bundle
part, landed-cost, or refund line. Up to 100 orders can be exported per request. Poll the
returned job via `GET /v1/jobs?name=sale_orders_export` until it completes; its output is
a signed, time-limited download URL for the CSV file.

**Request body** `ExportSaleOrdersRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_ids` | integer (int32)[] |  | The Sale Orders to export. Limited to 100 orders per export, matching the legacy list page's selection cap. |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/export' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/import

**Import Sale Orders**

Uploads a CSV of sale orders and their line items and imports them in the background. The
file is checked for CSV formatting errors right away, while matching, order creation, and the
rest of the row-level validation happen asynchronously. Track progress via
`GET /v1/jobs?name=order_import` while it's queued or running; it drops off that list as
soon as processing finishes rather than settling into a final status there. When it's done,
the uploader is emailed a result summary and a matching entry appears in `GET /v1/activity`.

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | string (binary) |  | The sale orders CSV file. |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/import' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/import_from_channel

**Import Sale Orders from Channel**

Pulls orders on demand from a connected sale channel (`Shopify`, `WooCommerce`,
`Amazon`, and the like) for a date range you choose, using the same ingestion that
normally runs off channel webhooks. Use it to backfill or catch up on orders that didn't come
through automatically. Historical ranges are limited to 3 months unless your account has the
extended import range enabled. It's fire-and-forget: nothing is returned to poll, and you're
emailed a result summary once the import finishes.

**Request body** `ImportOrdersFromChannelRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `integration_id` | integer (int32) |  | The store integration to import orders from. |
| `from` | string (date-time) |  | Start of the date range to import orders from. |
| `to` | string (date-time) |  | End of the date range to import orders from. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/import_from_channel' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/sale_orders/linkable_orders

**Search Linkable Orders**

Searches across your sale, purchase, and production orders using a QueryKit `filters` expression
(e.g. matching on `number` or `contact.name`). Use this to find candidate orders to link to a
sale order, for example the purchase order that drop-ships it. Restrict to specific order types and
exclude ids (typically the sale order you're linking from, plus any orders already linked to it) to
narrow the results to orders that are actually eligible to be linked.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `filters` | query | string |  | Filters to apply to the search: property operator value. Supported properties: - `id` - `number` - `author_name` - `status` - `type` - `sub_type` - `created_at` Supported operators: `==` (equals), `!=` (not equals), `@=*` (contains, case-insensitive), `>=` (greater than or equal), `<=` (less than or equal) String values must be double-quoted. Combine multiple filters with `,` (AND) or `\|` (OR), with a space on each side of the operator. A free-text search box should filter on both `number` and `author_name`, e.g. `number@=*"PO-001" \| author_name@=*"PO-001"`. |
| `types` | query | string |  | Comma-separated list of order types to restrict the search to. Omit to search across all order types. Supported values: `Sale`, `Purchase`, `ProductionAssembly`, `ProductionDisassembly`. |
| `exclude_order_ids` | query | string |  | Comma-separated list of order ids to exclude from the results — typically the order you're linking from, plus any orders already linked to it. |
| `page` | query | integer (int32) |  | Specifies the page number for pagination. |
| `sort_by` | query | string |  | Sorting to apply to the results: prefix with - for descending, no prefix for ascending. Defaults to `-created_at` (newest first) when omitted. Supported properties: `id`, `number`, `author_name`, `created_at`. |

**Response** `200` `LinkableOrderListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | LinkableOrder[] |  | The list of items. |
| `count` | integer (int32) |  | The total number of items in the list. |
| `filtered_count` | integer (int32) |  | The total number of items in the list after applying filters, if any. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/linkable_orders' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/sale_orders/preview_purchase_orders

**Preview Purchase Orders From Sale Orders**

Read-only preview for `POST /v1/sale_orders/create_purchase_orders` - nothing is
created. Returns every sold, purchasable product across the given sale orders, including its
already-resolved supplier if any, so a caller can assign a supplier per product (via
`supplier_assignments` on the create call) instead of every unresolved product falling
back to one blanket `default_supplier_id` or being silently skipped.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `sale_order_ids[]` | query | integer (int32)[] |  | The sale order(s) to aggregate line items from. Pass a single id for the details page action, or several for the list page's bulk action - same ids you intend to pass to `POST /v1/sale_orders/create_purchase_orders`. |

**Response** `200` `SalesPreviewCreatePurchaseOrdersResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `products` | Qoblex.Api.Sales.Dto.PreviewProductDto[] |  | Every sold, purchasable product across the given sale orders - including ones that already resolve their own supplier (`resolved_supplier_id` set), so a caller can show the full picture rather than hiding products the merchant sold. |
| `skipped_product_names` | string[] |  | Names of sold products that will never be included in any purchase order, regardless of any supplier assignment - bundle products, which are never purchased from a supplier as a single SKU. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/preview_purchase_orders' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/print_packing_slips

**Print Packing Slips**

Queues a background job that prints packing slips for the given Sale Orders, one per
shipment on each order, matching the legacy list page's and order detail page's "Print
packing slips" actions. Set `include_unpicked_orders` to also get a whole-order
packing slip for orders that have no shipments yet. Poll the returned job via
`GET /v1/jobs?name=print_packing_slips` until it completes; its output is a signed,
time-limited download URL for the rendered file.

**Request body** `PrintPackingSlipsForSaleOrdersRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_ids` | integer (int32)[] |  | The Sale Orders to print packing slips for. Pass a single id for the order detail page action, or several for the list page's bulk action. One packing slip is produced per shipment on each order. |
| `include_unpicked_orders` | boolean |  | When true, orders with no shipments yet get a whole-order packing slip instead of being skipped. |
| `template_id` | integer (int32) |  | The packing slip design template to render with. Omit to use the company's default designer template. |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/print_packing_slips' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/ship

**Ship Sale Orders**

Packs and dispatches a selection of sale orders. Set `auto_adjust` for orders held up by
wrong inventory rather than genuinely absent stock: on-hand is topped up just enough to cover
the selection and allocated to it, so orders outside the selection waiting on the same
products get none of that stock. The work runs in the background - poll the returned job for
the outcome. Orders that cannot be handled are left untouched and named in the job output;
the run is one transaction, so a failure once it starts writing rolls all of it back.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `auto_adjust` | query | boolean |  | Create the stock the selected orders are short of before shipping them. |

**Request body** `SalesShipRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_ids` | integer (int32)[] |  | The sale orders to ship. With `auto_adjust` set, stock created by this call is allocated only to these orders - orders outside the selection awaiting the same products get nothing. |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/ship' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

