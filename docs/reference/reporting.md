# Reporting

The reporting endpoints return operational and financial reports across sales, purchasing, inventory, and demand forecasting, plus any custom reports you have saved. Each report accepts filters and returns aggregated rows and totals. Use them to pull the numbers behind your own dashboards and exports.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

5 endpoints.

### GET /v1/reporting/filters

**List Reporting Filters**

Returns the filters you can apply across the sales, purchase, inventory, and forecasting reports.
Use this to populate filter pickers when building a report, so you know which dimensions are
available before you run a query.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `type` | query | string |  | Type of filter to retrieve. |
| `search_term` | query | string |  | Text used to search filter names or values. |
| `ids` | query | integer (int64)[] |  | Specific filter unique identifier to retrieve. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/reporting/filters' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/reporting/forecasting

**Get Forecasting Report**

Returns demand projections so you can plan what to reorder before you run out. Set the time range,
stock coverage targets, and supplier strategy, then filter and group the results to guide your
purchasing and replenishment decisions.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `report_type` | query | enum(`forecasting`, `forecasting_weekly_history`) |  | Type of forecasting report to generate. |
| `page` | query | integer (int32) |  | Page number for paginated results. |
| `group_by` | query | string |  | Field or dimension used to group forecast results. |
| `sort_by` | query | string |  | Field used to sort forecast results. |
| `include_summary` | query | boolean |  | Whether to include aggregated summary metrics in the response. |
| `dim_filters` | query | string |  | Dimension filters used to restrict forecast results. |
| `fact_filters` | query | string |  | Fact-based filters applied to forecast metrics. |
| `from_date` | query | string (date-time) |  | Start date for the forecasting period. |
| `to_date` | query | string (date-time) |  | End date for the forecasting period. |
| `ignore_stockout_periods` | query | boolean |  | If true, excludes periods where stock was unavailable from calculations. |
| `stock_projection_period` | query | integer (int32) |  | Number of days/weeks used for stock projection calculations. |
| `coverage_target_weeks` | query | integer (int32) |  | Number of weeks of stock coverage targeted in the forecast. |
| `projection_mode` | query | string |  | Defines how demand is projected. |
| `supplier_selection_mode` | query | string |  | Strategy used to select suppliers in forecasting calculations. |
| `growth_factor` | query | number (double) |  |  |
| `damping_factor` | query | number (double) |  | Damping applied to the measured trend by the Trend forecast method, between 0 and 1. Defaults to 0.85. Values between 0.8 and 0.98 are the usual working range; 1 leaves the trend undamped and 0 removes it entirely. Ignored by the other forecast methods. |
| `variant_scope` | query | string |  | Whether to forecast finished products (default) or raw materials (BOM-derived demand). |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of report records available. |
| `filtered_count` | integer (int32) |  | Number of report records after filters are applied. |
| `has_next_page` | boolean |  | Whether another page of results exists, when pagination applies. |
| `lines` | ForecastingVariantLine \| ForecastingWeeklyHistoryLine[] |  | The report rows. Which shape you get depends on the report_type you requested; each option below corresponds to a report type (its grouped variant is used when you group the report). |
| `summary` | object |  | Aggregated totals for the report, when available. |

`lines` is one of 2 row shapes, chosen by the
request parameter that selects the report. Each is listed below.

<details>
<summary><code>ForecastingVariantLine</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand this product belongs to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type this variant belongs to. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the variant's default supplier. |
| `product_id` | integer (int32) |  | Identifier of the parent product. |
| `variant_id` | integer (int64) |  | Identifier of the product variant. |
| `brand.name` | string |  | Display name of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `supplier.name` | string |  | Display name of the variant's default supplier. |
| `image_url` | string |  | Image of the product variant. |
| `product.name` | string |  | Display name of the product. |
| `sku` | string |  | The variant's SKU. |
| `barcode` | string |  | The variant's barcode. |
| `state` | enum(`draft`, `active`, `deleted`, `archived`) |  | Current lifecycle state of the variant (for example active or archived). |
| `quantity` | number (double) |  | Units sold over the historical period being analysed. |
| `quantity_returned` | number (double) |  | Units returned by customers over the historical period. |
| `cancelled_quantity` | number (double) |  | Units on cancelled orders over the historical period. |
| `forecast_quantity` | number (double) |  | Projected demand in units over the forecast horizon. |
| `velocity` | number (double) |  | Baseline weekly sales rate at the end of the historical period, before any trend is projected forward. Null on any variant not using the Trend method - zero would read as a real rate of zero. |
| `trend` | number (double) |  | Change in the weekly sales rate per week over the historical period. Positive means demand is climbing, negative means it is falling. Null on any variant not using the Trend method. |
| `current_stock_quantity` | number (double) |  | Units currently available in stock. |
| `projected_stock` | ForecastingProjectedStock[] |  | Week-by-week projection of expected stock on hand across the forecast horizon. |
| `projected_incomings` | ForecastingIncomingPeriod[] |  | Incoming stock expected to arrive during the forecast horizon, by period. |
| `projected_purchase_orders` | ForecastingProjectedPurchaseOrder[] |  | Suggested purchase orders to place to avoid running out of stock. |
| `variant_type` | enum(`simple`, `bundle`, `component`) |  | Whether the variant is a simple item, a bundle, or a bundle component. |
| `forecast_method` | enum(`historical_average_weekly_sales`, `seasonal`, `trend`) |  | The forecasting method used to project demand for this variant. |
| `stockout_days` | integer (int32) |  | Number of days the variant was out of stock during the historical period. |
| `total_sales` | number (double) |  | Total sales revenue for the variant over the historical period. |
| `margin` | number (double) |  | Total profit margin for the variant over the historical period. |
| `average_sales` | number (double) |  | Average sales revenue per period over the historical period. |
| `average_margin` | number (double) |  | Average profit margin per period over the historical period. |
| `retail_price` | number (double) |  | The variant's retail selling price. |
| `moving_average_cost` | number (double) |  | The variant's moving average cost. |
| `total_incoming_stock` | number (double) |  | Total units expected to arrive across all incoming stock in the forecast horizon. |
| `forecast_sales` | number (double) |  | Projected sales revenue over the forecast horizon. |
| `forecast_margin` | number (double) |  | Projected profit margin over the forecast horizon. |
| `warnings` | string[] |  | Advisory messages about the reliability of this variant's forecast. |

</details>

<details>
<summary><code>ForecastingWeeklyHistoryLine</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `week_start` | string (date-time) |  | Start date of the week this history row covers. |
| `total_sales` | number (double) |  | Total sales revenue for the variant during the week. |
| `stockout_days` | integer (int32) |  | Number of days the variant was out of stock during the week. |

</details>

```bash
curl -sS 'https://api.qoblex.com/v1/reporting/forecasting' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/reporting/inventory

**Get Inventory Report**

Returns your inventory figures so you can see stock levels, valuation, and movement across your
warehouses. Filter, group, and sort the results to check what is on hand, where it sits, and how
it is moving.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `report_type` | query | enum(`stock_movement`, `stock_on_hand`, `stock_allocations`, `inventory_turnover`, `inventory_reorder`, `inventory_aging`) |  | Type of inventory report to generate. |
| `page` | query | integer (int32) |  | Page number for paginated results. |
| `group_by` | query | string |  | Field or dimension used to group report data. |
| `sort_by` | query | string |  | Field used to sort report results. |
| `include` | query | string[] |  | The report sections to compute and return. Repeatable; valid values are `lines` (the current page of rows), `count` (the total row count across the whole filtered set) and `summary` (the aggregate totals over that set). Omit to get the default `lines,count`. Request `count,summary` on their own to load the full-account totals in parallel with a fast `lines` request, so the totals can fill in once the scan completes without holding up the first page. |
| `include_summary` | query | boolean |  | Deprecated. Use `include=summary`. Ignored when `include` is supplied. |
| `dim_filters` | query | string |  | Dimension filters used to restrict report results. |
| `fact_filters` | query | string |  | Fact-based filters applied to report metrics. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of report records available. |
| `filtered_count` | integer (int32) |  | Number of report records after filters are applied. |
| `has_next_page` | boolean |  | Whether another page of results exists, when pagination applies. |
| `lines` | StockMovementLineItem \| GroupedStockMovementLineItem \| StockOnHandInventoryItem \| InventoryItem \| InventoryTurnoverLineItem \| GroupedInventoryTurnoverLineItem \| InventoryReorderItem \| InventoryAgingLineItem \| GroupedInventoryAgingLineItem[] |  | The report rows. Which shape you get depends on the report_type you requested; each option below corresponds to a report type (its grouped variant is used when you group the report). |
| `summary` | StockMovementSummary \| StockOnHandInventoryItemSummary |  | Aggregated totals for the report, present when a summary is requested and available for the report type. |

`lines` is one of 9 row shapes, chosen by the
request parameter that selects the report. Each is listed below.

<details>
<summary><code>StockMovementLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this stock movement row. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type. |
| `location.dim_id` | integer (int64) |  | Identifier of the location. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `record_date` | string (date-time) |  | The date this stock movement was recorded. |
| `valid_until` | string (date-time) |  | The date this row's figures remain valid until. |
| `brand.name` | string |  | Display name of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `location.name` | string |  | Display name of the location. |
| `location.is_deleted` | boolean |  | Whether the location has been deleted in the source system. |
| `product.name` | string |  | Display name of the product. |
| `image_url` | string |  | Image of the product. |
| `sku` | string |  | The product's SKU. |
| `barcode` | string |  | The product's barcode. |
| `opening_balance` | number (double) |  | Quantity of stock on hand at the start of the period. |
| `opening_value` | number (double) |  | Value of stock on hand at the start of the period. |
| `closing_balance` | number (double) |  | Quantity of stock on hand at the end of the period. |
| `closing_value` | number (double) |  | Value of stock on hand at the end of the period. |
| `shipped_quantity` | number (double) |  | Quantity shipped out to customers during the period. |
| `shipment_value` | number (double) |  | Value of stock shipped out to customers during the period. |
| `received_quantity` | number (double) |  | Quantity received from suppliers during the period. |
| `receipt_value` | number (double) |  | Value of stock received from suppliers during the period. |
| `sale_return_quantity` | number (double) |  | Quantity returned by customers during the period. |
| `sale_return_value` | number (double) |  | Value of stock returned by customers during the period. |
| `supplier_return_quantity` | number (double) |  | Quantity returned to suppliers during the period. |
| `supplier_return_value` | number (double) |  | Value of stock returned to suppliers during the period. |
| `stock_adjustment_quantity` | number (double) |  | Net quantity change from manual stock adjustments during the period. |
| `stock_adjustment_value` | number (double) |  | Net value change from manual stock adjustments during the period. |
| `manufactured_quantity` | number (double) |  | Quantity produced through manufacturing during the period. |
| `manufactured_value` | number (double) |  | Value of stock produced through manufacturing during the period. |
| `transfer_quantity` | number (double) |  | Net quantity moved between locations during the period. |
| `transfer_value` | number (double) |  | Net value moved between locations during the period. |
| `state` | enum(`draft`, `active`, `deleted`, `archived`) |  | Whether the product variant is active or archived. |

</details>

<details>
<summary><code>GroupedStockMovementLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `record_date` | string (date-time) |  | The date this stock movement was recorded. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `location_dim_ids` | integer (int64)[] |  | Identifiers of the locations included in this group. |
| `brand_dim_ids` | integer (int64)[] |  | Identifiers of the brands included in this group. |
| `product_type_dim_ids` | integer (int64)[] |  | Identifiers of the product types included in this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants included in this group. |
| `opening_balance` | number (double) |  | Quantity of stock on hand at the start of the period for this group. |
| `opening_value` | number (double) |  | Value of stock on hand at the start of the period for this group. |
| `closing_balance` | number (double) |  | Quantity of stock on hand at the end of the period for this group. |
| `closing_value` | number (double) |  | Value of stock on hand at the end of the period for this group. |
| `shipped_quantity` | number (double) |  | Quantity shipped out to customers during the period for this group. |
| `shipment_value` | number (double) |  | Value of stock shipped out to customers during the period for this group. |
| `received_quantity` | number (double) |  | Quantity received from suppliers during the period for this group. |
| `receipt_value` | number (double) |  | Value of stock received from suppliers during the period for this group. |
| `sale_return_quantity` | number (double) |  | Quantity returned by customers during the period for this group. |
| `sale_return_value` | number (double) |  | Value of stock returned by customers during the period for this group. |
| `supplier_return_quantity` | number (double) |  | Quantity returned to suppliers during the period for this group. |
| `supplier_return_value` | number (double) |  | Value of stock returned to suppliers during the period for this group. |
| `stock_adjustment_quantity` | number (double) |  | Net quantity change from manual stock adjustments during the period for this group. |
| `stock_adjustment_value` | number (double) |  | Net value change from manual stock adjustments during the period for this group. |
| `manufactured_quantity` | number (double) |  | Quantity produced through manufacturing during the period for this group. |
| `manufactured_value` | number (double) |  | Value of stock produced through manufacturing during the period for this group. |
| `transfer_quantity` | number (double) |  | Net quantity moved between locations during the period for this group. |
| `transfer_value` | number (double) |  | Net value moved between locations during the period for this group. |

</details>

<details>
<summary><code>StockOnHandInventoryItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this stock-on-hand row. |
| `product_id` | integer (int32) |  | Identifier of the product. |
| `variant_id` | integer (int32) |  | Identifier of the product variant. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `product.name` | string |  | Display name of the product. |
| `image_url` | string |  | Image of the product. |
| `barcode` | string |  | The product's barcode. |
| `sku` | string |  | The product's SKU. |
| `brand.name` | string |  | Display name of the brand. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type. |
| `state` | enum(`draft`, `active`, `deleted`, `archived`) |  | Whether the product variant is active or archived. |
| `supplier.name` | string |  | Display name of the supplier. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the supplier. |
| `updated_at` | string (date-time) |  | When this product's stock was last updated. |
| `is_tracked` | boolean |  | Whether Qoblex tracks stock for this variant. Untracked variants hold no inventory value or quantity. |
| `moving_average_cost` | number (double) |  | The moving average cost per unit of the product. Null when the variant is untracked. |
| `total_cost` | number (double) |  | The total value of stock on hand. Null when the variant is untracked. |
| `purchase_price` | number (double) |  | The product's purchase price. |
| `wholesale_price` | number (double) |  | The product's wholesale price. |
| `retail_price` | number (double) |  | The product's retail price. |
| `retail_compare_price` | number (double) |  | The product's retail compare-at price. |
| `wholesale_compare_price` | number (double) |  | The product's wholesale compare-at price. |
| `quantity` | number (double) |  | Quantity of stock on hand. Null when the variant is untracked. |
| `allocated_quantity` | number (double) |  | Quantity reserved for open orders. Null when the variant is untracked. |
| `available_quantity` | number (double) |  | Quantity available to sell after allocations. Null when the variant is untracked. |
| `incoming_quantity` | number (double) |  | Quantity expected in from incoming purchase orders. Null when the variant is untracked. |
| `buffer_quantity` | number (double) |  | Buffer stock held back as a safety level. Null when the variant is untracked. |
| `on_back_order_quantity` | number (double) |  | Quantity on back order that could not be fulfilled from stock. Null when the variant is untracked. |
| `inventory_levels` | InventoryLevel[] |  | Per-location breakdown of stock levels for this product. |

</details>

<details>
<summary><code>InventoryItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this inventory row. |
| `product_id` | integer (int32) |  | Identifier of the product. |
| `variant_id` | integer (int32) |  | Identifier of the product variant. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `product.name` | string |  | Display name of the product. |
| `image_url` | string |  | Image of the product. |
| `barcode` | string |  | The product's barcode. |
| `sku` | string |  | The product's SKU. |
| `state` | enum(`draft`, `active`, `deleted`, `archived`) |  | Whether the product variant is active or archived. |
| `brand.name` | string |  | Display name of the brand. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type. |
| `supplier.name` | string |  | Display name of the supplier. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the supplier. |
| `updated_at` | string (date-time) |  | When this product's stock was last updated. |
| `inventory_allocation_status` | string |  | Whether the product is fully allocated, partially allocated, or unallocated. |
| `quantity` | number (double) |  | Quantity of stock on hand. |
| `allocated_quantity` | number (double) |  | Quantity reserved for open orders. |
| `available_quantity` | number (double) |  | Quantity available to sell after allocations. |
| `incoming_quantity` | number (double) |  | Quantity expected in from incoming purchase orders. |
| `buffer_quantity` | number (double) |  | Buffer stock held back as a safety level. |
| `requested_quantity` | number (double) |  | Quantity requested across open orders. |
| `on_back_order_quantity` | number (double) |  | Quantity on back order that could not be fulfilled from stock. |
| `allocation_levels` | AllocationLevel[] |  | Per-order breakdown of how this product's stock is allocated. |

</details>

<details>
<summary><code>InventoryTurnoverLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `brand.name` | string |  | Display name of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `last_movement_date` | string (date-time) |  | The date this product last had stock movement. |
| `opening_balance` | number (double) |  | Quantity of stock on hand at the start of the period. |
| `closing_balance` | number (double) |  | Quantity of stock on hand at the end of the period. |
| `in_quantity` | number (double) |  | Quantity that came into stock during the period. |
| `out_quantity` | number (double) |  | Quantity that went out of stock during the period. |
| `product.name` | string |  | Display name of the product. |
| `image_url` | string |  | Image of the product. |
| `sku` | string |  | The product's SKU. |
| `state` | enum(`draft`, `active`, `deleted`, `archived`) |  | Whether the product variant is active or archived. |
| `barcode` | string |  | The product's barcode. |
| `cogs` | number (double) |  | Cost of goods sold for this product during the period. |
| `daily_soh` | number (double) |  | Average value of stock on hand per day over the period. |
| `turnover` | number (double) |  | How many times stock turned over during the period. |
| `sell_through` | number (double) |  | Share of available stock that was sold during the period. |
| `stock_coverage_days` | number (double) |  | Estimated number of days the current stock will last. |

</details>

<details>
<summary><code>GroupedInventoryTurnoverLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `cogs` | number (double) |  | Cost of goods sold for this group during the period. |
| `daily_soh` | number (double) |  | Average value of stock on hand per day over the period for this group. |
| `turnover` | number (double) |  | How many times stock turned over during the period for this group. |
| `closing_balance` | number (double) |  | Quantity of stock on hand at the end of the period for this group. |
| `last_movement_date` | string (date-time) |  | The most recent date any product in this group had stock movement. |
| `opening_balance` | number (double) |  | Quantity of stock on hand at the start of the period for this group. |
| `sell_through` | number (double) |  | Share of available stock that was sold during the period for this group. |
| `stock_coverage_days` | number (double) |  | Estimated number of days the current stock will last for this group. |
| `in_quantity` | number (double) |  | Quantity that came into stock during the period for this group. |
| `out_quantity` | number (double) |  | Quantity that went out of stock during the period for this group. |

</details>

<details>
<summary><code>InventoryReorderItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this reorder row. |
| `product_id` | integer (int32) |  | Identifier of the product. |
| `variant_id` | integer (int32) |  | Identifier of the product variant. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `product.name` | string |  | Display name of the product. |
| `image_url` | string |  | Image of the product. |
| `barcode` | string |  | The product's barcode. |
| `sku` | string |  | The product's SKU. |
| `brand.name` | string |  | Display name of the brand. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type. |
| `state` | enum(`draft`, `active`, `deleted`, `archived`) |  | Whether the product variant is active or archived. |
| `supplier.name` | string |  | Display name of the supplier. |
| `supplier.id` | integer (int64) |  | Identifier of the supplier. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the supplier. |
| `updated_at` | string (date-time) |  | When this product's stock was last updated. |
| `quantity` | number (double) |  | Quantity of stock on hand. |
| `purchase_price` | number (double) |  | The product's purchase price. |
| `allocated_quantity` | number (double) |  | Quantity reserved for open orders. |
| `available_quantity` | number (double) |  | Quantity available to sell after allocations. |
| `incoming_quantity` | number (double) |  | Quantity expected in from incoming purchase orders. |
| `sold_quantity` | number (double) |  | Quantity sold over the period used to gauge demand. |
| `buffer_quantity` | number (double) |  | Buffer stock held back as a safety level. |
| `on_back_order_quantity` | number (double) |  | Quantity on back order that could not be fulfilled from stock. |
| `inventory_levels` | ReorderLocationLevel[] |  | Per-location breakdown of reorder levels for this product. |

</details>

<details>
<summary><code>InventoryAgingLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this aging row. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant. |
| `brand.name` | string |  | Display name of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `last_movement_date` | string (date-time) |  | The date this product last had stock movement. |
| `on_hand_quantity` | number (double) |  | Quantity of stock on hand. |
| `on_hand_value` | number (double) |  | Value of stock on hand. |
| `average_age_in_days` | number (double) |  | Average age of the stock on hand, in days. |
| `oldest_age_in_days` | number (double) |  | Age of the oldest stock on hand, in days. |
| `product.name` | string |  | Display name of the product. |
| `image_url` | string |  | Image of the product. |
| `product_variant_id` | integer (int64) |  | Identifier of the product variant. |
| `sku` | string |  | The product's SKU. |
| `state` | enum(`draft`, `active`, `deleted`, `archived`) |  | Whether the product variant is active or archived. |
| `barcode` | string |  | The product's barcode. |
| `value_aged_0_to_30_days` | number (double) |  | Stock value aged 0 to 30 days. |
| `value_aged_31_to_60_days` | number (double) |  | Stock value aged 31 to 60 days. |
| `value_aged_61_to_90_days` | number (double) |  | Stock value aged 61 to 90 days. |
| `value_aged_90_to_120_days` | number (double) |  | Stock value aged 90 to 120 days. |
| `value_aged_121_to_150_days` | number (double) |  | Stock value aged 121 to 150 days. |
| `value_aged_151_to_180_days` | number (double) |  | Stock value aged 151 to 180 days. |
| `value_aged_181_to_270_days` | number (double) |  | Stock value aged 181 to 270 days. |
| `value_aged_271_to_365_days` | number (double) |  | Stock value aged 271 to 365 days. |
| `value_aged_over_year` | number (double) |  | Stock value aged over a year. |
| `quantity_aged_0_to_30_days` | number (double) |  | Quantity of stock aged 0 to 30 days. |
| `quantity_aged_31_to_60_days` | number (double) |  | Quantity of stock aged 31 to 60 days. |
| `quantity_aged_61_to_90_days` | number (double) |  | Quantity of stock aged 61 to 90 days. |
| `quantity_aged_90_to_120_days` | number (double) |  | Quantity of stock aged 90 to 120 days. |
| `quantity_aged_121_to_150_days` | number (double) |  | Quantity of stock aged 121 to 150 days. |
| `quantity_aged_151_to_180_days` | number (double) |  | Quantity of stock aged 151 to 180 days. |
| `quantity_aged_181_to_270_days` | number (double) |  | Quantity of stock aged 181 to 270 days. |
| `quantity_aged_271_to_365_days` | number (double) |  | Quantity of stock aged 271 to 365 days. |
| `quantity_aged_over_year` | number (double) |  | Quantity of stock aged over a year. |
| `retail_price` | number (double) |  | The product's retail price. |
| `mac` | number (double) |  | The moving average cost per unit of the product. |

</details>

<details>
<summary><code>GroupedInventoryAgingLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `last_movement_date` | string (date-time) |  | The most recent date any product in this group had stock movement. |
| `on_hand_quantity` | number (double) |  | Quantity of stock on hand for this group. |
| `on_hand_value` | number (double) |  | Value of stock on hand for this group. |
| `average_age_in_days` | number (double) |  | Average age of the stock on hand for this group, in days. |
| `oldest_age_in_days` | number (double) |  | Age of the oldest stock on hand in this group, in days. |
| `value_aged_0_to_30_days` | number (double) |  | Stock value aged 0 to 30 days for this group. |
| `value_aged_31_to_60_days` | number (double) |  | Stock value aged 31 to 60 days for this group. |
| `value_aged_61_to_90_days` | number (double) |  | Stock value aged 61 to 90 days for this group. |
| `value_aged_90_to_120_days` | number (double) |  | Stock value aged 90 to 120 days for this group. |
| `value_aged_121_to_150_days` | number (double) |  | Stock value aged 121 to 150 days for this group. |
| `value_aged_151_to_180_days` | number (double) |  | Stock value aged 151 to 180 days for this group. |
| `value_aged_181_to_270_days` | number (double) |  | Stock value aged 181 to 270 days for this group. |
| `value_aged_271_to_365_days` | number (double) |  | Stock value aged 271 to 365 days for this group. |
| `value_aged_over_year` | number (double) |  | Stock value aged over a year for this group. |
| `quantity_aged_0_to_30_days` | number (double) |  | Quantity of stock aged 0 to 30 days for this group. |
| `quantity_aged_31_to_60_days` | number (double) |  | Quantity of stock aged 31 to 60 days for this group. |
| `quantity_aged_61_to_90_days` | number (double) |  | Quantity of stock aged 61 to 90 days for this group. |
| `quantity_aged_90_to_120_days` | number (double) |  | Quantity of stock aged 90 to 120 days for this group. |
| `quantity_aged_121_to_150_days` | number (double) |  | Quantity of stock aged 121 to 150 days for this group. |
| `quantity_aged_151_to_180_days` | number (double) |  | Quantity of stock aged 151 to 180 days for this group. |
| `quantity_aged_181_to_270_days` | number (double) |  | Quantity of stock aged 181 to 270 days for this group. |
| `quantity_aged_271_to_365_days` | number (double) |  | Quantity of stock aged 271 to 365 days for this group. |
| `quantity_aged_over_year` | number (double) |  | Quantity of stock aged over a year for this group. |

</details>

```bash
curl -sS 'https://api.qoblex.com/v1/reporting/inventory' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/reporting/purchases

**Get Purchases Report**

Returns your purchasing figures so you can see what you are buying and from whom. Filter, group,
and sort the results to review supplier activity, track procurement costs, and spot buying trends
over the periods you choose.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `report_type` | query | enum(`purchase_details`, `purchases_by_product`, `received_goods`, `bills`, `supplier_aging`) |  | Type of purchase report to generate. |
| `page` | query | integer (int32) |  | Page number for paginated results. |
| `group_by` | query | string |  | Field or dimension used to group report data. |
| `sort_by` | query | string |  | Field used to sort report results. |
| `include_summary` | query | boolean |  | Indicates whether summary metrics should be included in the response. |
| `dim_filters` | query | string |  | Dimension filters used to restrict report results. |
| `fact_filters` | query | string |  | Fact-based filters applied to report metrics. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of report records available. |
| `filtered_count` | integer (int32) |  | Number of report records after filters are applied. |
| `has_next_page` | boolean |  | Whether another page of results exists, when pagination applies. |
| `lines` | PurchaseDetailsLineItem \| GroupedPurchaseDetailsLineItem \| PurchasesByProductLineItem \| GroupedPurchasesByProductLineItem \| ReceivedGoodsLineItem \| GroupedReceivedGoodsLineItem \| BillLineItem \| GroupedBillLineItem \| SupplierAgingLineItem[] |  | The report rows. Which shape you get depends on the report_type you requested; each option below corresponds to a report type (its grouped variant is used when you group the report). |
| `summary` | PurchaseDetailsSummary \| PurchasesByProductSummary \| ReceivedGoodsSummary \| BillSummary |  | Aggregated totals for the report, present when a summary is requested and available for the report type. |

`lines` is one of 9 row shapes, chosen by the
request parameter that selects the report. Each is listed below.

<details>
<summary><code>PurchaseDetailsLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this purchase detail row. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand this row rolls up to. |
| `country.dim_id` | string |  | Identifier of the country of origin this row rolls up to. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the supplier this row rolls up to. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type this row rolls up to. |
| `purchase.dim_id` | integer (int64) |  | Identifier of the purchase order this row rolls up to. |
| `purchase_agent.dim_id` | integer (int64) |  | Identifier of the purchasing agent this row rolls up to. |
| `location.dim_id` | integer (int64) |  | Identifier of the location this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this row rolls up to. |
| `purchase.number` | string |  | The purchase order number. |
| `created_on` | string (date-time) |  | The date the purchase order was created. |
| `status` | enum(`draft`, `open`, `closed`, `deleted`) |  | The current status of the purchase order. |
| `supplier.name` | string |  | The name of the supplier. |
| `purchase_agent.name` | string |  | The name of the purchasing agent who placed the order. |
| `brand.name` | string |  | The brand of the purchased product. |
| `country.name` | string |  | The country of origin of the purchased product. |
| `product_type.name` | string |  | The product type of the purchased product. |
| `product.name` | string |  | The name of the purchased product. |
| `image_url` | string |  | Image of the purchased product. |
| `sku` | string |  | The stock keeping unit (SKU) of the purchased product. |
| `barcode` | string |  | The barcode of the purchased product. |
| `quantity` | number (double) |  | The quantity ordered on this line. |
| `retail_price` | number (double) |  | The retail selling price of the product. |
| `gross_amount` | number (double) |  | The value of the line before discounts, taxes and refunds. |
| `discounts` | number (double) |  | The total discount applied to the line. |
| `refunds` | number (double) |  | The total amount refunded on the line. |
| `net_amount` | number (double) |  | The value of the line after discounts and refunds, before tax. |
| `taxes` | number (double) |  | The tax charged on the line. |
| `total_amount` | number (double) |  | The total value of the line including tax. |
| `grn.number` | string |  | The goods receipt note number the line was received against. |
| `estimated_delivery_date` | string (date-time) |  | The date the goods are expected to be delivered. |
| `received_date` | string (date-time) |  | The date the goods were received. |
| `received_quantity` | number (double) |  | The quantity received against this line. |
| `received_amount` | number (double) |  | The value of the goods received against this line. |
| `landed_cost_allocated` | number (double) |  | The landed cost allocated to this line. |
| `total_cost` | number (double) |  | The total cost of the line including allocated landed costs. |
| `return.number` | string |  | The purchase return number the line was returned against. |
| `return_date` | string (date-time) |  | The date the goods were returned to the supplier. |
| `return_quantity` | number (double) |  | The quantity returned to the supplier on this line. |
| `return_amount` | number (double) |  | The value of the goods returned to the supplier on this line. |
| `bill.number` | string |  | The supplier bill number the line was billed on. |
| `bill_date` | string (date-time) |  | The date the line was billed by the supplier. |
| `billed_quantity` | number (double) |  | The quantity billed by the supplier on this line. |
| `billed_amount` | number (double) |  | The amount billed by the supplier on this line. |
| `billed_tax_amount` | number (double) |  | The tax billed by the supplier on this line. |
| `refund.number` | string |  | The supplier refund (credit note) number for this line. |
| `refund_quantity` | number (double) |  | The quantity credited by the supplier on this line. |
| `refund_date` | string (date-time) |  | The date the supplier refund was issued. |
| `refund_tax` | number (double) |  | The tax credited on the supplier refund. |
| `refund_amount` | number (double) |  | The amount credited on the supplier refund. |
| `order_type` | enum(`regular`, `freight`, `drop_ship`) |  | The type of order this line belongs to. |
| `purchase_order_id` | integer (int64) |  | Internal identifier of the purchase order this line belongs to. |
| `line_type` | enum(`order_item`, `landed_cost`, `expense`) |  | The kind of line this row represents (for example an order, receipt, bill or return line). |
| `incoming_quantity` | number (double) |  | The quantity still expected to arrive from the supplier. |
| `landed_cost_name` | string |  | The name of the landed cost applied to the line. |

</details>

<details>
<summary><code>GroupedPurchaseDetailsLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `brand_dim_ids` | integer (int64)[] |  | Identifiers of the brands rolled up into this group. |
| `country_dim_ids` | string[] |  | Identifiers of the countries of origin rolled up into this group. |
| `supplier_dim_ids` | integer (int64)[] |  | Identifiers of the suppliers rolled up into this group. |
| `purchase_agent_dim_ids` | integer (int64)[] |  | Identifiers of the purchasing agents rolled up into this group. |
| `product_type_dim_ids` | integer (int64)[] |  | Identifiers of the product types rolled up into this group. |
| `purchase_order_dim_ids` | integer (int64)[] |  | Identifiers of the purchase orders rolled up into this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants rolled up into this group. |
| `landed_cost_name` | string |  | The name of the landed cost applied to the group. |
| `quantity` | number (double) |  | The total quantity ordered across the group. |
| `gross_amount` | number (double) |  | The total value across the group before discounts, taxes and refunds. |
| `discounts` | number (double) |  | The total discount applied across the group. |
| `refunds` | number (double) |  | The total amount refunded across the group. |
| `net_amount` | number (double) |  | The total value across the group after discounts and refunds, before tax. |
| `taxes` | number (double) |  | The total tax charged across the group. |
| `total_amount` | number (double) |  | The total value across the group including tax. |
| `grn.number` | string |  | The goods receipt note number for the group. |
| `estimated_delivery_date` | string (date-time) |  | The date the goods are expected to be delivered. |
| `received_date` | string (date-time) |  | The date the goods were received. |
| `received_quantity` | number (double) |  | The total quantity received across the group. |
| `received_amount` | number (double) |  | The total value of goods received across the group. |
| `landed_cost_allocated` | number (double) |  | The total landed cost allocated across the group. |
| `total_cost` | number (double) |  | The total cost across the group including allocated landed costs. |
| `retail_price` | number (double) |  | The retail selling price of the product. |
| `return.number` | string |  | The purchase return number for the group. |
| `return_date` | string (date-time) |  | The date the goods were returned to the supplier. |
| `return_quantity` | number (double) |  | The total quantity returned to the supplier across the group. |
| `return_amount` | number (double) |  | The total value of goods returned to the supplier across the group. |
| `bill.number` | string |  | The supplier bill number for the group. |
| `bill_date` | string (date-time) |  | The date the group was billed by the supplier. |
| `billed_quantity` | number (double) |  | The total quantity billed by the supplier across the group. |
| `billed_amount` | number (double) |  | The total amount billed by the supplier across the group. |
| `billed_tax_amount` | number (double) |  | The total tax billed by the supplier across the group. |
| `refund.number` | string |  | The supplier refund (credit note) number for the group. |
| `refund_quantity` | number (double) |  | The total quantity credited by the supplier across the group. |
| `refund_date` | string (date-time) |  | The date the supplier refund was issued. |
| `refund_tax` | number (double) |  | The total tax credited by the supplier across the group. |
| `refund_amount` | number (double) |  | The total amount credited by the supplier across the group. |
| `order_type` | string |  | The type of order the group belongs to. |
| `incoming_quantity` | number (double) |  | The total quantity still expected to arrive from suppliers across the group. |

</details>

<details>
<summary><code>PurchasesByProductLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this purchases-by-product row. |
| `product_id` | integer (int64) |  | Internal identifier of the product this row is about. |
| `purchase.dim_id` | integer (int64) |  | Identifier of the purchase order this row rolls up to. |
| `purchase_order_id` | integer (int64) |  | Internal identifier of the purchase order this row belongs to. |
| `name` | string |  | The display name of the product. |
| `brand.name` | string |  | The brand of the purchased product. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand this row rolls up to. |
| `product_type.name` | string |  | The product type of the purchased product. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type this row rolls up to. |
| `image_url` | string |  | Image of the purchased product. |
| `location.name` | string |  | The location the goods were purchased into. |
| `location.is_deleted` | boolean |  | Whether the location has been deleted in the source system. |
| `location.dim_id` | integer (int64) |  | Identifier of the location this row rolls up to. |
| `country.name` | string |  | The country of origin of the purchased product. |
| `country.dim_id` | string |  | Identifier of the country of origin this row rolls up to. |
| `product.name` | string |  | The name of the purchased product. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this row rolls up to. |
| `sku` | string |  | The stock keeping unit (SKU) of the purchased product. |
| `barcode` | string |  | The barcode of the purchased product. |
| `created_at` | string (date-time) |  | The date the purchase order was created. |
| `purchase.number` | string |  | The purchase order number. |
| `status` | enum(`draft`, `open`, `closed`, `deleted`) |  | The current status of the purchase order. |
| `purchase_agent.name` | string |  | The name of the purchasing agent who placed the order. |
| `purchase_agent.dim_id` | integer (int64) |  | Identifier of the purchasing agent this row rolls up to. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the supplier this row rolls up to. |
| `supplier.name` | string |  | The name of the supplier. |
| `gross_amount` | number (double) |  | The total value purchased before discounts, taxes and refunds. |
| `discounts` | number (double) |  | The total discount applied. |
| `refunds` | number (double) |  | The total amount refunded. |
| `returns` | number (double) |  | The total value of goods returned to the supplier. |
| `net_amount` | number (double) |  | The value purchased after discounts and refunds, before tax. |
| `taxes` | number (double) |  | The tax charged on the purchase. |
| `total_amount` | number (double) |  | The total value purchased including tax. |
| `cancelled_amount` | number (double) |  | The value of quantities cancelled on the purchase. |
| `landed_costs` | number (double) |  | The landed costs added to the purchase. |
| `total_with_landed_cost` | number (double) |  | The total value purchased including landed costs. |
| `quantity` | number (double) |  | The quantity ordered. |
| `received_quantity` | number (double) |  | The quantity received from the supplier. |
| `returned_quantity` | number (double) |  | The quantity returned to the supplier. |
| `billed_quantity` | number (double) |  | The quantity billed by the supplier. |
| `received_value` | number (double) |  | The value of the goods received from the supplier. |
| `billed_amount` | number (double) |  | The amount billed by the supplier. |
| `paid_amount` | number (double) |  | The amount already paid to the supplier. |
| `incoming_quantity` | number (double) |  | The quantity still expected to arrive from the supplier. |
| `retail_price` | number (double) |  | The retail selling price of the product. |
| `estimated_delivery_date` | string (date-time) |  | The date the goods are expected to be delivered. |

</details>

<details>
<summary><code>GroupedPurchasesByProductLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `brand_dim_ids` | integer (int64)[] |  | Identifiers of the brands rolled up into this group. |
| `product_type_dim_ids` | integer (int64)[] |  | Identifiers of the product types rolled up into this group. |
| `location_dim_ids` | integer (int64)[] |  | Identifiers of the locations rolled up into this group. |
| `country_dim_ids` | string[] |  | Identifiers of the countries of origin rolled up into this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants rolled up into this group. |
| `purchase_order_dim_ids` | integer (int64)[] |  | Identifiers of the purchase orders rolled up into this group. |
| `purchase_agent_dim_ids` | integer (int64)[] |  | Identifiers of the purchasing agents rolled up into this group. |
| `supplier_dim_ids` | integer (int64)[] |  | Identifiers of the suppliers rolled up into this group. |
| `landed_cost_name` | string |  | The name of the landed cost applied to the group. |
| `gross_amount` | number (double) |  | The total value purchased across the group before discounts, taxes and refunds. |
| `discounts` | number (double) |  | The total discount applied across the group. |
| `refunds` | number (double) |  | The total amount refunded across the group. |
| `net_amount` | number (double) |  | The total value purchased across the group after discounts and refunds, before tax. |
| `taxes` | number (double) |  | The total tax charged across the group. |
| `total_amount` | number (double) |  | The total value purchased across the group including tax. |
| `cancelled_cost` | number (double) |  | The total value of quantities cancelled across the group. |
| `landed_costs` | number (double) |  | The total landed costs added across the group. |
| `total_with_landed_cost` | number (double) |  | The total value purchased across the group including landed costs. |
| `quantity` | number (double) |  | The total quantity ordered across the group. |
| `received_quantity` | number (double) |  | The total quantity received from suppliers across the group. |
| `returned_quantity` | number (double) |  | The total quantity returned to suppliers across the group. |
| `billed_quantity` | number (double) |  | The total quantity billed by suppliers across the group. |
| `billed_amount` | number (double) |  | The total amount billed by suppliers across the group. |
| `paid_amount` | number (double) |  | The total amount already paid to suppliers across the group. |
| `incoming_quantity` | number (double) |  | The total quantity still expected to arrive from suppliers across the group. |
| `retail_price` | number (double) |  | The retail selling price of the product. |

</details>

<details>
<summary><code>ReceivedGoodsLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this received-goods row. |
| `grn.dim_id` | integer (int64) |  | Identifier of the goods receipt note this row rolls up to. |
| `return.dim_id` | integer (int64) |  | Identifier of the purchase return this row rolls up to. |
| `purchase.dim_id` | integer (int64) |  | Identifier of the purchase order this row rolls up to. |
| `purchase_order_id` | integer (int32) |  | Internal identifier of the purchase order this row belongs to. |
| `purchase_agent.dim_id` | integer (int64) |  | Identifier of the purchasing agent this row rolls up to. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the supplier this row rolls up to. |
| `location.dim_id` | integer (int64) |  | Identifier of the location this row rolls up to. |
| `country.dim_id` | string |  | Identifier of the country of origin this row rolls up to. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type this row rolls up to. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this row rolls up to. |
| `purchase.number` | string |  | The purchase order number the goods were received against. |
| `grn.number` | string |  | The goods receipt note number. |
| `return.number` | string |  | The purchase return number, when the row represents a return. |
| `supplier.name` | string |  | The name of the supplier. |
| `location.name` | string |  | The location the goods were received into. |
| `location.is_deleted` | boolean |  | Whether the location has been deleted in the source system. |
| `country.name` | string |  | The country of origin of the received product. |
| `brand.name` | string |  | The brand of the received product. |
| `product_type.name` | string |  | The product type of the received product. |
| `product.name` | string |  | The name of the received product. |
| `image_url` | string |  | Image of the received product. |
| `product_id` | integer (int32) |  | Internal identifier of the received product. |
| `sku` | string |  | The stock keeping unit (SKU) of the received product. |
| `barcode` | string |  | The barcode of the received product. |
| `received_date` | string (date-time) |  | The date the goods were received. |
| `quantity` | number (double) |  | The quantity received. |
| `amount` | number (double) |  | The value of the goods received. |
| `landed_cost` | number (double) |  | The landed cost allocated to the received goods. |
| `total_cost` | number (double) |  | The total cost of the received goods including landed costs. |

</details>

<details>
<summary><code>GroupedReceivedGoodsLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `goods_receipts_note_dim_ids` | integer (int64)[] |  | Identifiers of the goods receipt notes rolled up into this group. |
| `location_dim_ids` | integer (int64)[] |  | Identifiers of the locations rolled up into this group. |
| `supplier_dim_ids` | integer (int64)[] |  | Identifiers of the suppliers rolled up into this group. |
| `purchase_agent_dim_ids` | integer (int64)[] |  | Identifiers of the purchasing agents rolled up into this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants rolled up into this group. |
| `purchase_return_dim_ids` | integer (int64)[] |  | Identifiers of the purchase returns rolled up into this group. |
| `purchase_order_dim_ids` | integer (int64)[] |  | Identifiers of the purchase orders rolled up into this group. |
| `country_dim_ids` | string[] |  | Identifiers of the countries of origin rolled up into this group. |
| `quantity` | number (double) |  | The total quantity received across the group. |
| `amount` | number (double) |  | The total value of goods received across the group. |
| `landed_cost` | number (double) |  | The total landed cost allocated across the group. |
| `total_cost` | number (double) |  | The total cost of received goods across the group including landed costs. |

</details>

<details>
<summary><code>BillLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this bill row. |
| `bill.dim_id` | integer (int64) |  | Identifier of the supplier bill this row rolls up to. |
| `purchase.dim_id` | integer (int64) |  | Identifier of the purchase order this row rolls up to. |
| `supplier.dim_id` | integer (int64) |  | Identifier of the supplier this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this row rolls up to. |
| `product.name` | string |  | The name of the billed product. |
| `purchase.number` | string |  | The purchase order number the bill relates to. |
| `bill.number` | string |  | The supplier bill number. |
| `refund.number` | string |  | The supplier refund (credit note) number, when the row represents a refund. |
| `bill_date` | string (date-time) |  | The date of the supplier bill. |
| `order_date` | string (date-time) |  | The date the purchase order was placed. |
| `sku` | string |  | The stock keeping unit (SKU) of the billed product. |
| `barcode` | string |  | The barcode of the billed product. |
| `image_url` | string |  | Image of the billed product. |
| `product_id` | integer (int32) |  | Internal identifier of the billed product. |
| `supplier.name` | string |  | The name of the supplier. |
| `quantity` | number (double) |  | The quantity billed on this line. |
| `gross_amount` | number (double) |  | The value of the line before discounts and tax. |
| `discount` | number (double) |  | The discount applied to the line. |
| `net_amount` | number (double) |  | The value of the line after discounts, before tax. |
| `tax` | number (double) |  | The tax charged on the line. |
| `total_amount` | number (double) |  | The total value of the line including tax. |
| `title` | string |  | The display title of the bill line. |

</details>

<details>
<summary><code>GroupedBillLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `supplier_dim_ids` | integer (int64)[] |  | Identifiers of the suppliers rolled up into this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants rolled up into this group. |
| `bill_dim_ids` | integer (int64)[] |  | Identifiers of the supplier bills rolled up into this group. |
| `purchase_order_dim_ids` | integer (int64)[] |  | Identifiers of the purchase orders rolled up into this group. |
| `quantity` | number (double) |  | The total quantity billed across the group. |
| `gross_amount` | number (double) |  | The total value across the group before discounts and tax. |
| `discounts` | number (double) |  | The total discount applied across the group. |
| `net_amount` | number (double) |  | The total value across the group after discounts, before tax. |
| `tax` | number (double) |  | The total tax charged across the group. |
| `total_amount` | number (double) |  | The total value across the group including tax. |

</details>

<details>
<summary><code>SupplierAgingLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `supplier_id` | integer (int64) |  | Identifier of the supplier this row rolls up to. |
| `supplier` | string |  | The name of the supplier. |
| `gross_amount` | number (double) |  | The total value purchased before discounts, taxes and refunds. |
| `discount` | number (double) |  | The total discount applied. |
| `refunds` | number (double) |  | The total amount refunded. |
| `net_amount` | number (double) |  | The value purchased after discounts and refunds, before tax. |
| `landed_costs` | number (double) |  | The landed costs added to the purchases. |
| `tax` | number (double) |  | The tax charged on the purchases. |
| `total_amount` | number (double) |  | The total value purchased including tax. |
| `billed_amount` | number (double) |  | The total amount billed by the supplier. |
| `paid_amount` | number (double) |  | The amount already paid to the supplier. |
| `due_amount` | number (double) |  | The amount still owed to the supplier. |
| `overdue_beyond_ninety_one` | number (double) |  | The outstanding amount overdue by more than 90 days. |
| `overdue_sixty_one_to_ninety` | number (double) |  | The outstanding amount overdue by 61 to 90 days. |
| `overdue_thirty_one_to_sixty` | number (double) |  | The outstanding amount overdue by 31 to 60 days. |
| `overdue_one_to_thirty` | number (double) |  | The outstanding amount overdue by 1 to 30 days. |
| `due_in_one_to_thirty` | number (double) |  | The outstanding amount falling due within the next 1 to 30 days. |
| `due_in_thirty_one_to_sixty` | number (double) |  | The outstanding amount falling due within the next 31 to 60 days. |
| `due_in_sixty_one_to_ninety` | number (double) |  | The outstanding amount falling due within the next 61 to 90 days. |
| `due_in_beyond_ninety_one` | number (double) |  | The outstanding amount falling due more than 90 days from now. |
| `bill_due_at` | string (date-time) |  | The date the supplier bill is due. |

</details>

```bash
curl -sS 'https://api.qoblex.com/v1/reporting/purchases' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/reporting/sales

**Get Sales Report**

Returns your sales figures so you can see how the business is selling. Filter, group, and sort
the results to break sales down by the dimensions you care about, whether you are checking a
slow week or reviewing the quarter.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `report_type` | query | enum(`sales_details`, `sales_by_product`, `shipments`, `invoices`, `refunds`, `customer_aging`, `sold_units_by_order`) |  | Type of sales report to generate. |
| `page` | query | integer (int32) |  | Page number for paginated results. |
| `group_by` | query | string |  | Field or dimension used to group report data. |
| `sort_by` | query | string |  | Field used to sort report results. |
| `include_summary` | query | boolean |  | Indicates whether summary metrics should be included in the response. |
| `dim_filters` | query | string |  | Dimension filters used to restrict report results. |
| `fact_filters` | query | string |  | Fact-based filters applied to report metrics. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of report records available. |
| `filtered_count` | integer (int32) |  | Number of report records after filters are applied. |
| `has_next_page` | boolean |  | Whether another page of results exists, when pagination applies. |
| `lines` | SaleDetailsLineItem \| GroupedSaleDetailsLineItem \| SalesByProductLineItem \| GroupedSalesByProductLineItem \| ShipmentLineItem \| GroupedShipmentLineItem \| InvoiceLineItem \| GroupedInvoiceLineItem \| RefundLineItem \| GroupedRefundLineItem \| CustomerAgingLineItem \| GroupedCustomerAgingLineItem[] |  | The report rows. Which shape you get depends on the report_type you requested; each option below corresponds to a report type (its grouped variant is used when you group the report). |
| `summary` | SaleDetailsSummary \| ShipmentSummary \| InvoiceSummary |  | Aggregated totals for the report, present when a summary is requested and available for the report type. |

`lines` is one of 12 row shapes, chosen by the
request parameter that selects the report. Each is listed below.

<details>
<summary><code>SaleDetailsLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this reporting row. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand this row rolls up to. |
| `country.dim_id` | string |  | Identifier of the destination country this row rolls up to. |
| `customer.dim_id` | integer (int64) |  | Identifier of the customer this row rolls up to. |
| `store.dim_id` | integer (int64) |  | Identifier of the connected store or integration this row rolls up to. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type this row rolls up to. |
| `sale_channel.dim_id` | integer (int64) |  | Identifier of the sales channel this row rolls up to. |
| `order.dim_id` | integer (int64) |  | Identifier of the sales order this line belongs to. |
| `location.dim_id` | integer (int64) |  | Identifier of the location this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this line refers to. |
| `custom_item.dim_id` | integer (int64) |  | Identifier of the custom (non-catalog) item on this line, if any. |
| `sale_agent.dim_id` | integer (int64) |  | Identifier of the sales agent this row rolls up to. |
| `created_at` | string (date-time) |  | The date the sales order was created. |
| `order.number` | string |  | The sales order number. |
| `sale_order_id` | integer (int64) |  | Internal identifier of the sales order. |
| `image_url` | string |  | Image URL for the product on this line. |
| `product_id` | integer (int32) |  | Internal identifier of the product on this line. |
| `status` | enum(`quote`, `open`, `closed`, `deleted`, `canceled`) |  | Current status of the sales order. |
| `customer.name` | string |  | Display name of the customer. |
| `sale_agent.name` | string |  | Display name of the sales agent. |
| `brand.name` | string |  | Display name of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `sale_channel.name` | string |  | Display name of the sales channel. |
| `store.name` | string |  | Display name of the connected store or integration. |
| `location.name` | string |  | Display name of the location. |
| `location.is_deleted` | boolean |  | Whether the location has been deleted in the source system. |
| `country.name` | string |  | Display name of the destination country. |
| `product.name` | string |  | Display name of the product on this line. |
| `sku` | string |  | The product's SKU. |
| `quantity_sold` | number (double) |  | Quantity of the product sold on this line. |
| `canceled_quantity` | number (double) |  | Quantity that was cancelled on this line. |
| `gross_sales` | number (double) |  | Sales value before discounts, taxes, and refunds. |
| `discounts` | number (double) |  | Total discounts applied on this line. |
| `refunds` | number (double) |  | Amount refunded against this line. |
| `net_sales` | number (double) |  | Sales after discounts and refunds are removed. |
| `custom_items` | number (double) |  | Net value of any custom (non-catalog) items on the order. |
| `tax` | number (double) |  | Total tax on this line. |
| `total_sales` | number (double) |  | Total sales value including tax. |
| `cost_of_goods_sold` | number (double) |  | The cost of the goods sold for this line. |
| `canceled_gross_sales` | number (double) |  | Gross sales value of the cancelled quantity. |
| `margin` | number (double) |  | Profit on this line after cost of goods sold. |
| `margin_percentage` | number (double) |  | Margin as a percentage of net sales. |
| `refund.number` | string |  | The refund number, if this line was refunded. |
| `return.number` | string |  | The return number, if this line was returned. |
| `return_type` | string |  | The type of return recorded for this line. |
| `quantity_returned` | number (double) |  | Quantity returned on this line. |
| `return_cogs` | number (double) |  | Cost of goods sold for the returned quantity. |
| `refund_date` | string (date-time) |  | The date the refund was recorded. |
| `quantity_refunded` | number (double) |  | Quantity refunded on this line. |
| `net_refund` | number (double) |  | Refund value before tax. |
| `tax_refund` | number (double) |  | Tax portion of the refund. |
| `total_refund` | number (double) |  | Total refund value including tax. |
| `shipment.number` | string |  | The shipment number, if this line was shipped. |
| `shipment_date` | string (date-time) |  | The date the shipment was recorded. |
| `quantity_shipped` | number (double) |  | Quantity shipped on this line. |
| `shipment_cogs` | number (double) |  | Cost of goods sold for the shipped quantity. |
| `invoice.number` | string |  | The invoice number, if this line was invoiced. |
| `barcode` | string |  | The product's barcode. |
| `line_type` | enum(`order_item`, `landed_cost`) |  | The kind of line this row represents (for example a product, custom, or shipping line). |
| `invoice_date` | string (date-time) |  | The date the invoice was recorded. |
| `invoice_quantity` | number (double) |  | Quantity invoiced on this line. |
| `total_invoice` | number (double) |  | Total invoiced value for this line. |
| `payment_number` | string |  | The payment reference, if a payment was recorded. |
| `payment_date` | string (date-time) |  | The date the payment was recorded. |
| `payment_amount` | number (double) |  | Amount paid against this line. |

</details>

<details>
<summary><code>GroupedSaleDetailsLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `brand_dim_ids` | integer (int64)[] |  | Identifiers of the brands included in this group. |
| `country_dim_ids` | string[] |  | Identifiers of the destination countries included in this group. |
| `customer_dim_ids` | integer (int64)[] |  | Identifiers of the customers included in this group. |
| `store_dim_ids` | integer (int64)[] |  | Identifiers of the connected stores or integrations included in this group. |
| `product_type_dim_ids` | integer (int64)[] |  | Identifiers of the product types included in this group. |
| `sale_channel_dim_ids` | integer (int64)[] |  | Identifiers of the sales channels included in this group. |
| `order_dim_ids` | integer (int64)[] |  | Identifiers of the sales orders included in this group. |
| `sale_agent_dim_ids` | integer (int64)[] |  | Identifiers of the sales agents included in this group. |
| `location_dim_ids` | integer (int64)[] |  | Identifiers of the locations included in this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants included in this group. |
| `custom_item_dim_ids` | integer (int64)[] |  | Identifiers of the custom (non-catalog) items included in this group. |
| `quantity_sold` | number (double) |  | Total quantity sold across this group. |
| `canceled_quantity` | number (double) |  | Total cancelled quantity across this group. |
| `gross_sales` | number (double) |  | Sales value before discounts, taxes, and refunds across this group. |
| `discounts` | number (double) |  | Total discounts applied across this group. |
| `refunds` | number (double) |  | Total amount refunded across this group. |
| `net_sales` | number (double) |  | Sales after discounts and refunds are removed across this group. |
| `custom_items` | number (double) |  | Net value of custom (non-catalog) items across this group. |
| `tax` | number (double) |  | Total tax across this group. |
| `total_sales` | number (double) |  | Total sales value including tax across this group. |
| `cost_of_goods_sold` | number (double) |  | The cost of the goods sold across this group. |
| `canceled_gross_sales` | number (double) |  | Gross sales value of the cancelled quantity across this group. |
| `margin` | number (double) |  | Total profit after cost of goods sold across this group. |
| `margin_percentage` | number (double) |  | Average margin as a percentage of net sales across this group. |
| `quantity_returned` | number (double) |  | Total quantity returned across this group. |
| `return_cogs` | number (double) |  | Cost of goods sold for the returned quantity across this group. |
| `quantity_refunded` | number (double) |  | Total quantity refunded across this group. |
| `net_refund` | number (double) |  | Refund value before tax across this group. |
| `tax_refund` | number (double) |  | Tax portion of refunds across this group. |
| `total_refund` | number (double) |  | Total refund value including tax across this group. |
| `quantity_shipped` | number (double) |  | Total quantity shipped across this group. |
| `shipment_cogs` | number (double) |  | Cost of goods sold for the shipped quantity across this group. |
| `invoice_quantity` | number (double) |  | Total quantity invoiced across this group. |
| `total_invoice` | number (double) |  | Total invoiced value across this group. |
| `payment_amount` | number (double) |  | Total amount paid across this group. |

</details>

<details>
<summary><code>SalesByProductLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this reporting row. |
| `order.dim_id` | integer (int64) |  | Identifier of the sales order this line belongs to. |
| `brand.dim_id` | integer (int64) |  | Identifier of the brand this row rolls up to. |
| `sale_channel.dim_id` | integer (int64) |  | Identifier of the sales channel this row rolls up to. |
| `store.dim_id` | integer (int64) |  | Identifier of the connected store or integration this row rolls up to. |
| `location.dim_id` | integer (int64) |  | Identifier of the location this row rolls up to. |
| `country.dim_id` | string |  | Identifier of the destination country this row rolls up to. |
| `sale_agent.dim_id` | integer (int64) |  | Identifier of the sales agent this row rolls up to. |
| `customer.dim_id` | integer (int64) |  | Identifier of the customer this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this line refers to. |
| `product_type.dim_id` | integer (int64) |  | Identifier of the product type this row rolls up to. |
| `product_id` | integer (int32) |  | Internal identifier of the product on this line. |
| `created_at` | string (date-time) |  | The date the sales order was created. |
| `brand.name` | string |  | Display name of the brand. |
| `product_type.name` | string |  | Display name of the product type. |
| `image_url` | string |  | Image URL for the product on this line. |
| `sale_channel.name` | string |  | Display name of the sales channel. |
| `store.name` | string |  | Display name of the connected store or integration. |
| `location.name` | string |  | Display name of the location. |
| `location.is_deleted` | boolean |  | Whether the location has been deleted in the source system. |
| `country.name` | string |  | Display name of the destination country. |
| `product.name` | string |  | Display name of the product on this line. |
| `sku` | string |  | The product's SKU. |
| `barcode` | string |  | The product's barcode. |
| `order.number` | string |  | The sales order number. |
| `sale_order_id` | integer (int64) |  | Internal identifier of the sales order. |
| `sale_agent.name` | string |  | Display name of the sales agent. |
| `customer.name` | string |  | Display name of the customer. |
| `status` | enum(`quote`, `open`, `closed`, `deleted`, `canceled`) |  | Current status of the sales order. |
| `gross_sales` | number (double) |  | Sales value before discounts, taxes, and refunds. |
| `discounts` | number (double) |  | Total discounts applied on this line. |
| `refunds` | number (double) |  | Amount refunded against this line. |
| `net_sales` | number (double) |  | Sales after discounts and refunds are removed. |
| `tax` | number (double) |  | Total tax on this line. |
| `total_sales` | number (double) |  | Total sales value including tax. |
| `cost_of_goods_sold` | number (double) |  | The cost of the goods sold for this line. |
| `margin` | number (double) |  | Profit on this line after cost of goods sold. |
| `margin_percent` | number (double) |  | Margin as a percentage of net sales. |
| `quantity` | number (double) |  | Quantity of the product sold on this line. |
| `quantity_returned` | number (double) |  | Quantity returned on this line. |
| `quantity_refunded` | number (double) |  | Quantity refunded on this line. |
| `quantity_shipped` | number (double) |  | Quantity shipped on this line. |
| `quantity_invoiced` | number (double) |  | Quantity invoiced on this line. |
| `cancelled_quantity` | number (double) |  | Quantity that was cancelled on this line. |
| `cancelled_gross_sales` | number (double) |  | Gross sales value of the cancelled quantity. |
| `realized_cogs` | number (double) |  | Cost of goods sold that has been realized (for example on shipped quantity). |
| `allocated_variant_type` | enum(`simple`, `bundle`, `component`) |  | The type of product variant on this line. |

</details>

<details>
<summary><code>GroupedSalesByProductLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `orders_count` | integer (int32) |  | Number of distinct orders in this group. |
| `gross_sales` | number (double) |  | Sales value before discounts, taxes, and refunds across this group. |
| `discounts` | number (double) |  | Total discounts applied across this group. |
| `refunds` | number (double) |  | Total amount refunded across this group. |
| `net_sales` | number (double) |  | Sales after discounts and refunds are removed across this group. |
| `tax` | number (double) |  | Total tax across this group. |
| `total_sales` | number (double) |  | Total sales value including tax across this group. |
| `cost_of_goods_sold` | number (double) |  | The cost of the goods sold across this group. |
| `quantity` | number (double) |  | Total quantity sold across this group. |
| `quantity_returned` | number (double) |  | Total quantity returned across this group. |
| `quantity_refunded` | number (double) |  | Total quantity refunded across this group. |
| `quantity_shipped` | number (double) |  | Total quantity shipped across this group. |
| `quantity_invoiced` | number (double) |  | Total quantity invoiced across this group. |
| `cancelled_quantity` | number (double) |  | Total cancelled quantity across this group. |
| `cancelled_gross_sales` | number (double) |  | Gross sales value of the cancelled quantity across this group. |
| `realized_cogs` | number (double) |  | Cost of goods sold that has been realized across this group. |
| `margin` | number (double) |  | Total profit after cost of goods sold across this group. |
| `margin_percent` | number (double) |  | Margin as a percentage of net sales across this group. |

</details>

<details>
<summary><code>ShipmentLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this reporting row. |
| `shipment.dim_id` | integer (int64) |  | Identifier of the shipment this line belongs to. |
| `order.dim_id` | integer (int64) |  | Identifier of the sales order this line belongs to. |
| `return.dim_id` | integer (int64) |  | Identifier of the related sales return, if this is a return shipment. |
| `location.dim_id` | integer (int64) |  | Identifier of the location this row rolls up to. |
| `customer.dim_id` | integer (int64) |  | Identifier of the customer this row rolls up to. |
| `sale_agent.dim_id` | integer (int64) |  | Identifier of the sales agent this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this line refers to. |
| `shipment.number` | string |  | The shipment number. |
| `return.number` | string |  | The return number, if this is a return shipment. |
| `order.number` | string |  | The sales order number. |
| `sale_order_id` | integer (int32) |  | Internal identifier of the sales order. |
| `location.name` | string |  | Display name of the location. |
| `location.is_deleted` | boolean |  | Whether the location has been deleted in the source system. |
| `customer.name` | string |  | Display name of the customer. |
| `sale_agent.name` | string |  | Display name of the sales agent. |
| `product.name` | string |  | Display name of the product on this line. |
| `image_url` | string |  | Image URL for the product on this line. |
| `product_id` | integer (int32) |  | Internal identifier of the product on this line. |
| `sku` | string |  | The product's SKU. |
| `barcode` | string |  | The product's barcode. |
| `quantity` | number (double) |  | Quantity shipped on this line. |
| `date` | string (date-time) |  | The date this row relates to. |
| `shipment_date` | string (date-time) |  | The date the shipment was recorded. |
| `gross_sales` | number (double) |  | Sales value before discounts, taxes, and refunds for the shipped goods. |
| `discounts` | number (double) |  | Total discounts applied on this line. |
| `net_sales` | number (double) |  | Sales after discounts are removed. |
| `cogs` | number (double) |  | The cost of the goods shipped on this line. |
| `margin` | number (double) |  | Profit on this line after cost of goods sold. |
| `margin_percent` | number (double) |  | Margin as a percentage of net sales. |

</details>

<details>
<summary><code>GroupedShipmentLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `shipment_dim_ids` | integer (int64)[] |  | Identifiers of the shipments included in this group. |
| `location_dim_ids` | integer (int64)[] |  | Identifiers of the locations included in this group. |
| `customer_dim_ids` | integer (int64)[] |  | Identifiers of the customers included in this group. |
| `user_dim_ids` | integer (int64)[] |  | Identifiers of the sales agents included in this group. |
| `order_dim_ids` | integer (int64)[] |  | Identifiers of the sales orders included in this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants included in this group. |
| `return_dim_ids` | integer (int64)[] |  | Identifiers of the sales returns included in this group. |
| `quantity` | number (double) |  | Total quantity shipped across this group. |
| `gross_sales` | number (double) |  | Sales value before discounts, taxes, and refunds across this group. |
| `discounts` | number (double) |  | Total discounts applied across this group. |
| `net_sales` | number (double) |  | Sales after discounts are removed across this group. |
| `cogs` | number (double) |  | The cost of the goods shipped across this group. |
| `margin` | number (double) |  | Total profit after cost of goods sold across this group. |
| `margin_percent` | number (double) |  | Margin as a percentage of net sales across this group. |

</details>

<details>
<summary><code>InvoiceLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this reporting row. |
| `customer.dim_id` | integer (int64) |  | Identifier of the customer this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this line refers to. |
| `invoice.dim_id` | integer (int64) |  | Identifier of the invoice this line belongs to. |
| `order.dim_id` | integer (int64) |  | Identifier of the sales order this line belongs to. |
| `custom_item.dim_id` | integer (int64) |  | Identifier of the custom (non-catalog) item on this line, if any. |
| `refund.dim_id` | integer (int64) |  | Identifier of the related refund, if this line was refunded. |
| `product.name` | string |  | Display name of the product on this line. |
| `order.number` | string |  | The sales order number. |
| `sale_order_id` | integer (int64) |  | Internal identifier of the sales order. |
| `invoice.number` | string |  | The invoice number. |
| `refund.number` | string |  | The refund number, if this line was refunded. |
| `invoice_date` | string (date-time) |  | The date the invoice was issued. |
| `order_date` | string (date-time) |  | The date the sales order was created. |
| `sku` | string |  | The product's SKU. |
| `barcode` | string |  | The product's barcode. |
| `image_url` | string |  | Image URL for the product on this line. |
| `product_id` | integer (int32) |  | Internal identifier of the product on this line. |
| `line_type` | enum(`order_item`, `landed_cost`) |  | The kind of line this row represents (for example a product, custom, or shipping line). |
| `customer.name` | string |  | Display name of the customer. |
| `quantity` | number (double) |  | Quantity invoiced on this line. |
| `gross_amount` | number (double) |  | Invoiced value before discounts and tax. |
| `discounts` | number (double) |  | Total discounts applied on this line. |
| `net_amount` | number (double) |  | Invoiced value after discounts, before tax. |
| `tax` | number (double) |  | Total tax on this line. |
| `total_amount` | number (double) |  | Total invoiced value including tax. |

</details>

<details>
<summary><code>GroupedInvoiceLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `customer_dim_ids` | integer (int64)[] |  | Identifiers of the customers included in this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants included in this group. |
| `sale_order_dim_ids` | integer (int64)[] |  | Identifiers of the sales orders included in this group. |
| `custom_item_dim_ids` | integer (int64)[] |  | Identifiers of the custom (non-catalog) items included in this group. |
| `invoice_dim_ids` | integer (int64)[] |  | Identifiers of the invoices included in this group. |
| `refund_dim_ids` | integer (int64)[] |  | Identifiers of the refunds included in this group. |
| `quantity` | number (double) |  | Total quantity invoiced across this group. |
| `gross_amount` | number (double) |  | Invoiced value before discounts and tax across this group. |
| `discounts` | number (double) |  | Total discounts applied across this group. |
| `net_amount` | number (double) |  | Invoiced value after discounts, before tax across this group. |
| `tax` | number (double) |  | Total tax across this group. |
| `total_amount` | number (double) |  | Total invoiced value including tax across this group. |

</details>

<details>
<summary><code>RefundLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this reporting row. |
| `refund.dim_id` | integer (int64) |  | Identifier of the refund this line belongs to. |
| `customer.dim_id` | integer (int64) |  | Identifier of the customer this row rolls up to. |
| `product.dim_id` | integer (int64) |  | Identifier of the product variant this line refers to. |
| `order.dim_id` | integer (int64) |  | Identifier of the sales order this line belongs to. |
| `custom_item.dim_id` | integer (int64) |  | Identifier of the custom (non-catalog) item on this line, if any. |
| `product.name` | string |  | Display name of the product on this line. |
| `product_id` | integer (int32) |  | Internal identifier of the product on this line. |
| `order.number` | string |  | The sales order number. |
| `refund.number` | string |  | The refund number. |
| `refund_date` | string (date-time) |  | The date the refund was recorded. |
| `order_date` | string (date-time) |  | The date the sales order was created. |
| `sku` | string |  | The product's SKU. |
| `image_url` | string |  | Image URL for the product on this line. |
| `barcode` | string |  | The product's barcode. |
| `customer.name` | string |  | Display name of the customer. |
| `reason` | string |  | The reason recorded for the refund. |
| `quantity` | number (double) |  | Quantity refunded on this line. |
| `net_amount` | number (double) |  | Refund value before tax. |
| `tax` | number (double) |  | Tax portion of the refund. |
| `total_amount` | number (double) |  | Total refund value including tax. |

</details>

<details>
<summary><code>GroupedRefundLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `refund_dim_ids` | integer (int64)[] |  | Identifiers of the refunds included in this group. |
| `customer_dim_ids` | integer (int64)[] |  | Identifiers of the customers included in this group. |
| `variant_dim_ids` | integer (int64)[] |  | Identifiers of the product variants included in this group. |
| `sale_order_dim_ids` | integer (int64)[] |  | Identifiers of the sales orders included in this group. |
| `custom_item_dim_ids` | integer (int64)[] |  | Identifiers of the custom (non-catalog) items included in this group. |
| `quantity` | number (double) |  | Total quantity refunded across this group. |
| `net_amount` | number (double) |  | Refund value before tax across this group. |
| `tax` | number (double) |  | Tax portion of refunds across this group. |
| `total_amount` | number (double) |  | Total refund value including tax across this group. |

</details>

<details>
<summary><code>CustomerAgingLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier for this reporting row. |
| `created_at` | string (date-time) |  | The date the sales order was created. |
| `order.dim_id` | integer (int64) |  | Identifier of the sales order this line belongs to. |
| `location.dim_id` | integer (int64) |  | Identifier of the location this row rolls up to. |
| `customer.dim_id` | integer (int64) |  | Identifier of the customer this row rolls up to. |
| `customer_id` | integer (int64) |  | Internal identifier of the customer. |
| `sale_agent.dim_id` | integer (int64) |  | Identifier of the sales agent this row rolls up to. |
| `sale_channel.dim_id` | integer (int64) |  | Identifier of the sales channel this row rolls up to. |
| `sale_channel.name` | string |  | Display name of the sales channel. |
| `store.dim_id` | integer (int64) |  | Identifier of the connected store or integration this row rolls up to. |
| `store.name` | string |  | Display name of the connected store or integration. |
| `country.dim_id` | string |  | Identifier of the destination country this row rolls up to. |
| `country.name` | string |  | Display name of the destination country. |
| `order.number` | string |  | The sales order number. |
| `location.name` | string |  | Display name of the location. |
| `location.is_deleted` | boolean |  | Whether the location has been deleted in the source system. |
| `sale_agent.name` | string |  | Display name of the sales agent. |
| `customer.name` | string |  | Display name of the customer. |
| `gross_amount` | number (double) |  | Order value before discounts and tax. |
| `discount` | number (double) |  | Total discount applied to the order. |
| `tax` | number (double) |  | Total tax on the order. |
| `total_amount` | number (double) |  | Total order value including tax. |
| `invoiced_amount` | number (double) |  | Amount that has been invoiced to the customer. |
| `refunded_amount` | number (double) |  | Amount that has been refunded to the customer. |
| `paid_amount` | number (double) |  | Amount the customer has already paid. |
| `due_amount` | number (double) |  | Amount still owed by the customer. |
| `overdue_beyond_ninety_one` | number (double) |  | Amount overdue by more than 90 days. |
| `overdue_sixty_one_to_ninety` | number (double) |  | Amount overdue by 61 to 90 days. |
| `overdue_thirty_one_to_sixty` | number (double) |  | Amount overdue by 31 to 60 days. |
| `overdue_one_to_thirty` | number (double) |  | Amount overdue by 1 to 30 days. |
| `due_in_one_to_thirty` | number (double) |  | Amount not yet overdue, due within the next 1 to 30 days. |
| `due_in_thirty_one_to_sixty` | number (double) |  | Amount not yet overdue, due within the next 31 to 60 days. |
| `due_in_sixty_one_to_ninety` | number (double) |  | Amount not yet overdue, due within the next 61 to 90 days. |
| `due_in_beyond_ninety_one` | number (double) |  | Amount not yet overdue, due beyond the next 90 days. |
| `invoice_due_at` | string (date-time) |  | The date the invoice is due. |

</details>

<details>
<summary><code>GroupedCustomerAgingLineItem</code></summary>

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `grouping_key` | object |  | The value this group is grouped by. |
| `grouping_by_dim` | IGroupingDim |  |  |
| `sale_order_dim_ids` | integer (int64)[] |  | Identifiers of the sales orders included in this group. |
| `location_dim_ids` | integer (int64)[] |  | Identifiers of the locations included in this group. |
| `customer_dim_ids` | integer (int64)[] |  | Identifiers of the customers included in this group. |
| `sale_agent_dim_ids` | integer (int64)[] |  | Identifiers of the sales agents included in this group. |
| `sale_channel_dim_ids` | integer (int64)[] |  | Identifiers of the sales channels included in this group. |
| `integration_dim_ids` | integer (int64)[] |  | Identifiers of the connected stores or integrations included in this group. |
| `country_dim_ids` | string[] |  | Identifiers of the destination countries included in this group. |
| `gross_amount` | number (double) |  | Order value before discounts and tax across this group. |
| `discount` | number (double) |  | Total discount applied across this group. |
| `tax` | number (double) |  | Total tax across this group. |
| `total_amount` | number (double) |  | Total order value including tax across this group. |
| `invoiced_amount` | number (double) |  | Amount that has been invoiced across this group. |
| `refunded_amount` | number (double) |  | Amount that has been refunded across this group. |
| `paid_amount` | number (double) |  | Amount already paid across this group. |
| `due_amount` | number (double) |  | Amount still owed across this group. |
| `overdue_beyond_ninety_one` | number (double) |  | Amount overdue by more than 90 days across this group. |
| `overdue_sixty_one_to_ninety` | number (double) |  | Amount overdue by 61 to 90 days across this group. |
| `overdue_thirty_one_to_sixty` | number (double) |  | Amount overdue by 31 to 60 days across this group. |
| `overdue_one_to_thirty` | number (double) |  | Amount overdue by 1 to 30 days across this group. |
| `due_in_one_to_thirty` | number (double) |  | Amount not yet overdue, due within the next 1 to 30 days across this group. |
| `due_in_thirty_one_to_sixty` | number (double) |  | Amount not yet overdue, due within the next 31 to 60 days across this group. |
| `due_in_sixty_one_to_ninety` | number (double) |  | Amount not yet overdue, due within the next 61 to 90 days across this group. |
| `due_in_beyond_ninety_one` | number (double) |  | Amount not yet overdue, due beyond the next 90 days across this group. |

</details>

```bash
curl -sS 'https://api.qoblex.com/v1/reporting/sales' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

