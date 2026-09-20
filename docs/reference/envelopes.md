# List responses: envelopes and paging

Generated from the spec. Two things vary per endpoint and neither can be inferred from
the last endpoint you called: the key that holds the records, and how you ask for the
next page.

## Paginated lists (25)

The records sit under the key named here. Page against `count`, which is the total and
tracks the filter. `filtered_count` is the row count of the page in hand, not a total,
whatever the schema description says.

| Path | Records under | Paging | All keys |
| --- | --- | --- | --- |
| `/v1/activity` | `data` | `page` + `page_size` | `data`, `total_count`, `prev`, `next` |
| `/v1/adjustments` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/adjustments/{id}/items` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/batches` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/custom_fields` | `custom_fields` | `page` (zero-based) | `count`, `filtered_count`, `custom_fields` |
| `/v1/custom_fields/definitions` | `custom_fields` | `page` (zero-based) | `count`, `filtered_count`, `custom_fields` |
| `/v1/customers` | `customers` | `page` (zero-based) | `count`, `filtered_count`, `customers` |
| `/v1/manufacturing_orders` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/price_lists` | `price_lists` | `page` (zero-based) | `count`, `filtered_count`, `price_lists` |
| `/v1/products` | `products` | `page` (zero-based) | `count`, `filtered_count`, `products` |
| `/v1/products/{id}/variants` | `data` | `limit` + `offset` | `data`, `limit`, `offset`, `total_count` |
| `/v1/products/overview` | `data` | `offset` | `data`, `limit`, `offset`, `total_count` |
| `/v1/purchase_orders` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/purchase_orders/linkable_orders` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/quotes` | `quotes` | `page` (zero-based) | `count`, `filtered_count`, `quotes` |
| `/v1/reporting/forecasting` | `lines` | `page` (zero-based) | `count`, `filtered_count`, `has_next_page`, `lines`, `summary` |
| `/v1/reporting/inventory` | `lines` | `page` (zero-based) | `count`, `filtered_count`, `has_next_page`, `lines`, `summary` |
| `/v1/reporting/purchases` | `lines` | `page` (zero-based) | `count`, `filtered_count`, `has_next_page`, `lines`, `summary` |
| `/v1/reporting/sales` | `lines` | `page` (zero-based) | `count`, `filtered_count`, `has_next_page`, `lines`, `summary` |
| `/v1/sale_orders` | `sale_orders` | `page` (zero-based) | `count`, `filtered_count`, `sale_orders` |
| `/v1/sale_orders/linkable_orders` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/suppliers` | `lines` | `page` (zero-based) | `lines`, `count`, `filtered_count` |
| `/v1/variants` | `variants` | `page` (zero-based) | `count`, `filtered_count`, `variants` |
| `/v1/variants/{id}/suppliers` | `suppliers` | `page` (zero-based) | `count`, `filtered_count`, `suppliers` |
| `/v1/variants/external_links` | `lines` | `page` (zero-based) | `count`, `filtered_count`, `lines`, `summary` |

## Unpaginated, returning a bare array (11)

These return a JSON array at the top level. There is no envelope and no key to read,
so `response.users` is `undefined` and the whole set comes back in one request.

| Path |
| --- |
| `/v1/account/adjustment_reasons` |
| `/v1/account/locations` |
| `/v1/account/stores` |
| `/v1/currencies` |
| `/v1/products/{id}/external_links` |
| `/v1/purchase_orders/{id}/attachments` |
| `/v1/sale_orders/{id}/attachments` |
| `/v1/sale_orders/{id}/drop_ship/items` |
| `/v1/settings/payment_terms` |
| `/v1/tax_classes` |
| `/v1/users` |
