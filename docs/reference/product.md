# Product

A product is the sellable item at the top of your catalog. Each product groups one or more variants (the individually stocked and priced SKUs) and carries shared catalog information such as name, type, and images. Use these endpoints to list products and retrieve a product with its variants; day-to-day stock, pricing, and supplier data live on the variants.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

12 endpoints.

### GET /v1/products

**List Products**

Returns your products, so you can browse or sync your full catalog into another system.
Products are sorted by their identifier and returned in pages of up to 50, so you page
through the list rather than pulling everything at once.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Products page number to return |
| `expand` | query | string |  | Comma separated values of properties to expand on and include in the response. The following values are supported for expansion: - `variants` - `images` - `mappings` - `variant.locations` - `variant.price_lists` - `variant.components` |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |

**Response** `200` `ProductsResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of products in the system (before filtering) |
| `filtered_count` | integer (int32) |  | Total number of products after applying filters (if any) |
| `products` | Product[] |  | List of products in the current page |

```bash
curl -sS 'https://api.qoblex.com/v1/products' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/products

**Create Product**

Creates a product together with any variants included in the request, as one consistent
catalog record. The options and variant option values must describe the same matrix, and
duplicate option combinations are rejected.

Variant stock quantities are not accepted here: warehouse operations own stock levels,
allocations, incoming quantities, and location balances.

**Request body** `Qoblex.Api.Products.Dto.ProductUpsertRequestDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Product id to update. The route id is used as the source of truth on update routes. |
| `name` | string |  | Product name shown in catalog, sales, purchasing, and reporting workflows. |
| `description` | string |  | Public product description used by customer-facing documents and connected channels. Empty string clears the description. |
| `notes` | string |  | Internal operator notes for the product. Empty string clears the notes. |
| `supplier_id` | integer (int32) |  | Primary supplier for the product when one supplier should be highlighted by default. |
| `options` | Qoblex.Api.Products.Dto.ProductUpsertOptionRequestDto[] |  | Product option definitions used to maintain the variant matrix. Include this only when option names or option values are changing. |
| `variants` | Qoblex.Api.Products.Dto.ProductUpsertVariantRequestDto[] |  | Variants to create or update. Omitted variants remain unchanged. |
| `images` | Qoblex.Api.Products.Dto.ProductUpsertImageRequestDto[] |  | Product images to link, update, order, or delete. Omitted images remain unchanged. |
| `is_archived` | boolean |  | Indicates whether the product should be hidden from active catalog operations. |
| `tags` | string |  | Comma-separated product tags used for filtering and grouping. Empty string clears all tags. |
| `product_type` | string |  | Product type used for catalog organization and reporting. Empty string clears the type. |
| `handle` | string |  | URL-friendly product handle used by connected channels or storefront workflows when applicable. |
| `sales_tax_class_id` | integer (int32) |  | Sales tax class applied to the product for selling workflows. |
| `brand` | string |  | Product brand used for grouping, channel mappings, and reporting. Empty string clears the brand. |

**Response** `200` `Product`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the product |
| `name` | string |  | Name of the product |
| `description` | string |  | Description of the product |
| `notes` | string |  | Internal notes attached to the product |
| `options` | ProductOptions[] |  | List of variant options defined for the product (e.g. Color, Size) |
| `updated_at` | string (date-time) |  | Last update date of the product |
| `is_archived` | boolean |  | Whether the product is archived and no longer active |
| `tags` | string |  | Comma separated list of tags associated with the product |
| `product_type` | string |  | Category or type of the product |
| `brand` | string |  | Brand of the product |
| `supplier` | ProductSupplier |  |  |
| `links` | ProductIntegrationMapping[] |  | External platform mappings for the product |
| `images` | ProductAttachment[] |  | List of images attached to the product |
| `variants` | ProductVariant[] |  | List of variants for the product, each representing a specific combination of options |

```bash
curl -sS 'https://api.qoblex.com/v1/products' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/products/{id}

**Get Product**

Retrieves the full details of a single product by its identifier, so you can look up its
variants, SKUs, and catalog data for one item without paging through the whole list.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the product to retrieve, for example `1024`. |
| `expand` | query | string |  | Comma separated values of properties to expand on and include in the response. The following values are supported for expansion: - `variants` - `images` - `mappings` - `variant.locations` - `variant.price_lists` - `variant.components` |

**Response** `200` `Product`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the product |
| `name` | string |  | Name of the product |
| `description` | string |  | Description of the product |
| `notes` | string |  | Internal notes attached to the product |
| `options` | ProductOptions[] |  | List of variant options defined for the product (e.g. Color, Size) |
| `updated_at` | string (date-time) |  | Last update date of the product |
| `is_archived` | boolean |  | Whether the product is archived and no longer active |
| `tags` | string |  | Comma separated list of tags associated with the product |
| `product_type` | string |  | Category or type of the product |
| `brand` | string |  | Brand of the product |
| `supplier` | ProductSupplier |  |  |
| `links` | ProductIntegrationMapping[] |  | External platform mappings for the product |
| `images` | ProductAttachment[] |  | List of images attached to the product |
| `variants` | ProductVariant[] |  | List of variants for the product, each representing a specific combination of options |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/products/{id}

**Update Product**

Applies partial catalog changes to a product. Omitted scalar fields are left unchanged and
an empty string clears a text value; omitted collections are left unchanged, while included
collections are treated as upserts. Option changes are validated against the variant matrix
before they are accepted. Deleting variants, images, components, or external links is done
through the dedicated delete operations, not by omitting them here.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the product to update, for example `1024`. |

**Request body** `Qoblex.Api.Products.Dto.ProductUpsertRequestDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Product id to update. The route id is used as the source of truth on update routes. |
| `name` | string |  | Product name shown in catalog, sales, purchasing, and reporting workflows. |
| `description` | string |  | Public product description used by customer-facing documents and connected channels. Empty string clears the description. |
| `notes` | string |  | Internal operator notes for the product. Empty string clears the notes. |
| `supplier_id` | integer (int32) |  | Primary supplier for the product when one supplier should be highlighted by default. |
| `options` | Qoblex.Api.Products.Dto.ProductUpsertOptionRequestDto[] |  | Product option definitions used to maintain the variant matrix. Include this only when option names or option values are changing. |
| `variants` | Qoblex.Api.Products.Dto.ProductUpsertVariantRequestDto[] |  | Variants to create or update. Omitted variants remain unchanged. |
| `images` | Qoblex.Api.Products.Dto.ProductUpsertImageRequestDto[] |  | Product images to link, update, order, or delete. Omitted images remain unchanged. |
| `is_archived` | boolean |  | Indicates whether the product should be hidden from active catalog operations. |
| `tags` | string |  | Comma-separated product tags used for filtering and grouping. Empty string clears all tags. |
| `product_type` | string |  | Product type used for catalog organization and reporting. Empty string clears the type. |
| `handle` | string |  | URL-friendly product handle used by connected channels or storefront workflows when applicable. |
| `sales_tax_class_id` | integer (int32) |  | Sales tax class applied to the product for selling workflows. |
| `brand` | string |  | Product brand used for grouping, channel mappings, and reporting. Empty string clears the brand. |

**Response** `200` `Product`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the product |
| `name` | string |  | Name of the product |
| `description` | string |  | Description of the product |
| `notes` | string |  | Internal notes attached to the product |
| `options` | ProductOptions[] |  | List of variant options defined for the product (e.g. Color, Size) |
| `updated_at` | string (date-time) |  | Last update date of the product |
| `is_archived` | boolean |  | Whether the product is archived and no longer active |
| `tags` | string |  | Comma separated list of tags associated with the product |
| `product_type` | string |  | Category or type of the product |
| `brand` | string |  | Brand of the product |
| `supplier` | ProductSupplier |  |  |
| `links` | ProductIntegrationMapping[] |  | External platform mappings for the product |
| `images` | ProductAttachment[] |  | List of images attached to the product |
| `variants` | ProductVariant[] |  | List of variants for the product, each representing a specific combination of options |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/products/{id}

**Delete Product**

Soft-deletes a product, hiding it from active catalog operations while keeping its variants,
images, composition, and external links attached, so it can be restored later with its
structure intact.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the product to delete, for example `1024`. |
| `force` | query | boolean |  | Set to `true` only to bypass operational checks when deleting. |

**Response** `200` `Qoblex.Api.Products.Dto.ProductDeletedResponseDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Identifier of the deleted product. |
| `deleted` | boolean |  | Always true; confirms the delete was applied. |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/products/{id}/external_links

**List External Links**

Returns the external systems a product is locally linked to. External links map a Qoblex
product and its variants to identifiers in commerce channels, marketplaces, accounting
systems, and other connected systems. Reading links does not call those external systems.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the product whose external links to list. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `integration_id` | integer (int32) |  |  |
| `external_product_id` | string |  |  |
| `variants` | Qoblex.Api.Products.Dto.ProductExternalVariantLinkDto[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}/external_links' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/products/{id}/external_links

**Create External Link**

Creates or amends a product's local link to an external system. A product can have at most
one link per integration and may link to many integrations. Variant mappings are optional,
since some external systems do not expose separate variant identifiers. This changes only
Qoblex's local mapping; it does not publish, unpublish, create, or delete anything in the
external system.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the product to link. |

**Request body** `Qoblex.Api.Products.Dto.ProductExternalLinkRequestDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `integration_id` | integer (int32) |  |  |
| `external_product_id` | string |  |  |
| `variants` | Qoblex.Api.Products.Dto.ProductExternalVariantLinkRequestDto[] |  |  |

**Response** `200` `Qoblex.Api.Products.Dto.ProductExternalLinkDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `integration_id` | integer (int32) |  |  |
| `external_product_id` | string |  |  |
| `variants` | Qoblex.Api.Products.Dto.ProductExternalVariantLinkDto[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}/external_links' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/products/{id}/external_links/{integration_id}

**Update External Link**

Amends the local external link for one product and integration, identified by the
integration id in the route. Variant mappings omitted from the request are preserved, so a
partial mapping update never unlinks variants by accident.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the product. |
| `integration_id` | path | integer (int32) | yes | The identifier of the integration whose link to update. |

**Request body** `Qoblex.Api.Products.Dto.ProductExternalLinkRequestDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `integration_id` | integer (int32) |  |  |
| `external_product_id` | string |  |  |
| `variants` | Qoblex.Api.Products.Dto.ProductExternalVariantLinkRequestDto[] |  |  |

**Response** `200` `Qoblex.Api.Products.Dto.ProductExternalLinkDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `integration_id` | integer (int32) |  |  |
| `external_product_id` | string |  |  |
| `variants` | Qoblex.Api.Products.Dto.ProductExternalVariantLinkDto[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}/external_links/{integration_id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/products/{id}/external_links/{integration_id}

**Delete External Link**

Removes a product's local link to one integration, along with its variant mappings. Only the
local mapping is removed; the external product and its variants are not deleted, unpublished,
or modified.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the product. |
| `integration_id` | path | integer (int32) | yes | The identifier of the integration whose link to remove. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}/external_links/{integration_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/products/{id}/variants

**List Product Variants**

Returns the variants of a single product, the sellable combinations of its options (for
example Size = Medium, Color = Blue). This endpoint uses offset pagination: `limit`
sets the page size (default 50, maximum 500) and `offset` skips ahead, and the
response includes `total_count` so you can page through every variant of the product
by advancing `offset`, all from this one endpoint. Use `expand` to include
related detail: `image`, `images`, `locations`, `price_lists`, and
`components`; omit expansions when variant identity, SKU, option values, and display
order are enough.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The unique identifier of the product whose variants to list, for example `1024`. |
| `limit` | query | integer (int32) |  | Maximum number of variants to return in this page. Use smaller pages when expanded stock or price details are included. |
| `offset` | query | integer (int32) |  | Number of variants to skip before returning this page. |
| `expand` | query | string |  | Optional related variant details to include, such as image, locations, price lists, or components. |
| `filters` | query | string |  | Optional filter expression for narrowing the variant list. |
| `sort_by` | query | string |  | Optional sort expression for ordering the variant list. |

**Response** `200` `Qoblex.Api.Products.Dto.ProductVariantPageDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | Qoblex.Api.Products.Dto.ProductDetailVariantDto[] |  | Variants returned for this page. |
| `limit` | integer (int32) |  | Maximum number of variants requested for this page. |
| `offset` | integer (int32) |  | Number of variants skipped before this page. |
| `total_count` | integer (int32) |  | Total number of variants matching the product and filters. |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}/variants' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### DELETE /v1/products/{id}/variants/{variant_id}

**Delete Product Variant**

Permanently removes a single variant from a product, deleting the catalog-owned detail for
that variant. Deleting a product does not delete its variants, and deleting a variant does
not delete the product.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the product the variant belongs to. |
| `variant_id` | path | integer (int32) | yes | The unique identifier of the variant to delete. |
| `force` | query | boolean |  | Set to `true` only to bypass operational checks when deleting. |

**Response** `200` `Qoblex.Api.Products.Dto.DeleteVariantResponseDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `product_id` | integer (int32) |  |  |
| `deleted_variant_id` | integer (int32) |  |  |
| `has_variants` | boolean |  |  |
| `options` | Qoblex.Api.Products.Dto.DeleteVariantOptionDto[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/products/{id}/variants/{variant_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/products/overview

**List Product Overviews**

Returns a lightweight, at-a-glance row for each product, ideal for building catalog list
views without pulling full product detail. Each row carries the product's identity, its
first image, variant count, quantity totals, a SKU summary, tags, and external links, in
pages of up to 50. Use List Products or Get Product when you need complete product fields
or variant details.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `offset` | query | integer (int32) |  | The number of products to skip before returning the next overview page. Each overview page contains up to 50 products. |

**Response** `200` `Qoblex.Api.Products.Dto.ProductOverviewResponseDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | Qoblex.Api.Products.Dto.ProductOverviewItemDto[] |  | The product overview rows returned for this page. |
| `limit` | integer (int32) |  | The fixed number of products requested per overview page. |
| `offset` | integer (int32) |  | The number of matching products skipped before this page. |
| `total_count` | integer (int32) |  | The total number of matching active products in the current inventory. |

```bash
curl -sS 'https://api.qoblex.com/v1/products/overview' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

