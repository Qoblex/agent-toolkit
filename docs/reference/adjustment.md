# Adjustment

An adjustment records a deliberate change to on-hand stock that is not a sale, purchase, or transfer, for example a stocktake correction, damage, or a manual recount. Each adjustment holds the affected variants, the counted or delta quantities, batch assignments where stock is batch-tracked, and a reconcile-then-authorize workflow. Use these endpoints to create adjustments, manage and reconcile their line items, and authorize them so the inventory ledger is updated.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

12 endpoints.

### GET /v1/adjustments

**List Adjustments**

Returns your stock adjustments, so you can browse the corrections and stocktakes recorded
across your locations. Results are sorted by creation date and returned in pages.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Adjustment page number to return. |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |

**Response** `200` `AdjustmentBaseListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | AdjustmentBase[] |  | The list of items. |
| `count` | integer (int32) |  | The total number of items in the list. |
| `filtered_count` | integer (int32) |  | The total number of items in the list after applying filters, if any. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/adjustments

**Create Adjustment**

Creates a stock adjustment at a given location, so you can record a correction or a
stocktake result against your on-hand quantities. The location must be able to hold
inventory - Warehouse locations only can be adjusted. New adjustments always start in
`Draft` mode and leave inventory untouched until you authorize them via
`POST /v1/adjustments/{id}/authorize`, giving you room to review before anything posts.

**Request body** `UpsertAdjustment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reason` | string | yes | The reason or justification for creating the adjustment. |
| `location_id` | integer (int32) |  | The ID of the location where the adjustment is applied. |
| `number` | string |  | Custom reference number for the adjustment. If not provided, it will be auto-generated. |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `type` | enum(`Simple`, `Advanced`) |  | Whether the adjustment is Simple or Advanced. The caller must specify this; it is not defaulted server-side (defaults to Simple when the adjustment is created without it). |
| `author_id` | integer (int32) |  | The user the adjustment is attributed to. Defaults to the caller when omitted, and is ignored once the adjustment is authorized. Must be a user of the caller's tenant. |
| `line_items` | UpsertAdjustmentLineItem[] |  |  |

**Response** `200` `AdjustmentWithLineItems`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | AdjustmentItemDto[] |  | The line items created or modified by this operation. Only items touched by the request are included; unchanged lines are omitted. |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `author_id` | integer (int64) |  | ID of the user who created the adjustment. |
| `id` | integer (int64) |  | Unique identifier of the adjustment. |
| `number` | string |  | Reference number of the adjustment. |
| `created_at` | string (date-time) |  | The date and time when the adjustment was created. |
| `reason` | string |  | The reason for the adjustment. |
| `status` | string |  | Current status of the adjustment |
| `units` | number (double) |  | Total number of units involved in the adjustment. |
| `total` | number (double) |  | Total monetary of the adjustment. |
| `cost_variance` | number (double) |  | Total value impact of quantity variances across all adjustment lines, calculated at the cost of each item at reconciliation time. Null when the adjustment has not been reconciled. |
| `version` | string |  | The version of the adjustment. |
| `type` | string |  | Whether the adjustment is Simple (final quantities set directly, no reconciliation) or Advanced (goes through the scan-session/reconciliation workflow before authorization). |
| `location` | AdjustmentLocation |  | The location associated with the adjustment. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/adjustments/{id}

**Get Adjustment**

Retrieves a single stock adjustment by its ID, so you can review a specific correction or
stocktake and its current state.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the stock adjustment. For example, `1024`. |

**Response** `200` `AdjustmentDetails`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `author_id` | integer (int64) |  | ID of the user who created the adjustment. |
| `id` | integer (int64) |  | Unique identifier of the adjustment. |
| `number` | string |  | Reference number of the adjustment. |
| `created_at` | string (date-time) |  | The date and time when the adjustment was created. |
| `reason` | string |  | The reason for the adjustment. |
| `status` | string |  | Current status of the adjustment |
| `units` | number (double) |  | Total number of units involved in the adjustment. |
| `total` | number (double) |  | Total monetary of the adjustment. |
| `cost_variance` | number (double) |  | Total value impact of quantity variances across all adjustment lines, calculated at the cost of each item at reconciliation time. Null when the adjustment has not been reconciled. |
| `version` | string |  | The version of the adjustment. |
| `type` | string |  | Whether the adjustment is Simple (final quantities set directly, no reconciliation) or Advanced (goes through the scan-session/reconciliation workflow before authorization). |
| `location` | AdjustmentLocation |  | The location associated with the adjustment. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### PUT /v1/adjustments/{id}

**Update Adjustment**

Updates an existing draft stock adjustment, so you can revise a correction or stocktake
before it posts. You can change its line items, quantities, and adjustment details in a
single request.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes |  |

**Request body** `UpsertAdjustment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reason` | string | yes | The reason or justification for creating the adjustment. |
| `location_id` | integer (int32) |  | The ID of the location where the adjustment is applied. |
| `number` | string |  | Custom reference number for the adjustment. If not provided, it will be auto-generated. |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `type` | enum(`Simple`, `Advanced`) |  | Whether the adjustment is Simple or Advanced. The caller must specify this; it is not defaulted server-side (defaults to Simple when the adjustment is created without it). |
| `author_id` | integer (int32) |  | The user the adjustment is attributed to. Defaults to the caller when omitted, and is ignored once the adjustment is authorized. Must be a user of the caller's tenant. |
| `line_items` | UpsertAdjustmentLineItem[] |  |  |

**Response** `200` `AdjustmentWithLineItems`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | AdjustmentItemDto[] |  | The line items created or modified by this operation. Only items touched by the request are included; unchanged lines are omitted. |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `author_id` | integer (int64) |  | ID of the user who created the adjustment. |
| `id` | integer (int64) |  | Unique identifier of the adjustment. |
| `number` | string |  | Reference number of the adjustment. |
| `created_at` | string (date-time) |  | The date and time when the adjustment was created. |
| `reason` | string |  | The reason for the adjustment. |
| `status` | string |  | Current status of the adjustment |
| `units` | number (double) |  | Total number of units involved in the adjustment. |
| `total` | number (double) |  | Total monetary of the adjustment. |
| `cost_variance` | number (double) |  | Total value impact of quantity variances across all adjustment lines, calculated at the cost of each item at reconciliation time. Null when the adjustment has not been reconciled. |
| `version` | string |  | The version of the adjustment. |
| `type` | string |  | Whether the adjustment is Simple (final quantities set directly, no reconciliation) or Advanced (goes through the scan-session/reconciliation workflow before authorization). |
| `location` | AdjustmentLocation |  | The location associated with the adjustment. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}' \
  -X PUT \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/adjustments/{id}

**Delete Adjustment**

Permanently deletes a draft stock adjustment, so you can discard a correction or stocktake
you no longer need. Only adjustments that have not been authorized can be deleted, since an
authorized adjustment has already changed your stock; to reverse one that has posted, create
a new adjustment instead.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the stock adjustment to delete. For example, `1024`. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/adjustments/{id}/authorize

**Authorize Adjustment**

Authorizes a draft adjustment, posting it to your inventory and locking the stocktake so it
becomes read-only. This is the step that actually moves your stock, so a stocktake can only be
authorized once every line has been reconciled. For batch-tracked lines you can pass batch
allocations in `line_items` and authorize in one request, instead of a separate call to
`POST /{id}/batches` first.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the draft adjustment to authorize. For example, `1024`. |

**Request body** `Qoblex.Api.Adjustments.Dtos.AuthorizeAdjustmentDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | AdjustmentLineItemReservation[] |  | Batch allocations for batch-tracked lines, applied atomically together with the authorization. Omit when no line on this adjustment is batch-tracked. |

**Response** `200` `AdjustmentDetails`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `author_id` | integer (int64) |  | ID of the user who created the adjustment. |
| `id` | integer (int64) |  | Unique identifier of the adjustment. |
| `number` | string |  | Reference number of the adjustment. |
| `created_at` | string (date-time) |  | The date and time when the adjustment was created. |
| `reason` | string |  | The reason for the adjustment. |
| `status` | string |  | Current status of the adjustment |
| `units` | number (double) |  | Total number of units involved in the adjustment. |
| `total` | number (double) |  | Total monetary of the adjustment. |
| `cost_variance` | number (double) |  | Total value impact of quantity variances across all adjustment lines, calculated at the cost of each item at reconciliation time. Null when the adjustment has not been reconciled. |
| `version` | string |  | The version of the adjustment. |
| `type` | string |  | Whether the adjustment is Simple (final quantities set directly, no reconciliation) or Advanced (goes through the scan-session/reconciliation workflow before authorization). |
| `location` | AdjustmentLocation |  | The location associated with the adjustment. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}/authorize' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/adjustments/{id}/batches

**Assign Batches**

Assigns batch-level quantities to the lines of a stock adjustment, so batch-tracked
stock is counted against the exact batches it belongs to. A single line item can be
split across several batches, and positive quantities add stock while negative
quantities remove it.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the stock adjustment. For example, `1024`. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_item_id` | integer (int32) |  | The adjustment line item being assigned batches. |
| `batches` | AdjustmentBatchReservationOperation[] |  | List of batches to adjust for this line item. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}/batches' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/adjustments/{id}/duplicate

**Duplicate Adjustment**

Creates a new `Draft` adjustment by copying an existing one, handy for repeating a
recurring count at the same location. It copies the location, the reason, and the set of
product variants on the source's line items.

Every copied line starts as a no-op: `Set` to the variant's current on-hand quantity
at that location, exactly as if you had just added the variant by hand. Nothing moves in
your inventory until you enter your own counts, so the copy is safe to open and review.

Comments, the adjustment number, status, authorization date, scanning sessions, batch
assignments, reconciliation state, and quantity and cost variances are never carried over.
The copy is always a Simple adjustment attributed to you, and any line whose variant has
since been deleted, made untracked, or removed from your inventory is left out.
Adjustments in any status can be duplicated, including authorized ones, and the original
is never modified.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the adjustment to duplicate. For example, `1024`. |

**Response** `200` `AdjustmentWithLineItems`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | AdjustmentItemDto[] |  | The line items created or modified by this operation. Only items touched by the request are included; unchanged lines are omitted. |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `author_id` | integer (int64) |  | ID of the user who created the adjustment. |
| `id` | integer (int64) |  | Unique identifier of the adjustment. |
| `number` | string |  | Reference number of the adjustment. |
| `created_at` | string (date-time) |  | The date and time when the adjustment was created. |
| `reason` | string |  | The reason for the adjustment. |
| `status` | string |  | Current status of the adjustment |
| `units` | number (double) |  | Total number of units involved in the adjustment. |
| `total` | number (double) |  | Total monetary of the adjustment. |
| `cost_variance` | number (double) |  | Total value impact of quantity variances across all adjustment lines, calculated at the cost of each item at reconciliation time. Null when the adjustment has not been reconciled. |
| `version` | string |  | The version of the adjustment. |
| `type` | string |  | Whether the adjustment is Simple (final quantities set directly, no reconciliation) or Advanced (goes through the scan-session/reconciliation workflow before authorization). |
| `location` | AdjustmentLocation |  | The location associated with the adjustment. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}/duplicate' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/adjustments/{id}/items

**List Adjustment Items**

Returns the line items of a specific adjustment, so you can review the products, quantities,
and variances that make it up. Results are paginated, and you can filter and sort them using
the `filters` and `sort_by` query parameters.

Filterable/sortable properties: `id`, `product_variant.name`, `sku`,
`reconciliation_status`, `operation`, `total`, `quantity`,
`cost`, `quantity_variance`, `cost_variance`. Filterable only:
`product_variant.is_batch_tracked`.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the adjustment. For example, `1024`. |
| `page` | query | integer (int32) |  | Page number to return. |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |
| `expand` | query | string |  | Comma-separated list of relations to expand in the response. Supported values: - `session_lines`: include stocktake scan lines recorded per user for each item - `batch_usages`: include batch/lot allocations recorded for each batch-tracked item |

**Response** `200` `AdjustmentItemDtoListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | AdjustmentItemDto[] |  | The list of items. |
| `count` | integer (int32) |  | The total number of items in the list. |
| `filtered_count` | integer (int32) |  | The total number of items in the list after applying filters, if any. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}/items' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/adjustments/{id}/items

**Delete Adjustment Items**

Removes selected line items from a draft adjustment, so you can drop products that were
added by mistake or should not be counted. Only the line items you name are deleted; the
rest of the adjustment is left untouched.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes |  |

**Request body**

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}/items' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/adjustments/{id}/reconcile

**Reconcile Adjustment**

Reconciles a stocktake by writing the final approved quantity for one or more selected
line items, turning raw scanner counts into the numbers you will post. Scanner counts are
preserved as audit history and are not modified.
Only line items explicitly included in the request are reconciled — others remain unchanged.

Every line to reconcile is listed in `items` by `line_item_id`. By default
(`strategy: SetQuantity`) the caller also supplies `final_quantity` per line, as a
single admin decision typed for one line at a time. To reconcile several selected lines at
once without typing a quantity for each one, set `strategy` to `AcceptScanner`,
`Merge`, `AcceptSystem`, or `AcceptSuggestion`; `final_quantity` is then
ignored and the final quantity for each line is computed from the scanners' counts instead.
A line that cannot be resolved with the chosen strategy (for example, the chosen scanner
never counted it) is skipped rather than failing the request, and reported back in
`skipped_lines`.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the draft stocktake adjustment being reconciled. |

**Request body** `ReconcileAdjustment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `strategy` | enum(`set_quantity`, `accept_scanner`, `merge`, `accept_system`, `accept_suggestion`) |  | How the final quantity is determined for each line in `items`. Defaults to `SetQuantity`, which writes the `final_quantity` supplied for each line. The other strategies ignore `final_quantity` and compute it from the scanners' counts instead. |
| `user_id` | integer (int32) |  | The user whose scan counts to use. Required when `strategy` is `AcceptScanner`. |
| `items` | ReconcileAdjustmentItem[] |  | The lines to reconcile. Every line is identified by `line_item_id`; `final_quantity` is required only when `strategy` is `SetQuantity` and is otherwise ignored, since the other strategies compute the final quantity from the scanners' counts. Lines that cannot be resolved with the chosen strategy are skipped and reported in the response instead of failing the whole request. |

**Response** `200` `ReconciliationResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `line_items` | AdjustmentItemDto[] |  | The line items reconciled by this operation. Only items touched by the request are included; unchanged lines are omitted. |
| `applied_count` | integer (int32) |  | The number of requested lines that were successfully reconciled. |
| `requested_count` | integer (int32) |  | The number of lines that were requested for this action. |
| `skipped_lines` | SkippedReconciliationLine[] |  | Lines that could not be reconciled with the chosen strategy, and why. Every line requested by a `SetQuantity` reconcile is always applied, so this is only ever populated for the other bulk strategies. |
| `comments` | string |  | Additional notes or comments about the adjustment. |
| `author_id` | integer (int64) |  | ID of the user who created the adjustment. |
| `id` | integer (int64) |  | Unique identifier of the adjustment. |
| `number` | string |  | Reference number of the adjustment. |
| `created_at` | string (date-time) |  | The date and time when the adjustment was created. |
| `reason` | string |  | The reason for the adjustment. |
| `status` | string |  | Current status of the adjustment |
| `units` | number (double) |  | Total number of units involved in the adjustment. |
| `total` | number (double) |  | Total monetary of the adjustment. |
| `cost_variance` | number (double) |  | Total value impact of quantity variances across all adjustment lines, calculated at the cost of each item at reconciliation time. Null when the adjustment has not been reconciled. |
| `version` | string |  | The version of the adjustment. |
| `type` | string |  | Whether the adjustment is Simple (final quantities set directly, no reconciliation) or Advanced (goes through the scan-session/reconciliation workflow before authorization). |
| `location` | AdjustmentLocation |  | The location associated with the adjustment. |

```bash
curl -sS 'https://api.qoblex.com/v1/adjustments/{id}/reconcile' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/adjustments/stocktake/csv

**Import Stocktake CSV**

Uploads a stocktake count CSV for a location and processes it in the background, one byte-range
chunk at a time, so very large variant catalogs no longer time out the request. Every field change
other than quantity/cost (buffer, min/max inventory, barcode, bin, overselling, supplier SKU) is
applied as its page is processed. Quantity and cost changes are collected across the whole file
into a single stock adjustment, created and authorized once as the last step. Poll the returned
job via `GET /v1/jobs` to follow progress and completion.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `location_id` | query | integer (int32) |  | The location the stocktake count applies to. |

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
curl -sS 'https://api.qoblex.com/v1/adjustments/stocktake/csv' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

