# Purchase Orders

A purchase order is your instruction to a supplier to buy stock, and it anchors the entire inbound purchasing workflow: it tracks the supplier, ordered items and quantities, costs and landed costs, and its progress from draft through approval, receiving, billing, and payment. These endpoints manage purchase orders and their related records, including goods receipts that bring stock into inventory, supplier bills, payments, returns and refunds, deposits, attachments, and saved views. Responses return the purchase order with its items and the documents produced along the way.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

22 endpoints.

### GET /v1/purchase_orders

**List Purchase Orders**

Returns your purchase orders, most recent first, in pages. Use this to browse and reconcile
what you've ordered from suppliers, then page through the full set to build your own procurement view.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Specifies the page number for pagination. |
| `expand` | query | string |  | Comma-separated list of related resources to include in the response. Supported values: - `supplier` — include the supplier's name on the order. - `bills` — include the bills linked to the order. - `grns` — include the goods receipt notes linked to the order. - `line_items.product_variant` — include each line item's variant details (sku, name, cost, image). - `drop_ship_order` — for a drop-ship order, include the sale order it was raised for. |
| `filters` | query | string |  | Filters to apply on the purchase list: property operator value. Supported properties: - `id` - `number` - `currency` - `supplier_id` - `supplier.name` - `supplier_reference` - `status` - `billing_status` - `receiving_status` - `sub_type` - `created_at` - `estimated_delivery_date` - `payment_status` - `location` — the receiving location id. - `tag` - `shipped_at` — matches if any linked goods receipt was shipped/received on the given date. - `deleted` — soft-deleted orders are included by default; filter `deleted==false` to exclude them. Supported operators: `==` (equals), `!=` (not equals), `@=*` (contains, case-insensitive), `>=` (greater than or equal) `<=` (less than or equal) String values must be double-quoted (e.g. `supplier.name@=*"acme"`). Combine multiple filters with `,` (AND) or `\|` (OR), with a space on each side of the operator. |
| `sort_by` | query | string |  | Sorting to apply on the purchase list: prefix with - for descending, no prefix for ascending. Multiple sorts can be combined using commas. Defaults to `-created_at` (newest first) when omitted. Supported properties: - `id` - `number` - `currency` - `supplier.name` - `supplier_reference` - `status` - `billing_status` - `receiving_status` - `sub_type` - `created_at` - `estimated_delivery_date` - `payment_status` - `location` - `tag` - `deleted` Sorting is not supported on `supplier_id` or `shipped_at` (a to-many relation). Supported operators: `name` (ascending), `-name` (descending), `name,-date` (name ascending then date descending) |

**Response** `200` `PurchaseOrderListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | PurchaseOrder[] |  | The list of items. |
| `count` | integer (int32) |  | The total number of items in the list. |
| `filtered_count` | integer (int32) |  | The total number of items in the list after applying filters, if any. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders

**Create Purchase Order**

Creates a new purchase order, your formal request for a supplier to deliver specific products at
agreed quantities and prices. Line items are the products being ordered, while custom lines cover
additional costs such as freight or insurance (landed costs and expenses).

**Request body** `CreatePurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | Custom reference number for the purchase order. If null, one will be auto-generated. |
| `created_at` | string (date-time) |  | Creation date of the purchase order. |
| `due_date` | string (date-time) |  | Expected delivery date of the purchase order. If null, no due date is set. |
| `supplier` | SupplierBase |  | Basic information (ID and name) about the supplier, for embedding in related records such as purchase orders. |
| `shipping_location_id` | integer (int32) |  | The ID of the location where the order will be shipped to. |
| `billing_location_id` | integer (int32) |  | The ID of the billing location for the order. Required - a billing location isn't necessarily the same as the (inventory-holding) Ship To location, so it's never defaulted. Must be a location that can't hold inventory. |
| `supplier_reference` | string |  | Customer-facing reference number supplied by the supplier for this order. |
| `currency` | string |  | Currency code for the order. |
| `currency_rate` | number (double) |  | Exchange rate applied to the currency at the time of the order. |
| `is_tax_inclusive` | boolean |  | Whether the line item prices already include tax. |
| `line_items` | PurchaseLineItem[] |  | List of line items included in the purchase order. |
| `custom_lines` | PurchaseCustomLine[] |  | List of custom line items included in the purchase order. |
| `comments` | string |  | Additional notes or comments visible to the supplier. |
| `private_notes` | string |  | Internal notes not shared with the supplier. |
| `tags` | string |  | Tags for categorization or filtering. |
| `type` | string |  | Type of the purchase order. - `Regular Order` - `Freight Order` |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/purchase_orders/{id}

**Get Purchase Order**

Retrieves a single purchase order by its identifier, with its line items and custom lines.
Use the expand parameter to pull in related detail in one call, the supplier, linked bills,
goods receipt notes, and each line item's variant details (sku, name, cost), so you can show a
full order view without extra requests.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `expand` | query | string |  | Comma-separated list of related resources to include in the response. Supported values: - `supplier` — include the supplier's name on the order. - `bills` — include the bills linked to the order. - `grns` — include the goods receipt notes linked to the order. - `line_items.product_variant` — include each line item's variant details (sku, name, cost, image). - `drop_ship_order` — for a drop-ship order, include the sale order it was raised for. - `deposits` — include the supplier deposits recorded against the order. - `refunds` — include the supplier refunds recorded against the order. - `supplier_returns` — include the supplier returns linked to the order. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}

**Update Purchase Order**

Updates a purchase order, changing only the fields you send and leaving everything else as it was.
Once the order has an authorized bill, Ship To (LocationId) is the only field you can still change.
You can also send line items and custom lines in the same shape as create: entries without an Id
are added, entries with an existing Id are updated. To remove a line, use the dedicated delete endpoints.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `UpdatePurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | Custom reference number for the purchase order. |
| `due_date` | string (date-time) |  | Expected delivery date of the purchase order. |
| `tags` | string |  | Tags for categorization or filtering. |
| `comments` | string |  | Notes visible to the supplier. |
| `private_notes` | string |  | Internal notes not shared with the supplier. |
| `supplier_reference` | string |  | Customer-facing reference number supplied by the supplier for this order. |
| `shipping_location_id` | integer (int32) |  | The ID of the location where the order will be shipped to (Ship To). Omit to leave unchanged. |
| `billing_location_id` | integer (int32) |  | The ID of the billing location for the order. Must be a location that can't hold inventory. Omit to leave unchanged. |
| `currency` | string |  | Currency code for the order. |
| `currency_exchange_rate` | number (double) |  | Exchange rate applied to the currency at the time of the order. |
| `is_tax_inclusive` | boolean |  | Whether the line item prices already include tax. |
| `line_items` | PurchaseLineItem[] |  | Line items to add (omit Id) or update (existing Id). |
| `custom_lines` | PurchaseCustomLine[] |  | Custom lines to add (omit Id) or update (existing Id). |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/purchase_orders/{id}/approve

**Approve Purchase Order**

Approves a purchase order, confirming it as ready to send to the supplier and opening it up to the
receiving and billing stages. Only draft purchase orders can be approved.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/approve' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/purchase_orders/{id}/attachments

**List Attachments**

Returns the files attached to a purchase order, such as the supplier invoice, packing list, or
contract, so you can keep the order's supporting paperwork in one place.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/attachments' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/attachments

**Upload Attachment**

Attaches a supporting file to a purchase order, such as the supplier invoice, packing list, or
contract, so the paperwork stays with the order. Submit the file as a multipart form upload.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/attachments' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/attachments/{attachment_id}

**Delete Attachment**

Permanently removes a previously uploaded attachment from a purchase order, for example a file added
in error or no longer needed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `attachment_id` | path | integer (int64) | yes | The unique identifier of the attachment to delete. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/attachments/{attachment_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/backorder

**Move Line Items to a Back Order**

Moves quantities the supplier has not delivered onto a new draft purchase order, so the original order
can be received and closed for what did arrive. The new back order copies the supplier, ship-to and
billing locations, price list, currency, exchange rate, tax-inclusive setting, and due date, and contains
only the moved quantities. The two orders are linked, with the back order shown as a related order of the
original. Comments, tags, notes, and custom lines (landed costs) are not carried over.

Send no line items - an empty body, or an empty list - to move every quantity still to be received on the
order. Otherwise only the line items you list move, at the quantities you give.

Moving a line's entire ordered quantity removes it from the original order; moving part of it reduces the
line and leaves the received quantity behind. Once every remaining line is fully received, the original
order becomes Received. A line that has already been billed, or that a draft goods receipt note still
refers to, cannot be moved. Either the whole move succeeds or nothing changes.

An order where nothing has been received cannot have all of its line items moved out, since that would
leave it empty - delete or close it instead.

Note that a draft goods receipt note on a line that was only reduced may now ask for more than the line
has left, which is reported when that goods receipt note is authorized.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order to move the line items from. |

**Request body** `Qoblex.Api.Purchases.Dto.MoveToBackOrderDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | Qoblex.Api.Purchases.Dto.MoveToBackOrderLineItemDto[] |  | Line items to move, and how much of each. Leave this out to move every quantity still to be received on the order, which is the common case of writing off what the supplier has not sent. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/backorder' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/purchase_orders/{id}/close

**Close Purchase Order**

Closes a purchase order, finalizing it so it no longer appears among your open orders. Send
force_close as `true` to close it even when quantities are still unreceived, or `false` to
close it only once every ordered item has been fully received.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `ClosePurchaseOrderRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `force_close` | boolean |  | If `true`, closes the purchase order even if there are still unreceived quantities. If `false`, the order will only close if all items have been fully received. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/close' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/purchase_orders/{id}/duplicate

**Duplicate Purchase Order**

Creates a new draft purchase order by copying an existing one, handy for repeat orders to the same
supplier. It copies the supplier, ship-to location, currency, due date, comments, tags, line items, and
custom lines (landed costs). Received quantities, bills, goods receipts, refunds, deposits, attachments,
and status are never carried over, the new order always starts as an untouched Draft.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order to duplicate. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/duplicate' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/purchase_orders/{id}/landed_costs

**Delete Landed Costs**

Removes one or more landed cost items (such as freight or duties) from a purchase order, for example a
charge that no longer applies. The batch is applied together, so either every item is removed or none are.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `Qoblex.Api.Purchases.Dto.BulkDeletePurchaseOrderLandedCostsDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `landed_cost_ids` | integer (int32)[] |  | Unique identifiers of the landed cost items to remove. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/landed_costs' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/line_items

**Delete Line Items**

Permanently removes one or more line items from a purchase order, for example to drop products
you no longer intend to order. The batch is applied together, so either every line is removed or
none are. Removal is allowed while the order is still in Draft, or when none of the requested lines
have been received or billed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `Qoblex.Api.Purchases.Dto.BulkDeletePurchaseOrderLineItemsDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_item_ids` | integer (int32)[] |  | Unique identifiers of the line items to remove. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/line_items' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/purchase_orders/{id}/line_items/csv

**Export Line Items**

Exports a purchase order's line items to a CSV file, generated in the background. The file uses the
same `Row Type`-based shape the import endpoint accepts, so you can edit it in a spreadsheet and
re-import it. Poll the returned job via `GET /v1/jobs`: once its status is `Completed`, the
job's output is a signed URL to download the CSV.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/line_items/csv' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/line_items/csv

**Import Line Items**

Imports line items onto a draft purchase order from a CSV file, so you can build a large order
in a spreadsheet instead of adding rows one at a time. The file is processed in the background as
one batch, so either every row is added or none are. Each row's `Row Type` column is either
`Item` (matched to a catalog item by SKU then barcode, rows with no match are rejected) or
`Landed Cost` (a named cost such as Freight or Insurance). Importing is only allowed while the
order is still in Draft. Poll the returned job via `GET /v1/jobs` to follow progress and completion.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `ContentType` | string |  |  |
| `ContentDisposition` | string |  |  |
| `Headers` | object |  |  |
| `Length` | integer (int64) |  |  |
| `Name` | string |  |  |
| `FileName` | string |  |  |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/line_items/csv' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/purchase_orders/{id}/link

**Link Related Orders**

Links one or more related orders to a purchase order, so you can keep connected paperwork together,
for example a drop-ship sale order or a backorder that this purchase fulfills.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `Qoblex.Api.Purchases.Dto.LinkPurchaseOrderDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `target_orders` | Qoblex.Api.Purchases.Dto.LinkPurchaseOrderTargetDto[] |  | Orders to link, and how each one relates to this purchase order. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/link' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/link/{target_id}

**Unlink Related Order**

Removes a previously linked related order from a purchase order, undoing a link created in error or no
longer relevant. The linked order itself is untouched, only the connection between them is removed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `target_id` | path | integer (int64) | yes | The unique identifier of the linked order to remove. |

**Response** `200` `PurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the purchase order. |
| `type` | string |  | Type of the purchase order. |
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
| `sub_type` | string |  | Sub-type of the purchase order. |
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

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/link/{target_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/receive

**Receive Purchase Order**

Receives a purchase order in one step, confirming the goods have arrived and updating inventory to
match. Supply a grn_id to receive against an existing goods receipt note, or omit it to have a new one
created for you automatically.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `grn_id` | query | integer (int32) |  | Optional. The goods receipt note to receive against; omit to create a new one automatically. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/receive' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/bulk

**Create Purchase Orders**

Creates several purchase orders in a single call, each a standalone order for a supplier. Use this for
bulk procurement when you need to raise many orders at once without making a separate request for each.
Unlike single order creation, a billing location is optional here: when omitted, the company's first
eligible billing location is used automatically. The request fails if the company has no eligible
billing location at all.

**Request body** `BulkCreatePurchaseOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | MergeOrCreatePurchaseOrder[] |  | List of purchase orders to be created, or existing purchase orders used for merging. |

**Response** `200` `BulkCreatePurchasesResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `purchases` | PurchaseSummary[] |  | List of created purchase orders. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/bulk' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/purchase_orders/bulk/csv

**Bulk-create Purchase Orders from a CSV file**

Uploads a CSV file to storage and enqueues a background job that creates one order per
distinct "Order Number" in the file - rows sharing an Order Number become that order's line
items. The file is checked for structural/required-field errors synchronously, before any
job is created, so obviously malformed files fail immediately. Each order is created
independently once the job runs: one order failing does not stop the others. Poll the
returned job via `GET /v1/jobs` to track progress and see the per-order result once
completed.

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `ContentType` | string |  |  |
| `ContentDisposition` | string |  |  |
| `Headers` | object |  |  |
| `Length` | integer (int64) |  |  |
| `Name` | string |  |  |
| `FileName` | string |  |  |

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/bulk/csv' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/purchase_orders/bulk/csv/template

**Download the bulk Purchase Order import CSV template**

Returns an empty CSV with the exact columns `POST /v1/purchase_orders/bulk/csv` expects.

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/bulk/csv/template' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/purchase_orders/open_purchases

**List Open Purchase Orders**

Returns your open purchase orders grouped by supplier, giving you a per-supplier view of what's still
outstanding. An open purchase order is one that's been approved but not yet fully received or closed.
Filter by one or more supplier IDs to narrow the results to specific suppliers.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `tenant_id` | query | integer (int32) |  | Filter results by a specific tenant. |
| `supplier_ids` | query | integer (int32)[] |  | Filter results to only include purchase orders from specific suppliers. Pass multiple values to filter by several suppliers at once. |

**Response** `200` `ListMergerPurchasesResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | PurchaseMergerResponse[] |  | List of suppliers with their matching purchase orders that can be merged. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/open_purchases' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

