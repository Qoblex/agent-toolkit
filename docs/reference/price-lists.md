# Price Lists

A price list defines custom or tiered pricing that overrides your default sell prices for the customers assigned to it. Use these endpoints to list the price lists on your account; a customer's assigned price list then determines the prices applied on their quotes and orders.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

4 endpoints.

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

### POST /v1/price_lists/csv

**Import Price Lists CSV**

Uploads a price list CSV and applies it in the background, one page of rows at a time, so a
large catalog no longer times out the request. Only prices that differ from what is already
stored are written, so re-sending an unmodified export changes nothing. Rows whose ID does
not match a product variant on your account are skipped and reported on the finished job.
Poll the returned job via `GET /v1/jobs` to follow progress and completion.

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
curl -sS 'https://api.qoblex.com/v1/price_lists/csv' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/price_lists/export

**Export Price Lists CSV**

Prepares a CSV of every product variant pre-filled with its current price in each of your
price lists, in the background so a large catalog never times out the request. Edit the file
and send it back to `POST /v1/price_lists/csv` to apply your changes. Poll the returned
job via `GET /v1/jobs`; once it completes, the job's output is a signed download URL.

**Response** `200` `Job`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string |  | Unique identifier of the job. |
| `name` | string |  | Name of the job. |
| `status` | string |  | Status of the job. |
| `output` | string |  | Extra metadata associated with the job. |

```bash
curl -sS 'https://api.qoblex.com/v1/price_lists/export' \
  -X POST \
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

