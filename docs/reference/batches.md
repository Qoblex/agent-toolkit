# Batches

Batches (or lots) track stock at a finer grain than the variant, each with its own batch number and expiry date, for traceability, recalls, and FEFO picking. Create and update batches, review them per variant or across the whole account, follow the batch operation audit trail, and trace a batch upstream to its origin and downstream to where it was consumed or shipped.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

4 endpoints.

### GET /v1/batches

**List Batches**

Retrieves your batches. Filter and sort by any supported field to surface batches nearing expiry
or low on stock - for example narrow to a single variant with `filters=product_variant.id==4821` -
and page through large accounts.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Page number for pagination. |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |

**Response** `200` `ProductBatchListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | ProductBatch[] |  | The list of items. |
| `count` | integer (int32) |  | The total number of items in the list. |
| `filtered_count` | integer (int32) |  | The total number of items in the list after applying filters, if any. |

```bash
curl -sS 'https://api.qoblex.com/v1/batches' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/batches

**Upsert Batches**

Creates and updates batches in a single request. Each item that carries an `id` updates that
batch (for example its lot number, expiry date, or on-hand quantity); each item without an
`id` creates a new batch for its variant. Setting a quantity on either records the change as
an auto-authorized inventory adjustment; a new batch starts at zero, so its full quantity is
adjusted in. The whole request is applied together: if any item fails, none of the changes are saved.

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Identifier of the batch to update. Leave it out to create a new batch for the variant. |
| `product_variant_id` | integer (int32) | yes | Identifier of the product variant this batch belongs to. |
| `location_id` | integer (int32) |  | Identifier of the location the batch is held at. Required when creating a batch. |
| `number` | string |  | The batch or lot number. When creating a batch and left empty, a number is generated for you. |
| `expires_at` | string (date-time) |  | Expiry date of the batch, for shelf-life monitoring and FEFO picking. |
| `quantity` | number (double) |  | On-hand quantity for the batch. When it differs from the batch's current quantity, the change is recorded as an auto-authorized inventory adjustment. A new batch starts at zero, so the full quantity is adjusted in; on an update, leave it out to keep the current quantity unchanged. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the batch. |
| `location` | AccountLocation |  |  |
| `product_variant` | ProductVariantBase |  | List of variants. Each variant represents a specific version of a product with its own attributes. |
| `number` | string |  | The batch or lot number. |
| `quantity` | number (double) |  | Current stock quantity in this batch. |
| `reserved_quantity` | number (double) |  | Quantity currently reserved for outgoing orders. |
| `cost` | number (double) |  | Cost associated with this batch. |
| `expires_at` | string (date-time) |  | Expiry date of the batch. |
| `created_at` | string (date-time) |  | Timestamp when the batch was created. |
| `updated_at` | string (date-time) |  | Timestamp when the batch was last updated. |

```bash
curl -sS 'https://api.qoblex.com/v1/batches' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/batches/{batch_id}

**Delete Batch**

Deletes a batch, letting you clean up lots you no longer track. Deleting a batch that still holds
stock or has active reservations can cause inventory discrepancies, so delete only batches with a
quantity of zero.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `batch_id` | path | integer (int32) | yes | Unique identifier of the batch to delete. Example: `9032`. |

**Response** `200` `ProductBatch`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the batch. |
| `location` | AccountLocation |  |  |
| `product_variant` | ProductVariantBase |  | List of variants. Each variant represents a specific version of a product with its own attributes. |
| `number` | string |  | The batch or lot number. |
| `quantity` | number (double) |  | Current stock quantity in this batch. |
| `reserved_quantity` | number (double) |  | Quantity currently reserved for outgoing orders. |
| `cost` | number (double) |  | Cost associated with this batch. |
| `expires_at` | string (date-time) |  | Expiry date of the batch. |
| `created_at` | string (date-time) |  | Timestamp when the batch was created. |
| `updated_at` | string (date-time) |  | Timestamp when the batch was last updated. |

```bash
curl -sS 'https://api.qoblex.com/v1/batches/{batch_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/batches/{batch_id}/trace

**Get Trace**

Retrieves end-to-end traceability for a batch, showing where its stock originated (upstream)
and where it was consumed or shipped (downstream). Use it for quality control, product
recalls, and inventory audits across receipts, sales, transfers, adjustments, returns, and
manufacturing orders.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `batch_id` | path | integer (int32) | yes | Unique identifier of the batch to trace. Example: `9032`. |
| `direction` | query | enum(`upstream`, `downstream`, `both`) |  | The tracing direction. |

**Response** `200` `BatchTrace`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `summary` | BatchTraceSummary |  |  |
| `upstream` | BatchTraceOperation[] |  |  |
| `downstream` | BatchTraceOperation[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/batches/{batch_id}/trace' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

