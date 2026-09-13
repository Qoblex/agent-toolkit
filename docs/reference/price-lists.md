# Price Lists

A price list defines custom or tiered pricing that overrides your default sell prices for the customers assigned to it. Use these endpoints to list the price lists on your account; a customer's assigned price list then determines the prices applied on their quotes and orders.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

2 endpoints.

### GET /v1/price_lists

**List Price Lists**

Returns a paginated list of your price lists. Price lists let you offer custom or tiered
pricing to different customers, so a regular customer and a preferred one can each see the
prices you set for them. Use this to review the price lists you have defined and how they
apply across your customer base.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Products page number to return |

**Response** `200` `PriceListsResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of price lists returned (before filtering) |
| `filtered_count` | integer (int32) |  | Number of price lists after filters/search are applied (if any) |
| `price_lists` | PriceList[] |  | List of price list objects |

```bash
curl -sS 'https://api.qoblex.com/v1/price_lists' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/variants/prices

**Update Prices**

Updates prices for one or more variants across your price lists in a single request, so you
can roll out pricing changes efficiently across customers, channels, or pricing tiers.

**Request body** `UpsertProductVariantPricesRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `prices` | ProductVariantPriceItem[] |  | List of variant price updates. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/variants/prices' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

