# Bills

Bills capture what a supplier invoices you against a purchase order. Create a draft bill for the line items and landed costs received, then authorize it to record the amount owed. A bill's totals, amount paid, and amount due are the source of truth for what the supplier is owed.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

8 endpoints.

### POST /v1/purchase_orders/{id}/bills

**Create Bill**

Creates a draft bill against a purchase order for the line items and landed costs you specify, so you
can record what the supplier is invoicing you. The bill starts as a draft; authorize it separately once
it's ready to be paid.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `Qoblex.Api.Purchases.Dto.CreateBillDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | Qoblex.Api.Purchases.Dto.BillLineItemDto[] |  | Purchase order line items to bill. |
| `landed_cost_items` | Qoblex.Api.Purchases.Dto.BillLandedCostItemDto[] |  | Landed cost items to bill. |

**Response** `200` `PurchaseOrder`

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/purchase_orders/{id}/bills/{bill_id}

**Get Bill**

Retrieves a single bill on a purchase order, with its calculated totals, amount paid, amount due,
and whether it can still take a payment. These figures are the source of truth for what the supplier
is owed, so show payment amounts from here rather than adding them up yourself.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |

**Response** `200` `PurchaseBill`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the bill. |
| `purchase_order_id` | integer (int32) |  | Unique identifier of the purchase order this bill belongs to. |
| `number` | string |  | Reference number of the bill. |
| `status` | string |  | Current authorization status of the bill. |
| `currency` | string |  | Currency used for payment and display. |
| `currency_decimals` | integer (int32) |  | Number of decimal places used to display this bill's currency amounts. |
| `currency_rate` | number (double) |  | Exchange rate between the bill currency and the account's base currency. |
| `created_at` | string (date-time) |  | When the bill was created. |
| `due_date` | string (date-time) |  | Date the bill payment is due. |
| `authorized_at` | string (date-time) |  | When the bill was authorized. Null while still in draft. |
| `comments` | string |  | Notes about this bill. |
| `reference` | string |  | The supplier's own reference for this bill. |
| `external_id` | string |  | Identifier of the matching document in the connected accounting system, if the bill has been synced. |
| `is_tax_included_in_price` | boolean |  | Indicates whether the line prices already include tax. |
| `units_billed` | number (double) |  | Total number of units billed across all line items. |
| `summary` | PurchaseBillSummary |  |  |
| `line_items` | PurchaseBillLineItem[] |  | Purchase order line items billed on this bill. |
| `landed_cost_items` | PurchaseBillLandedCostItem[] |  | Landed cost items billed on this bill. |
| `payments` | PurchaseBillPayment[] |  | Payments recorded against this bill, including allocated supplier deposits. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### PATCH /v1/purchase_orders/{id}/bills/{bill_id}

**Update a draft bill**

Use this API endpoint to amend a bill that hasn't been authorized yet: its number, dates,
supplier reference and notes, along with the quantity, price and discount of its lines.
Dropping a line is a separate operation - delete the line item or landed cost item directly.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |

**Request body** `Qoblex.Api.Purchases.Dto.UpdateBillDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | New bill number. |
| `created_at` | string (date-time) |  | New bill date. |
| `due_date` | string (date-time) |  | New payment due date. |
| `supplier_reference` | string |  | New supplier reference for the bill. |
| `comments` | string |  | New notes about the bill. |
| `line_items` | Qoblex.Api.Purchases.Dto.UpdateBillItemDto[] |  | Line item amendments to apply. |
| `landed_cost_items` | Qoblex.Api.Purchases.Dto.UpdateBillItemDto[] |  | Landed cost item amendments to apply. |

**Response** `200` `PurchaseBill`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the bill. |
| `purchase_order_id` | integer (int32) |  | Unique identifier of the purchase order this bill belongs to. |
| `number` | string |  | Reference number of the bill. |
| `status` | string |  | Current authorization status of the bill. |
| `currency` | string |  | Currency used for payment and display. |
| `currency_decimals` | integer (int32) |  | Number of decimal places used to display this bill's currency amounts. |
| `currency_rate` | number (double) |  | Exchange rate between the bill currency and the account's base currency. |
| `created_at` | string (date-time) |  | When the bill was created. |
| `due_date` | string (date-time) |  | Date the bill payment is due. |
| `authorized_at` | string (date-time) |  | When the bill was authorized. Null while still in draft. |
| `comments` | string |  | Notes about this bill. |
| `reference` | string |  | The supplier's own reference for this bill. |
| `external_id` | string |  | Identifier of the matching document in the connected accounting system, if the bill has been synced. |
| `is_tax_included_in_price` | boolean |  | Indicates whether the line prices already include tax. |
| `units_billed` | number (double) |  | Total number of units billed across all line items. |
| `summary` | PurchaseBillSummary |  |  |
| `line_items` | PurchaseBillLineItem[] |  | Purchase order line items billed on this bill. |
| `landed_cost_items` | PurchaseBillLandedCostItem[] |  | Landed cost items billed on this bill. |
| `payments` | PurchaseBillPayment[] |  | Payments recorded against this bill, including allocated supplier deposits. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}' \
  -X PATCH \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/bills/{bill_id}

**Delete Bill**

Permanently deletes a draft bill that hasn't been authorized yet, for example one entered in error.
Only drafts can be deleted, authorize must be reverted first.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |

**Response** `200` `PurchaseOrder`

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/bills/{bill_id}/authorize

**Authorize Bill**

Authorizes a draft bill, recording the billed amount as owed to the supplier and making it available
for payment. This is the step that turns a draft into a payable liability.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |

**Response** `200` `PurchaseOrder`

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/purchase_orders/{id}/bills/{bill_id}/landed_costs/{landed_cost_item_id}

**Remove a landed cost item from a draft bill**

Use this API endpoint to drop a landed cost item from a bill that hasn't been authorized yet.
A bill always keeps at least one line - delete the bill itself instead.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |
| `landed_cost_item_id` | path | integer (int64) | yes | The unique identifier of the bill landed cost item. |

**Response** `200` `PurchaseBill`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the bill. |
| `purchase_order_id` | integer (int32) |  | Unique identifier of the purchase order this bill belongs to. |
| `number` | string |  | Reference number of the bill. |
| `status` | string |  | Current authorization status of the bill. |
| `currency` | string |  | Currency used for payment and display. |
| `currency_decimals` | integer (int32) |  | Number of decimal places used to display this bill's currency amounts. |
| `currency_rate` | number (double) |  | Exchange rate between the bill currency and the account's base currency. |
| `created_at` | string (date-time) |  | When the bill was created. |
| `due_date` | string (date-time) |  | Date the bill payment is due. |
| `authorized_at` | string (date-time) |  | When the bill was authorized. Null while still in draft. |
| `comments` | string |  | Notes about this bill. |
| `reference` | string |  | The supplier's own reference for this bill. |
| `external_id` | string |  | Identifier of the matching document in the connected accounting system, if the bill has been synced. |
| `is_tax_included_in_price` | boolean |  | Indicates whether the line prices already include tax. |
| `units_billed` | number (double) |  | Total number of units billed across all line items. |
| `summary` | PurchaseBillSummary |  |  |
| `line_items` | PurchaseBillLineItem[] |  | Purchase order line items billed on this bill. |
| `landed_cost_items` | PurchaseBillLandedCostItem[] |  | Landed cost items billed on this bill. |
| `payments` | PurchaseBillPayment[] |  | Payments recorded against this bill, including allocated supplier deposits. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}/landed_costs/{landed_cost_item_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/purchase_orders/{id}/bills/{bill_id}/line_items/{line_item_id}

**Remove a line item from a draft bill**

Use this API endpoint to drop a purchase order line item from a bill that hasn't been
authorized yet. A bill always keeps at least one line - delete the bill itself instead.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |
| `line_item_id` | path | integer (int64) | yes | The unique identifier of the bill line item. |

**Response** `200` `PurchaseBill`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the bill. |
| `purchase_order_id` | integer (int32) |  | Unique identifier of the purchase order this bill belongs to. |
| `number` | string |  | Reference number of the bill. |
| `status` | string |  | Current authorization status of the bill. |
| `currency` | string |  | Currency used for payment and display. |
| `currency_decimals` | integer (int32) |  | Number of decimal places used to display this bill's currency amounts. |
| `currency_rate` | number (double) |  | Exchange rate between the bill currency and the account's base currency. |
| `created_at` | string (date-time) |  | When the bill was created. |
| `due_date` | string (date-time) |  | Date the bill payment is due. |
| `authorized_at` | string (date-time) |  | When the bill was authorized. Null while still in draft. |
| `comments` | string |  | Notes about this bill. |
| `reference` | string |  | The supplier's own reference for this bill. |
| `external_id` | string |  | Identifier of the matching document in the connected accounting system, if the bill has been synced. |
| `is_tax_included_in_price` | boolean |  | Indicates whether the line prices already include tax. |
| `units_billed` | number (double) |  | Total number of units billed across all line items. |
| `summary` | PurchaseBillSummary |  |  |
| `line_items` | PurchaseBillLineItem[] |  | Purchase order line items billed on this bill. |
| `landed_cost_items` | PurchaseBillLandedCostItem[] |  | Landed cost items billed on this bill. |
| `payments` | PurchaseBillPayment[] |  | Payments recorded against this bill, including allocated supplier deposits. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}/line_items/{line_item_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/bills/{bill_id}/unauthorize

**Unauthorize Bill**

Reverts an authorized bill back to draft so you can correct it, undoing its recognition as an amount
owed to the supplier.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |

**Response** `200` `PurchaseOrder`

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}/unauthorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

