# Deposits & Refunds

Deposits are prepayments you make to a supplier before goods ship, which you can later allocate against a bill. Refunds record money the supplier owes back to you for returned or overbilled items. Both are managed against the purchase order.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

9 endpoints.

### POST /v1/purchase_orders/{id}/deposits

**Create Supplier Deposit**

Records a deposit paid to the supplier up front against a purchase order, common when a supplier
requires payment before shipping. You can later allocate the deposit towards a bill on the same order.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `CreateSupplierDeposit`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | number (double) |  | Deposit amount, in the order's currency. Required unless Qoblex.Api.Purchases.Dto.CreateSupplierDepositDto.Percentage is supplied. |
| `percentage` | number (double) |  | Deposit expressed as a percentage of the order total, between 0 (exclusive) and 100. The resulting amount is worked out when the deposit is recorded. Required unless Qoblex.Api.Purchases.Dto.CreateSupplierDepositDto.Amount is supplied. |
| `reference` | string |  | Your reference for the deposit, for example the bank transfer reference. Defaults to a reference derived from the purchase order number. |
| `paid_at` | string (date-time) |  | Date the deposit was paid. Defaults to now. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/deposits' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### PATCH /v1/purchase_orders/{id}/deposits/{deposit_id}

**Update Supplier Deposit**

Corrects the amount, reference or payment date of a deposit, for example when the amount was keyed in
wrongly. Only the fields you supply are changed. A deposit can no longer be changed once
it has synced to your accounting system, because that push is one-way; nor while it is allocated to a
bill - remove the allocation first.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `deposit_id` | path | integer (int64) | yes | The unique identifier of the deposit. |

**Request body** `UpdateSupplierDeposit`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | number (double) |  | New deposit amount, in the order's currency. Omit to leave the value unchanged. |
| `percentage` | number (double) |  | New deposit percentage of the order total, between 0 (exclusive) and 100. The resulting amount is worked out from the order total as it stands now. Omit to leave the value unchanged. |
| `reference` | string |  | Your reference for the deposit. Omit to leave it unchanged. |
| `paid_at` | string (date-time) |  | Date the deposit was paid. Omit to leave it unchanged. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/deposits/{deposit_id}' \
  -X PATCH \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/deposits/{deposit_id}

**Delete Supplier Deposit**

Permanently removes a supplier deposit from a purchase order, for example one recorded in error.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `deposit_id` | path | integer (int64) | yes | The unique identifier of the deposit. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/deposits/{deposit_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/deposits/{deposit_id}/allocations/{bill_id}

**Allocate Deposit**

Applies a supplier deposit towards a bill's amount due, so a prepayment offsets what you owe on that
bill rather than paying it again.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `deposit_id` | path | integer (int64) | yes | The unique identifier of the deposit. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill to allocate the deposit to. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/deposits/{deposit_id}/allocations/{bill_id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/purchase_orders/{id}/deposits/{deposit_id}/allocations/{bill_id}

**Delete Deposit Allocation**

Removes a supplier deposit's allocation from a bill, freeing the deposit back up so it can be applied
elsewhere or the bill's amount due can be paid another way.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `deposit_id` | path | integer (int64) | yes | The unique identifier of the deposit. |
| `bill_id` | path | integer (int64) | yes | The unique identifier of the bill the deposit is allocated to. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/deposits/{deposit_id}/allocations/{bill_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/refunds

**Create Supplier Refund**

Records a draft refund owed to you by the supplier for goods or charges on a purchase order, for
example money back on returned or overbilled items. The refund starts as a draft; authorize it separately
once it's ready.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `Qoblex.Api.Purchases.Dto.CreateSupplierRefundDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | Qoblex.Api.Purchases.Dto.SupplierRefundLineItemDto[] |  | Purchase order line items to refund. Omit if the refund only contains custom charge lines. |
| `custom_line_items` | Qoblex.Api.Purchases.Dto.SupplierRefundCustomLineItemDto[] |  | Custom (non-tracked) charge lines to refund. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/refunds' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/refunds/{refund_id}

**Delete Supplier Refund**

Permanently deletes a draft supplier refund that hasn't been authorized yet, for example one raised in
error. Only drafts can be deleted.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `refund_id` | path | integer (int64) | yes | The unique identifier of the refund. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/refunds/{refund_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/refunds/{refund_id}/authorize

**Authorize Supplier Refund**

Authorizes a draft supplier refund, confirming the amount the supplier owes you back. Only draft
refunds can be authorized.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `refund_id` | path | integer (int64) | yes | The unique identifier of the refund. |

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
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/refunds/{refund_id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/refunds/{refund_id}/unauthorize

**Unauthorize Supplier Refund**

Reverts an authorized supplier refund back to draft so you can correct it. The refund stays
authorized if its synced credit note already has allocations applied against it in your accounting
system, the credit note is only deleted or voided there if the refund is later actually deleted.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `refund_id` | path | integer (int64) | yes | The unique identifier of the supplier refund. |

**Response** `200` `SupplierRefund`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the supplier refund. |
| `purchase_order_id` | integer (int32) |  | Unique identifier of the purchase order this refund belongs to. |
| `number` | string |  | Reference number of the supplier refund. |
| `status` | string |  | Current authorization status of the supplier refund. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/refunds/{refund_id}/unauthorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

