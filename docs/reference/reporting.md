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

```bash
curl -sS 'https://api.qoblex.com/v1/reporting/sales' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

