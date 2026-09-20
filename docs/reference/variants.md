# Variants

A variant is the individually stocked, priced, and tracked item beneath a product, identified by its SKU. Use these endpoints to list and filter your variants, review their incoming stock, organize them with groupings, and map them to your external platforms. Batches, suppliers, composition (bundles and bills of material), and prices each have their own section.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

6 endpoints.

### GET /v1/variants

**List Variants**

Returns your product variants so you can browse and sync your full catalog. Variants are
sorted by their identifier and returned in pages, letting you walk through large catalogs
without loading everything at once.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Products page number to return |
| `expand` | query | string |  | Comma separated values of properties to expand on and include in the response. The following values are supported for expansion: - `images` - `mappings` - `locations` - `price_lists` - `components` |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |

**Response** `200` `ProductVariantListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of products in the system (before filtering) |
| `filtered_count` | integer (int32) |  | Total number of products after applying filters (if any) |
| `variants` | ProductVariant[] |  | List of product variants in the current page |

```bash
curl -sS 'https://api.qoblex.com/v1/variants' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/variants/{id}/inventory

**Get Inventory**

Retrieves the incoming stock movements for a variant, so you can see stock that is expected
to arrive but has not yet been received into inventory. Each movement links back to the
source order driving it, helping you plan replenishment and set customer expectations.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the product variant. Example: `4821`. |

**Response** `200` `ProductVariantInventory`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `incoming` | ProductInventoryDetail[] |  | List of incoming stock movements for this variant. `null` if no incoming stock is expected. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/inventory' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/variants/external_links

**List External Links**

Retrieves your product variants alongside their external IDs, so you can see how each variant
maps to a third-party platform or integration. Filter by application or search term, or
restrict the list to only unsynced variants that have not yet been linked to an external
system, to find and fix gaps in your integration mapping.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `app_id` | query | integer (int32) |  | The unique identifier of the external application to filter variants by. |
| `search_term` | query | string |  | Search term to filter variants by name, SKU, or barcode. |
| `show_only_non_synced_variants` | query | boolean |  | If `true`, returns only variants that have not yet been linked to an external system. |
| `page` | query | integer (int32) |  | Page number for pagination. |

**Response** `200` `ProductVariantExternalLinkReportingResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of billing records available. |
| `filtered_count` | integer (int32) |  | Number of billing records returned for the current page. |
| `lines` | ProductVariantExternalLink[] |  | List of paginated invoice records. |
| `summary` | ProductVariantExternalLink |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/external_links' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/variants/external_links

**Create External Links**

Links your product variants to their matching external identifiers on a third-party platform,
so orders and stock stay aligned across systems. Map many variants in one request by sending
an array of variant and external ID pairs.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `app_id` | query | integer (int32) |  |  |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `variant_id` | integer (int32) |  | The unique identifier of the product variant to link. |
| `external_id` | string |  | The external identifier used to map this variant on the third-party platform. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/variants/external_links' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/variants/filters

**Get Filters**

Retrieves the available values for a variant filter dimension, such as suppliers, product
types, tags, brands, locations, or the variants themselves. Use it to populate typeahead
and filter controls so users pick from real values in your account rather than guessing.
Narrow a large dimension with `search_term` or a specific set of `ids`.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `type` | query | string |  | The filter dimension to retrieve values for. Supported values: - `suppliers` - `product_types` - `tags` - `brands` - `locations` - `variants` |
| `search_term` | query | string |  | Optional text used to narrow down the returned filter values by name. |
| `ids` | query | integer (int32)[] |  | Optional list of specific filter value identifiers to retrieve. |

**Response** `200` `ListFilterOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | FilterOption[] |  | List of variant options. `null` if none are found. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/filters' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/variants/groupings

**Get Groupings**

Retrieves the grouping values available for your variants, so you can organize, filter, and
analyze your catalog by the categories that matter to your business. Use it to build filters,
search interfaces, and reports over your inventory.

**Response** `200` `ProductGroupings`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `categories` | string[] |  | List of distinct category names associated with product variants. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/groupings' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

