# Manufacturing Orders

A manufacturing order describes how finished goods are assembled from their component variants. It captures the product being built, the components consumed, quantities, and batch tracking for both the inputs and the finished output. Use these endpoints to manage manufacturing orders and assign batches so production is reflected accurately in stock and cost.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

7 endpoints.

### GET /v1/manufacturing_orders

**List Orders**

Returns your manufacturing orders, most recent first, in pages. Use this to browse production
work across its lifecycle, filter by status or manufacturer, and page through the full set to
build your own production view.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Specifies the page number for pagination. |
| `expand` | query | string |  | Comma-separated list of related resources to include in the response. Supported values: - `line_items.product_variant` — include each line item's variant details (sku, name, image). |
| `filters` | query | string |  | Filters to apply on the manufacturing order list: property operator value. Supported properties: - `id` - `number` - `reference` - `type` — `ProductionAssembly` or `ProductionDisassembly`. - `status` — `Draft`, `InProduction`, `Completed`, or `Canceled`. - `stock_status` — `AwaitingStock`, `ReadyToShip`, or `Fulfilled`. - `manufacturer_id` - `manufacturer.name` - `bill_of_material_variant_id` — the finished product variant being produced. - `location` — the manufacturing location id. - `created_at` - `updated_at` - `tag` - `deleted` — soft-deleted orders are included by default; filter `deleted==false` to exclude them. Supported operators: `==` (equals), `!=` (not equals), `@=*` (contains, case-insensitive), `>=` (greater than or equal) `<=` (less than or equal) String values must be double-quoted (e.g. `manufacturer.name@=*"acme"`). Combine multiple filters with `,` (AND) or `\|` (OR), with a space on each side of the operator. |
| `sort_by` | query | string |  | Sorting to apply on the manufacturing order list: prefix with - for descending, no prefix for ascending. Multiple sorts can be combined using commas. Defaults to `-created_at` (newest first) when omitted. Supported properties: - `id` - `number` - `reference` - `type` - `status` - `stock_status` - `manufacturer.name` - `location` - `created_at` - `updated_at` - `tag` - `deleted` Sorting is not supported on `manufacturer_id` or `bill_of_material_variant_id`. |

**Response** `200` `ManufacturingOrderListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | ManufacturingOrder[] |  | The list of items. |
| `count` | integer (int32) |  | The total number of items in the list. |
| `filtered_count` | integer (int32) |  | The total number of items in the list after applying filters, if any. |

```bash
curl -sS 'https://api.qoblex.com/v1/manufacturing_orders' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/manufacturing_orders

**Create Order**

Creates a new manufacturing order in draft. Provide the finished product variant to build (it must
be a bill of materials), the quantity to produce, the manufacturing location, and the manufacturer.
The order's component line items are copied from the finished variant's bill of materials, scaled to
the quantity you are producing; you can then add, amend, or remove them per order via the update
endpoint without changing the product's bill of materials. Start the order when you are ready to
reserve stock and move it into production.

**Request body** `CreateManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | Your own order number for the manufacturing order. Must be unique across your manufacturing orders. Omit it to have Qoblex assign one for you. |
| `type` | string |  | Whether the order assembles finished goods from components, or disassembles finished goods back into components. Accepts `ProductionAssembly` or `ProductionDisassembly`. Defaults to `ProductionAssembly` when omitted. |
| `bill_of_material_variant_id` | integer (int32) |  | Identifier of the finished product variant to produce. The variant must be a bill of materials. |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product to produce. Must be greater than zero. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured and stock is moved. |
| `manufacturer_id` | integer (int32) |  | Identifier of the manufacturer (contact) responsible for producing this order. |
| `reference` | string |  | Your own reference for the order. |
| `comments` | string |  | Notes visible on the order. |
| `private_notes` | string |  | Internal notes not shown on printed documents. |
| `tags` | string |  | Tags for categorization. |

**Response** `200` `ManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the manufacturing order. |
| `number` | string |  | Order number. |
| `type` | string |  | Whether the order assembles finished goods from components, or disassembles finished goods back into components. |
| `status` | string |  | Current status of the order in its production lifecycle. |
| `stock_status` | string |  | Whether the components needed for production are all in stock yet. |
| `reference` | string |  | Your own reference for the order. |
| `bill_of_material_variant_id` | integer (int32) |  | Identifier of the finished product variant this order produces (its bill of material). |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product this order is planned to produce. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured and stock is moved. |
| `manufacturer` | Manufacturer |  | The manufacturer (contact) responsible for producing a manufacturing order. |
| `created_at` | string (date-time) |  | Date and time when the order was created. |
| `last_updated_at` | string (date-time) |  | Date and time when the order was last updated. |
| `comments` | string |  | Notes visible on the order. |
| `private_notes` | string |  | Internal notes not shown on printed documents. |
| `tags` | string |  | Tags associated with the order for categorization. |
| `line_items` | ManufacturingOrderLineItem[] |  | The component line items consumed or produced by this order. |
| `overhead_lines` | ManufacturingOverheadLine[] |  | The overhead (extra-charge) lines added to this order, such as machinery time, services, or labour. |

```bash
curl -sS 'https://api.qoblex.com/v1/manufacturing_orders' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/manufacturing_orders/{id}

**Get Order**

Retrieves a single manufacturing order by its identifier, with the finished product it builds,
its planned quantity, the manufacturer and location, and its component line items,
so you can show a full production view in one call.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the manufacturing order. |
| `expand` | query | string |  | Comma-separated list of related resources to include in the response. Supported values: - `line_items.product_variant` — include each line item's variant details (sku, name, image). |

**Response** `200` `ManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the manufacturing order. |
| `number` | string |  | Order number. |
| `type` | string |  | Whether the order assembles finished goods from components, or disassembles finished goods back into components. |
| `status` | string |  | Current status of the order in its production lifecycle. |
| `stock_status` | string |  | Whether the components needed for production are all in stock yet. |
| `reference` | string |  | Your own reference for the order. |
| `bill_of_material_variant_id` | integer (int32) |  | Identifier of the finished product variant this order produces (its bill of material). |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product this order is planned to produce. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured and stock is moved. |
| `manufacturer` | Manufacturer |  | The manufacturer (contact) responsible for producing a manufacturing order. |
| `created_at` | string (date-time) |  | Date and time when the order was created. |
| `last_updated_at` | string (date-time) |  | Date and time when the order was last updated. |
| `comments` | string |  | Notes visible on the order. |
| `private_notes` | string |  | Internal notes not shown on printed documents. |
| `tags` | string |  | Tags associated with the order for categorization. |
| `line_items` | ManufacturingOrderLineItem[] |  | The component line items consumed or produced by this order. |
| `overhead_lines` | ManufacturingOverheadLine[] |  | The overhead (extra-charge) lines added to this order, such as machinery time, services, or labour. |

```bash
curl -sS 'https://api.qoblex.com/v1/manufacturing_orders/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/manufacturing_orders/{id}

**Update Order**

Updates a draft manufacturing order, changing only the fields you send and leaving everything
else as it was. Send an empty string to clear a text field. The order's component line items
start as a copy of the product's bill of materials, but you can add, amend, or remove them per
order without changing the product's bill of materials: when you send `line_items` it
replaces the order's current components (keep or amend a line by including its `id`, add a
line by omitting the `id`, and remove a line by leaving it out). A manufacturing order can
only be edited while it is in draft.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the manufacturing order to update. |

**Request body** `UpdateManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `number` | string |  | Your own order number for the manufacturing order. Omit to leave it unchanged. When supplied it must be unique across your manufacturing orders. |
| `reference` | string |  | Your own reference for the order. Send an empty string to clear it. |
| `comments` | string |  | Notes visible on the order. Send an empty string to clear them. |
| `private_notes` | string |  | Internal notes not shown on printed documents. Send an empty string to clear them. |
| `tags` | string |  | Tags for categorization. Send an empty string to clear them. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured. Omit to leave unchanged. |
| `manufacturer_id` | integer (int32) |  | Identifier of the manufacturer responsible for the order. Omit to leave unchanged. |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product to produce. Omit to leave unchanged. |
| `line_items` | UpdateManufacturingOrderLineItem[] |  | The full set of component line items for the order. When supplied, this replaces the order's current components. Omit to leave the components unchanged. |
| `overhead_lines` | UpdateManufacturingOverheadLine[] |  | The full set of overhead (extra-charge) lines for the order, such as machinery time, services, or labour. When supplied, this replaces the order's current custom lines: include an entry with its `id` to keep/amend an existing line, include an entry without an `id` to add a new line, and omit an existing line to remove it. Omit `overhead_lines` entirely to leave them unchanged. |

**Response** `200` `ManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the manufacturing order. |
| `number` | string |  | Order number. |
| `type` | string |  | Whether the order assembles finished goods from components, or disassembles finished goods back into components. |
| `status` | string |  | Current status of the order in its production lifecycle. |
| `stock_status` | string |  | Whether the components needed for production are all in stock yet. |
| `reference` | string |  | Your own reference for the order. |
| `bill_of_material_variant_id` | integer (int32) |  | Identifier of the finished product variant this order produces (its bill of material). |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product this order is planned to produce. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured and stock is moved. |
| `manufacturer` | Manufacturer |  | The manufacturer (contact) responsible for producing a manufacturing order. |
| `created_at` | string (date-time) |  | Date and time when the order was created. |
| `last_updated_at` | string (date-time) |  | Date and time when the order was last updated. |
| `comments` | string |  | Notes visible on the order. |
| `private_notes` | string |  | Internal notes not shown on printed documents. |
| `tags` | string |  | Tags associated with the order for categorization. |
| `line_items` | ManufacturingOrderLineItem[] |  | The component line items consumed or produced by this order. |
| `overhead_lines` | ManufacturingOverheadLine[] |  | The overhead (extra-charge) lines added to this order, such as machinery time, services, or labour. |

```bash
curl -sS 'https://api.qoblex.com/v1/manufacturing_orders/{id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/manufacturing_orders/{id}/complete

**Complete Order**

Completes an in-production manufacturing order. This consumes the reserved components and adds
the finished goods to stock at the manufacturing location, closing out the production run. The
order must be in production. For batch-tracked production you can pass the finished and consumed
batches in the request body: they are recorded and the order is completed in a single step, so
batch traceability and completion succeed or fail together. The body is optional; omit it to
complete an order whose batches were already assigned. Supply the finished batches either as an
explicit `finished_batches` list or through the `batch_generator`, but not both.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the manufacturing order to complete. |

**Request body** `AssignBatchesToManufactureRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `finished_batches` | ManufacturingBatchAssignmentOperation[] |  | The finished-goods batches produced by this manufacturing order, listed explicitly. Provide the finished batches this way OR via `batch_generator`, never both. |
| `batch_generator` | ManufacturingSequenceExpression |  |  |
| `line_items` | ManufacturingLineItemAssignment[] |  | List of input line items and the batches consumed for each. |

**Response** `200` `ManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the manufacturing order. |
| `number` | string |  | Order number. |
| `type` | string |  | Whether the order assembles finished goods from components, or disassembles finished goods back into components. |
| `status` | string |  | Current status of the order in its production lifecycle. |
| `stock_status` | string |  | Whether the components needed for production are all in stock yet. |
| `reference` | string |  | Your own reference for the order. |
| `bill_of_material_variant_id` | integer (int32) |  | Identifier of the finished product variant this order produces (its bill of material). |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product this order is planned to produce. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured and stock is moved. |
| `manufacturer` | Manufacturer |  | The manufacturer (contact) responsible for producing a manufacturing order. |
| `created_at` | string (date-time) |  | Date and time when the order was created. |
| `last_updated_at` | string (date-time) |  | Date and time when the order was last updated. |
| `comments` | string |  | Notes visible on the order. |
| `private_notes` | string |  | Internal notes not shown on printed documents. |
| `tags` | string |  | Tags associated with the order for categorization. |
| `line_items` | ManufacturingOrderLineItem[] |  | The component line items consumed or produced by this order. |
| `overhead_lines` | ManufacturingOverheadLine[] |  | The overhead (extra-charge) lines added to this order, such as machinery time, services, or labour. |

```bash
curl -sS 'https://api.qoblex.com/v1/manufacturing_orders/{id}/complete' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/manufacturing_orders/{id}/start

**Start Order**

Starts production on a draft manufacturing order. This reserves the components the order needs
from stock and moves the order into production. The order must be in draft, and there must be
enough component stock, otherwise the request is rejected with the reason.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the manufacturing order to start. |

**Response** `200` `ManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the manufacturing order. |
| `number` | string |  | Order number. |
| `type` | string |  | Whether the order assembles finished goods from components, or disassembles finished goods back into components. |
| `status` | string |  | Current status of the order in its production lifecycle. |
| `stock_status` | string |  | Whether the components needed for production are all in stock yet. |
| `reference` | string |  | Your own reference for the order. |
| `bill_of_material_variant_id` | integer (int32) |  | Identifier of the finished product variant this order produces (its bill of material). |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product this order is planned to produce. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured and stock is moved. |
| `manufacturer` | Manufacturer |  | The manufacturer (contact) responsible for producing a manufacturing order. |
| `created_at` | string (date-time) |  | Date and time when the order was created. |
| `last_updated_at` | string (date-time) |  | Date and time when the order was last updated. |
| `comments` | string |  | Notes visible on the order. |
| `private_notes` | string |  | Internal notes not shown on printed documents. |
| `tags` | string |  | Tags associated with the order for categorization. |
| `line_items` | ManufacturingOrderLineItem[] |  | The component line items consumed or produced by this order. |
| `overhead_lines` | ManufacturingOverheadLine[] |  | The overhead (extra-charge) lines added to this order, such as machinery time, services, or labour. |

```bash
curl -sS 'https://api.qoblex.com/v1/manufacturing_orders/{id}/start' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/manufacturing_orders/{id}/stop

**Stop Order**

Stops an in-production manufacturing order and returns it to draft, releasing the components it
had reserved back to available stock so the order can be edited again. Use this to undo a start
before the order is completed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the manufacturing order to stop. |

**Response** `200` `ManufacturingOrder`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the manufacturing order. |
| `number` | string |  | Order number. |
| `type` | string |  | Whether the order assembles finished goods from components, or disassembles finished goods back into components. |
| `status` | string |  | Current status of the order in its production lifecycle. |
| `stock_status` | string |  | Whether the components needed for production are all in stock yet. |
| `reference` | string |  | Your own reference for the order. |
| `bill_of_material_variant_id` | integer (int32) |  | Identifier of the finished product variant this order produces (its bill of material). |
| `quantity_to_produce` | number (double) |  | Quantity of the finished product this order is planned to produce. |
| `location_id` | integer (int32) |  | Identifier of the location where the goods are manufactured and stock is moved. |
| `manufacturer` | Manufacturer |  | The manufacturer (contact) responsible for producing a manufacturing order. |
| `created_at` | string (date-time) |  | Date and time when the order was created. |
| `last_updated_at` | string (date-time) |  | Date and time when the order was last updated. |
| `comments` | string |  | Notes visible on the order. |
| `private_notes` | string |  | Internal notes not shown on printed documents. |
| `tags` | string |  | Tags associated with the order for categorization. |
| `line_items` | ManufacturingOrderLineItem[] |  | The component line items consumed or produced by this order. |
| `overhead_lines` | ManufacturingOverheadLine[] |  | The overhead (extra-charge) lines added to this order, such as machinery time, services, or labour. |

```bash
curl -sS 'https://api.qoblex.com/v1/manufacturing_orders/{id}/stop' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

