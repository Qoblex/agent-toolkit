# Supplier Returns

Supplier returns record goods sent back to a supplier against a purchase order. Create a draft return for the items leaving, then authorize it to reduce on-hand inventory accordingly.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

6 endpoints.

### POST /v1/purchase_orders/{id}/supplier_returns

**Create Supplier Return**

Records goods being sent back to the supplier against a purchase order, creating a draft supplier
return, for example to return damaged or incorrect items. The return starts as a draft; authorize it
separately once it's ready to adjust your stock.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `Qoblex.Api.Purchases.Dto.CreateSupplierReturnDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | Qoblex.Api.Purchases.Dto.SupplierReturnLineItemDto[] |  | Purchase order line items being returned. Omit if the return only contains custom charge lines. |
| `extra_charge_items` | Qoblex.Api.Purchases.Dto.SupplierReturnCustomLineItemDto[] |  | Custom (non-tracked) charge lines associated with the return. |

**Response** `200` `PurchaseSupplierReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the supplier return. |
| `number` | string |  | Reference number of the supplier return. |
| `status` | string |  | Current status of the supplier return. |
| `reason` | string |  | Reason the goods are being returned to the supplier. |
| `resolution` | string |  | How the return is expected to be resolved, for example a credit or a replacement. |
| `comments` | string |  | Notes about the return. |
| `created_at` | string (date-time) |  | When the supplier return was created. |
| `authorized_at` | string (date-time) |  | When the supplier return was authorized. Null while still in draft. |
| `line_items` | PurchaseSupplierReturnLineItem[] |  | Line items being returned to the supplier. |
| `currency` | string |  | Currency the return's amounts are expressed in. |
| `subtotal` | number (double) |  | Sum of quantity x price across the return's line items and custom charge lines, before tax. |
| `tax_total` | number (double) |  | Total tax across the return's line items and custom charge lines. |
| `total` | number (double) |  | Subtotal plus tax, unless the order's prices are already tax-inclusive. |
| `units_to_return` | number (double) |  | Total quantity being returned across the return's tracked line items. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/supplier_returns' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}

**Get Supplier Return**

Retrieves a single supplier return by its identifier, with its line items and any non-tracked
charge lines, so you can review what's being sent back to the supplier.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `supplier_return_id` | path | integer (int64) | yes | The unique identifier of the supplier return. |

**Response** `200` `PurchaseSupplierReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the supplier return. |
| `number` | string |  | Reference number of the supplier return. |
| `status` | string |  | Current status of the supplier return. |
| `reason` | string |  | Reason the goods are being returned to the supplier. |
| `resolution` | string |  | How the return is expected to be resolved, for example a credit or a replacement. |
| `comments` | string |  | Notes about the return. |
| `created_at` | string (date-time) |  | When the supplier return was created. |
| `authorized_at` | string (date-time) |  | When the supplier return was authorized. Null while still in draft. |
| `line_items` | PurchaseSupplierReturnLineItem[] |  | Line items being returned to the supplier. |
| `currency` | string |  | Currency the return's amounts are expressed in. |
| `subtotal` | number (double) |  | Sum of quantity x price across the return's line items and custom charge lines, before tax. |
| `tax_total` | number (double) |  | Total tax across the return's line items and custom charge lines. |
| `total` | number (double) |  | Subtotal plus tax, unless the order's prices are already tax-inclusive. |
| `units_to_return` | number (double) |  | Total quantity being returned across the return's tracked line items. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### PATCH /v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}

**Update Supplier Return**

Updates a draft supplier return, for example to set its number, reason, resolution, or comments
before you authorize it. Only the fields you send are changed, and updates are only allowed while
the return is still a draft.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `supplier_return_id` | path | integer (int64) | yes | The unique identifier of the supplier return. |

**Request body** `UpdatePurchaseSupplierReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | Reference number of the supplier return. Left unchanged when omitted. |
| `reason` | string |  | Reason the goods are being returned to the supplier. Left unchanged when omitted. |
| `resolution` | string |  | How the return is expected to be resolved. Left unchanged when omitted. |
| `comments` | string |  | Notes about the return. Left unchanged when omitted. |
| `line_items` | UpdatePurchaseSupplierReturnLineItem[] |  | Line item quantity updates. Line items not listed here are left unchanged. |

**Response** `200` `PurchaseSupplierReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the supplier return. |
| `number` | string |  | Reference number of the supplier return. |
| `status` | string |  | Current status of the supplier return. |
| `reason` | string |  | Reason the goods are being returned to the supplier. |
| `resolution` | string |  | How the return is expected to be resolved, for example a credit or a replacement. |
| `comments` | string |  | Notes about the return. |
| `created_at` | string (date-time) |  | When the supplier return was created. |
| `authorized_at` | string (date-time) |  | When the supplier return was authorized. Null while still in draft. |
| `line_items` | PurchaseSupplierReturnLineItem[] |  | Line items being returned to the supplier. |
| `currency` | string |  | Currency the return's amounts are expressed in. |
| `subtotal` | number (double) |  | Sum of quantity x price across the return's line items and custom charge lines, before tax. |
| `tax_total` | number (double) |  | Total tax across the return's line items and custom charge lines. |
| `total` | number (double) |  | Subtotal plus tax, unless the order's prices are already tax-inclusive. |
| `units_to_return` | number (double) |  | Total quantity being returned across the return's tracked line items. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}' \
  -X PATCH \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}

**Delete Supplier Return**

Permanently deletes a draft supplier return that hasn't been authorized yet, for example one raised in
error. Once a return is authorized its stock adjustment has already happened, so only drafts can be deleted.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `supplier_return_id` | path | integer (int64) | yes | The unique identifier of the supplier return. |

**Response** `200` `PurchaseSupplierReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the supplier return. |
| `number` | string |  | Reference number of the supplier return. |
| `status` | string |  | Current status of the supplier return. |
| `reason` | string |  | Reason the goods are being returned to the supplier. |
| `resolution` | string |  | How the return is expected to be resolved, for example a credit or a replacement. |
| `comments` | string |  | Notes about the return. |
| `created_at` | string (date-time) |  | When the supplier return was created. |
| `authorized_at` | string (date-time) |  | When the supplier return was authorized. Null while still in draft. |
| `line_items` | PurchaseSupplierReturnLineItem[] |  | Line items being returned to the supplier. |
| `currency` | string |  | Currency the return's amounts are expressed in. |
| `subtotal` | number (double) |  | Sum of quantity x price across the return's line items and custom charge lines, before tax. |
| `tax_total` | number (double) |  | Total tax across the return's line items and custom charge lines. |
| `total` | number (double) |  | Subtotal plus tax, unless the order's prices are already tax-inclusive. |
| `units_to_return` | number (double) |  | Total quantity being returned across the return's tracked line items. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}/authorize

**Authorize Supplier Return**

Authorizes a draft supplier return, reducing on-hand inventory to reflect the goods sent back so your
stock stays accurate. Only draft returns can be authorized.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `supplier_return_id` | path | integer (int64) | yes | The unique identifier of the supplier return. |

**Response** `200` `PurchaseSupplierReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the supplier return. |
| `number` | string |  | Reference number of the supplier return. |
| `status` | string |  | Current status of the supplier return. |
| `reason` | string |  | Reason the goods are being returned to the supplier. |
| `resolution` | string |  | How the return is expected to be resolved, for example a credit or a replacement. |
| `comments` | string |  | Notes about the return. |
| `created_at` | string (date-time) |  | When the supplier return was created. |
| `authorized_at` | string (date-time) |  | When the supplier return was authorized. Null while still in draft. |
| `line_items` | PurchaseSupplierReturnLineItem[] |  | Line items being returned to the supplier. |
| `currency` | string |  | Currency the return's amounts are expressed in. |
| `subtotal` | number (double) |  | Sum of quantity x price across the return's line items and custom charge lines, before tax. |
| `tax_total` | number (double) |  | Total tax across the return's line items and custom charge lines. |
| `total` | number (double) |  | Subtotal plus tax, unless the order's prices are already tax-inclusive. |
| `units_to_return` | number (double) |  | Total quantity being returned across the return's tracked line items. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}/line_items/{line_item_id}

**Delete Supplier Return Line Item**

Removes a single line item from a draft supplier return, for example a product you've decided to
keep after all. Only allowed while the return is still a draft, and only when it's not the only item
left, a return must always keep at least one line.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `supplier_return_id` | path | integer (int64) | yes | The unique identifier of the supplier return. |
| `line_item_id` | path | integer (int64) | yes | The unique identifier of the supplier return line item. |

**Response** `200` `PurchaseSupplierReturn`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the supplier return. |
| `number` | string |  | Reference number of the supplier return. |
| `status` | string |  | Current status of the supplier return. |
| `reason` | string |  | Reason the goods are being returned to the supplier. |
| `resolution` | string |  | How the return is expected to be resolved, for example a credit or a replacement. |
| `comments` | string |  | Notes about the return. |
| `created_at` | string (date-time) |  | When the supplier return was created. |
| `authorized_at` | string (date-time) |  | When the supplier return was authorized. Null while still in draft. |
| `line_items` | PurchaseSupplierReturnLineItem[] |  | Line items being returned to the supplier. |
| `currency` | string |  | Currency the return's amounts are expressed in. |
| `subtotal` | number (double) |  | Sum of quantity x price across the return's line items and custom charge lines, before tax. |
| `tax_total` | number (double) |  | Total tax across the return's line items and custom charge lines. |
| `total` | number (double) |  | Subtotal plus tax, unless the order's prices are already tax-inclusive. |
| `units_to_return` | number (double) |  | Total quantity being returned across the return's tracked line items. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}/line_items/{line_item_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

