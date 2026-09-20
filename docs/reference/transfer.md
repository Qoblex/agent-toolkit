# Transfer

A transfer moves stock from one of your locations to another, for example replenishing a store from a central warehouse. Each transfer records the source and destination, the variants and quantities moved, and batch assignments where stock is batch-tracked. Use these endpoints to create transfers and assign the specific batches being shipped.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

3 endpoints.

### POST /v1/transfers

**Create Transfer**

Creates a stock transfer to move inventory from a source location to a destination
location for one or more product variants, so you can shift stock between your
warehouses. Once the transfer is created, you can assign specific batches to it before
the transfer is authorized.

**Request body** `CreateTransfer`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `source_location_id` | integer (int32) |  | The unique identifier of the location stock will be transferred from. |
| `destination_location_id` | integer (int32) |  | The unique identifier of the location stock will be transferred to. |
| `line_items` | TransferLineItem[] |  | List of product variants and quantities to transfer. |

**Response** `200` `Transfer`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the created transfer. |
| `number` | string |  | Human-readable reference for the transfer, for example `TR-000000123`. |
| `status` | enum(`Draft`, `Received`) |  | Current status of the transfer: `Draft` while it can still be edited, or `Received` once it has been authorized and the stock has moved to the destination. |
| `source_location` | string |  | Name of the location stock is being transferred from. |
| `destination_location` | string |  | Name of the location stock is being transferred to. |
| `transfer_date` | string (date-time) |  | Date and time when the transfer was created. |
| `received_at` | string (date-time) |  | Date and time the transfer was authorized and the stock moved to the destination. Null until the transfer has been authorized. |

```bash
curl -sS 'https://api.qoblex.com/v1/transfers' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/transfers/{id}/authorize

**Authorize Transfer**

Authorizes a draft transfer, moving the stock from the source location to the destination
location and marking the transfer as received. This is the step that actually changes your
inventory, so once a transfer is authorized it becomes read-only. For batch-tracked lines,
assign the batches being shipped via `POST /{id}/batches` before authorizing.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Identifier of the transfer to authorize. Example: `4821`. |

**Response** `200` `Transfer`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the created transfer. |
| `number` | string |  | Human-readable reference for the transfer, for example `TR-000000123`. |
| `status` | enum(`Draft`, `Received`) |  | Current status of the transfer: `Draft` while it can still be edited, or `Received` once it has been authorized and the stock has moved to the destination. |
| `source_location` | string |  | Name of the location stock is being transferred from. |
| `destination_location` | string |  | Name of the location stock is being transferred to. |
| `transfer_date` | string (date-time) |  | Date and time when the transfer was created. |
| `received_at` | string (date-time) |  | Date and time the transfer was authorized and the stock moved to the destination. Null until the transfer has been authorized. |

```bash
curl -sS 'https://api.qoblex.com/v1/transfers/{id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/transfers/{id}/batches

**Assign Batches**

Assigns batches to a stock transfer, recording exactly which batches are moving between
your locations and how much quantity comes from each. When you move stock that is
batch-tracked, this tells the transfer which specific batches to pull from the source
location. A single line item can draw from more than one batch.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | Identifier of the transfer to assign batches to. Example: `4821`. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_item_id` | integer (int32) |  | Unique identifier of the transfer line item being assigned batches. |
| `batches` | TransferBatchReservationOperation[] |  | List of batches to transfer for this line item. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/transfers/{id}/batches' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

