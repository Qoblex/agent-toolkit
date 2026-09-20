# Goods Receipt Notes

Goods receipt notes record stock arriving against a purchase order. Create a draft as goods come in, assign batches where items are batch-tracked, then authorize the note to move the received quantities into inventory and spread any landed costs across them.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

7 endpoints.

### POST /v1/purchase_orders/{id}/goods_receipt_notes

**Create Goods Receipt Note**

Records goods arriving against a purchase order by creating a draft goods receipt note. Omit
line_items to receive the full remaining quantity on every line, or send specific line items and
quantities for a partial delivery. The note starts as a draft, authorize it separately to move the
stock into inventory.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |

**Request body** `CreatePurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. Defaults to the purchase order's location when omitted. |
| `carrier` | string |  | Carrier used for delivery. |
| `shipping_method` | string |  | Shipping method used. |
| `tracking_code` | string |  | Shipment tracking code. |
| `comments` | string |  | Notes about the receipt. |
| `line_items` | CreatePurchaseGoodsReceiptNoteLineItem[] |  | Line items to receive, and the quantity to receive for each. Omit to receive the full remaining quantity on every line. |

**Response** `200` `PurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the goods receipt note. |
| `number` | string |  | Reference number of the goods receipt note. |
| `status` | string |  | Current status of the goods receipt note. |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. |
| `carrier` | string |  | Carrier used for delivery. |
| `shipping_method` | string |  | Shipping method used. |
| `tracking_code` | string |  | Shipment tracking code. |
| `comments` | string |  | Notes about the receipt. |
| `created_at` | string (date-time) |  | When the goods receipt note was created. |
| `authorized_at` | string (date-time) |  | When the goods receipt note was authorized. Null while still in draft. |
| `line_items` | PurchaseGoodsReceiptNoteLineItem[] |  | Line items received on this goods receipt note. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/goods_receipt_notes' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}

**Get Goods Receipt Note**

Retrieves a single goods receipt note by its identifier, with its line items and any batches
assigned to them, so you can review exactly what was received. Use the expand parameter to pull in
related detail in the same call.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `grn_id` | path | integer (int64) | yes | The unique identifier of the goods receipt note. |
| `expand` | query | string |  | Comma-separated list of related resources to include in the response. Supported values: - `order_items` — include the purchase order line item each receipt line was created against. - `batches` — include the batch number and expiry date for each batch usage. |

**Response** `200` `PurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the goods receipt note. |
| `number` | string |  | Reference number of the goods receipt note. |
| `status` | string |  | Current status of the goods receipt note. |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. |
| `carrier` | string |  | Carrier used for delivery. |
| `shipping_method` | string |  | Shipping method used. |
| `tracking_code` | string |  | Shipment tracking code. |
| `comments` | string |  | Notes about the receipt. |
| `created_at` | string (date-time) |  | When the goods receipt note was created. |
| `authorized_at` | string (date-time) |  | When the goods receipt note was authorized. Null while still in draft. |
| `line_items` | PurchaseGoodsReceiptNoteLineItem[] |  | Line items received on this goods receipt note. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### PATCH /v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}

**Update Goods Receipt Note**

Updates a draft goods receipt note, for example to correct the receiving location, carrier, tracking
details, comments, or received quantities before you authorize it. Only the fields you send are changed,
and updates are only allowed while the note is still a draft.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `grn_id` | path | integer (int64) | yes | The unique identifier of the goods receipt note. |

**Request body** `UpdatePurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. Left unchanged when omitted. |
| `carrier` | string |  | Carrier used for delivery. Left unchanged when omitted. |
| `shipping_method` | string |  | Shipping method used. Left unchanged when omitted. |
| `tracking_code` | string |  | Shipment tracking code. Left unchanged when omitted. |
| `comments` | string |  | Notes about the receipt. Left unchanged when omitted. |
| `line_items` | UpdatePurchaseGoodsReceiptNoteLineItem[] |  | Line item quantity updates. Line items not listed here are left unchanged. |

**Response** `200` `PurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the goods receipt note. |
| `number` | string |  | Reference number of the goods receipt note. |
| `status` | string |  | Current status of the goods receipt note. |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. |
| `carrier` | string |  | Carrier used for delivery. |
| `shipping_method` | string |  | Shipping method used. |
| `tracking_code` | string |  | Shipment tracking code. |
| `comments` | string |  | Notes about the receipt. |
| `created_at` | string (date-time) |  | When the goods receipt note was created. |
| `authorized_at` | string (date-time) |  | When the goods receipt note was authorized. Null while still in draft. |
| `line_items` | PurchaseGoodsReceiptNoteLineItem[] |  | Line items received on this goods receipt note. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}' \
  -X PATCH \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}

**Delete Goods Receipt Note**

Permanently deletes a draft goods receipt note, for example one created in error before the goods
were actually received. Only drafts can be deleted, once a note is authorized its stock has already
moved into inventory and it can no longer be removed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `grn_id` | path | integer (int64) | yes | The unique identifier of the goods receipt note. |

**Response** `200` `PurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the goods receipt note. |
| `number` | string |  | Reference number of the goods receipt note. |
| `status` | string |  | Current status of the goods receipt note. |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. |
| `carrier` | string |  | Carrier used for delivery. |
| `shipping_method` | string |  | Shipping method used. |
| `tracking_code` | string |  | Shipment tracking code. |
| `comments` | string |  | Notes about the receipt. |
| `created_at` | string (date-time) |  | When the goods receipt note was created. |
| `authorized_at` | string (date-time) |  | When the goods receipt note was authorized. Null while still in draft. |
| `line_items` | PurchaseGoodsReceiptNoteLineItem[] |  | Line items received on this goods receipt note. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/authorize

**Authorize Goods Receipt Note**

Authorizes a draft goods receipt note, moving its line items into inventory so on-hand stock reflects
the delivery. Authorizing also spreads any landed costs across the received items, so this is the step
that finalizes both stock levels and the true cost of what you received.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `grn_id` | path | integer (int64) | yes | The unique identifier of the goods receipt note. |

**Response** `200` `PurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the goods receipt note. |
| `number` | string |  | Reference number of the goods receipt note. |
| `status` | string |  | Current status of the goods receipt note. |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. |
| `carrier` | string |  | Carrier used for delivery. |
| `shipping_method` | string |  | Shipping method used. |
| `tracking_code` | string |  | Shipment tracking code. |
| `comments` | string |  | Notes about the receipt. |
| `created_at` | string (date-time) |  | When the goods receipt note was created. |
| `authorized_at` | string (date-time) |  | When the goods receipt note was authorized. Null while still in draft. |
| `line_items` | PurchaseGoodsReceiptNoteLineItem[] |  | Line items received on this goods receipt note. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/batches

**Assign Batches**

Records which specific batches or lots you received for each product on a goods receipt note, so
batch-tracked stock stays accurate for traceability and recalls. You can split one line item across
several batches, and set expiry dates on batches where that applies.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `grn_id` | path | integer (int64) | yes | The unique identifier of the goods receipt note. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_item_id` | integer (int32) |  | The GRN line item being assigned batches. |
| `batches` | PurchaseBatchAssignment[] |  | List of batches received for this line item. |
| `batch_generator` | PurchaseBatchSequenceExpression |  |  |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the batch transaction record. |
| `batch_id` | integer (int32) |  | Unique identifier of the batch. |
| `goods_receipt_note_line_item_id` | integer (int32) |  | The GRN line item this batch is associated with. |
| `quantity` | number (double) |  | Quantity recorded into this batch. |
| `created_at` | string (date-time) |  | Timestamp when the batch record was created. |
| `authorized_at` | string (date-time) |  | Timestamp when the batch transaction was authorized. |
| `closing_quantity` | number (double) |  | Total stock quantity in this batch after the transaction. |
| `type` | enum(`None`, `Transfer`, `Adjustment`, `Shipment`, `GoodsReceiptNote`, `AssemblyOrder`, `ReverseShipment`, `SaleReturn`, `SupplierReturn`) |  | Type of inventory transaction. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/batches' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/line_items/{line_item_id}

**Delete Goods Receipt Note Line Item**

Removes a single line item from a draft goods receipt note, for example a product that didn't
actually arrive in this delivery. Only allowed while the note is still a draft, and only when it's
not the last remaining line, a receipt must always keep at least one item.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the purchase order. |
| `grn_id` | path | integer (int64) | yes | The unique identifier of the goods receipt note. |
| `line_item_id` | path | integer (int64) | yes | The unique identifier of the goods receipt note line item. |

**Response** `200` `PurchaseGoodsReceiptNote`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the goods receipt note. |
| `number` | string |  | Reference number of the goods receipt note. |
| `status` | string |  | Current status of the goods receipt note. |
| `location_id` | integer (int32) |  | Unique identifier of the location where goods are received. |
| `carrier` | string |  | Carrier used for delivery. |
| `shipping_method` | string |  | Shipping method used. |
| `tracking_code` | string |  | Shipment tracking code. |
| `comments` | string |  | Notes about the receipt. |
| `created_at` | string (date-time) |  | When the goods receipt note was created. |
| `authorized_at` | string (date-time) |  | When the goods receipt note was authorized. Null while still in draft. |
| `line_items` | PurchaseGoodsReceiptNoteLineItem[] |  | Line items received on this goods receipt note. |

```bash
curl -sS 'https://api.qoblex.com/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/line_items/{line_item_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

