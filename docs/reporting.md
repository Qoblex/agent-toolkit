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

## Dimensions: not in the document, and not discoverable either

`group_by`, `sort_by`, `dim_filters` and `fact_filters` accept a fixed set of values per
report, and none of those sets is published. They are not free text.

**These four exist only here.** The reporting endpoints read a reporting model rather than
the operational tables, which is why they filter by dimension and fact rather than by
column, and why none of the other 20 list endpoints accepts any of them. Those take
`filters` against their own fields instead. A dimension name and a column name are not
interchangeable in either direction.

**`GET /v1/reporting/filters` is the endpoint that would answer this, and it returns `500`
on every input** (checked 2026-09-20, with and without `type`, on every documented value).

**The row schema is the answer instead**, and it works today: the fields a report filters on
are the fields it returns. `stock_movement` returns `StockMovementLineItem`, so `record_date`
and `closing_balance` are valid, and both are accepted:

```text
GET /v1/reporting/inventory?report_type=stock_movement
    &dim_filters=record_date>=2025-09-01T00:00:00Z , record_date<=2025-10-01T00:00:00Z
```

28,170 rows down to 1,627 on a live account. `fact_filters=closing_balance>0` narrows the
same report to 9,281. Note the spaces around the comma: these take the second filter
dialect, and a bare `,` is a `422`.

So read the variant for your `report_type` in [the reference](reference/reporting.md), and
use its field names. What you cannot get that way is `group_by`, whose accepted values are
neither published nor derivable.

Three behaviours to know while it is, because they differ and only one of them tells you
anything:

| | |
| --- | --- |
| `group_by` with a bad or unsupported value | `422`, with a useful message: `Grouping is not supported for Inventory Reorder Report.` |
| `dim_filters` with a field from the row schema | works, and narrows `count` |
| `dim_filters` with a nonsense field | **`200`, silently ignored.** You get an unfiltered report that looks filtered |
| `sort_by` with a field the endpoint lacks | `204`, no body at all. Your result set is empty and nothing says why |

The middle one is the dangerous one: a report you believe is scoped to a warehouse or a
brand, and is not, reads as a plausible answer. So check a `dim_filters` expression actually changes `count` before trusting it. That one
comparison separates a filter that worked from one that was thrown away.

`GET /v1/variants/filters` does work, and answers for variants rather than reports: passing
no `type` returns a `400` naming its own supported values (`suppliers`, `product_types`,
`tags`, `brands`, `locations`, `variants`), which is a neat way to ask an endpoint what it
takes.

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

### Which of our POs are drop-ship

`GET /v1/purchase_orders?filters=type=="DropShipPo"`. The `type` field was remodelled in
September 2026 and is now filterable, with three values: `RegularPO`, `FreightPO` and
`DropShipPo`. Freight orders are the landed-cost ones, billed but never received, so
excluding them is usually what you want when you are counting goods on order.

Remember this endpoint takes the second filter dialect, so string values are double-quoted:
see [conventions](conventions.md#there-are-two-filter-engines-and-they-are-not-compatible).

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
