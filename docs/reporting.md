# Reporting

Four endpoints answer most of what anyone actually wants to ask: `/v1/reporting/sales`,
`/v1/reporting/purchases`, `/v1/reporting/inventory` and `/v1/reporting/forecasting`.

They are also the least self-describing part of the API, which is why this page exists.

## `report_type` picks the calculation and the row shape together

Each endpoint takes a `report_type`, and it does two things at once: it selects what is
computed, and it selects which row shape comes back in `lines`. The values are an enum on
the parameter, so they are in the reference:

| Endpoint | `report_type` |
| --- | --- |
| `/v1/reporting/inventory` | `stock_on_hand`, `stock_movement`, `stock_allocations`, `inventory_turnover`, `inventory_reorder`, `inventory_aging` |
| `/v1/reporting/sales` | `sales_details`, `sales_by_product`, `shipments`, `invoices`, `refunds`, `customer_aging`, `sold_units_by_order` |
| `/v1/reporting/purchases` | `purchase_details`, `purchases_by_product`, `received_goods`, `bills`, `supplier_aging` |
| `/v1/reporting/forecasting` | `forecasting`, `forecasting_weekly_history` |

`lines` is a union of row shapes, one per report, and every one is fully typed. The fields
are in [the reference](reference/reporting.md) under each endpoint's response. The variant
names match the `report_type` values closely enough to read off: `stock_movement` returns
`StockMovementLineItem`, `inventory_reorder` returns `InventoryReorderItem`.

On `/v1/reporting/inventory`, `include` chooses what to compute: `lines` for the current
page of rows, `count` for the total across the filtered set, `summary` for the aggregate
totals. Ask only for what you will read.

## Dimensions are real but not in the document

`group_by`, `sort_by`, `dim_filters` and `fact_filters` all accept a fixed set of values
per report, and none of those sets is published in the OpenAPI document yet. They are not
free text and guessing will not work.

`GET /v1/reporting/filters` returns the filters available across the reports and takes a
`type`, so it answers at runtime what the document does not answer at design time. Call it
once while building, not on every run.

## The questions people actually ask

### What will run out, and what should I order

`report_type=inventory_reorder` on `/v1/reporting/inventory`. One row per variant carrying
`quantity`, `allocated_quantity`, `available_quantity`, `incoming_quantity`,
`sold_quantity`, `buffer_quantity`, `on_back_order_quantity`, `purchase_price` and the
supplier. That is most of a reorder decision in a single row, and it beats assembling the
same picture from `/v1/variants` yourself.

For a projection rather than a position, `/v1/reporting/forecasting` takes `from_date`,
`to_date`, `stock_projection_period`, `coverage_target_weeks`, `projection_mode` and
`supplier_selection_mode`, and `variant_scope` switches between finished products and
BOM-derived raw material demand.

### What stock did we hold this time last year

`report_type=stock_movement`. This is the one that is easy to miss, because the historical
position is **a row, not a query parameter**: there is no as-of date anywhere in the API,
and looking for one is how you conclude, wrongly, that history is not available.

`StockMovementLineItem` is per variant, per location, per period:

- `record_date` is the period the row covers, and is your time axis.
- `opening_balance` and `closing_balance` are the quantity on hand at the start and end of
  that period; `opening_value` and `closing_value` are the same two, valued.
- `received_quantity`, `shipped_quantity`, `sale_return_quantity`,
  `supplier_return_quantity`, `manufactured_quantity`, `stock_adjustment_quantity` and
  `transfer_quantity` are the movements that got it from one to the other, each with a
  matching `_value`.

So "stock on hand for the same period last year" is a `dim_filters` on `record_date` over
last year's window, reading `closing_balance`. Group by `product.dim_id`, `brand.dim_id`,
`product_type.dim_id` or `location.dim_id`.

`stock_on_hand` is the current position, not a historical one. Its `updated_at` is a
per-row last-changed timestamp, so filtering on it gives you "rows touched since X" rather
than "stock as it stood on X". Those are not the same question and the difference is
silent.

### Incoming stock: two different meanings

Worth settling before you build, because they are different reports and only one has
history:

| What you mean | Where it is | Historical? |
| --- | --- | --- |
| Already arrived from suppliers, during a period | `received_quantity` on `stock_movement` | Yes |
| On order, not yet arrived | `incoming_quantity` on `stock_on_hand` and `InventoryReorderItem` | **No, current only** |

There is no historical on-order position: you cannot ask what was on order this time last
year. If that is the question, the honest answer is that the API does not hold it.

### What are our outstanding purchase orders worth, by supplier

Not a report. `GET /v1/purchase_orders/open_purchases` returns open purchase orders already
grouped by supplier and takes `supplier_ids`. Use it rather than paging
`/v1/purchase_orders` and grouping yourself.

### Which purchase orders are overdue

`GET /v1/purchase_orders` filtering `estimated_delivery_date` against today alongside
`receiving_status`, with `expand=supplier,grns` so you have who to chase and what has
already arrived. Note this endpoint uses the second filter dialect: see
[conventions](conventions.md#there-are-two-filter-engines-and-they-are-not-compatible).

### Raise the purchase orders for a set of sale orders

`GET /v1/sale_orders/preview_purchase_orders` shows what would be created and creates
nothing; `POST /v1/sale_orders/create_purchase_orders` then aggregates the line items into
draft purchase orders, one per supplier. For drop-ship specifically,
`GET /v1/sale_orders/{id}/drop_ship/items` then `POST /v1/sale_orders/{id}/drop_ship`
raises supplier orders shipping direct to the customer.

Preview first. It is a read-only call that costs one request and tells you exactly what the
write would do.

## Paging

The reporting lists page with a zero-based `page` and report `has_next_page` outright, so
you do not have to infer the end from a short page. At 30 requests per 60 seconds, group on
the server rather than paging every row and grouping locally.
