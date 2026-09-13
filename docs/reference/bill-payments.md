# Bill Payments

Payments record money paid to a supplier against an authorized bill, reducing the amount still due. Add, correct, or remove payments as you settle each bill.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

3 endpoints.

### POST /v1/purchase_orders/{id}/bills/{bill_id}/payments

**Add Payment**

Records a payment made to the supplier against an authorized bill, reducing the amount still due.
Payments can only be added to bills that have been authorized.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |

**Request body** `Qoblex.Api.Purchases.Dto.BillPaymentDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | number (double) |  | Payment amount, in the payment's currency. |
| `currency` | string |  | Currency the payment was made in. |
| `currency_rate` | number (double) |  | Exchange rate applied to the payment currency at the time of payment. |
| `payment_date` | string (date-time) |  | Date the payment was made. |
| `gateway` | string |  | Payment method or gateway used (e.g. bank transfer, card). |
| `reference` | string |  | Free-text reference for the payment, e.g. a check or transaction number. |
| `reference_id` | string |  | Identifier of the payment on the external payment gateway, if applicable. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}/payments' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/purchase_orders/{id}/bills/{bill_id}/payments/{payment_id}

**Update Payment**

Updates a payment already recorded against a bill, for example to correct its amount or date.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |
| `payment_id` | path | integer (int64) | yes | The unique identifier of the payment. |

**Request body** `Qoblex.Api.Purchases.Dto.BillPaymentDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | number (double) |  | Payment amount, in the payment's currency. |
| `currency` | string |  | Currency the payment was made in. |
| `currency_rate` | number (double) |  | Exchange rate applied to the payment currency at the time of payment. |
| `payment_date` | string (date-time) |  | Date the payment was made. |
| `gateway` | string |  | Payment method or gateway used (e.g. bank transfer, card). |
| `reference` | string |  | Free-text reference for the payment, e.g. a check or transaction number. |
| `reference_id` | string |  | Identifier of the payment on the external payment gateway, if applicable. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}/payments/{payment_id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/bills/{bill_id}/payments/{payment_id}

**Delete Payment**

Permanently removes a payment recorded against a bill, for example one entered in error, and restores
that amount to the bill's amount due.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill. |
| `payment_id` | path | integer (int64) | yes | The unique identifier of the payment. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/bills/{bill_id}/payments/{payment_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

