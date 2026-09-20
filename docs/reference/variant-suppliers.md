# Variant Suppliers

Variant suppliers are the sourcing links between a variant and the suppliers you buy it from, carrying purchasing price, minimum order quantity, lead time, and which supplier is the default. List a variant's suppliers, compare sourcing across variants, and assign, update, or remove supplier links to keep procurement data current.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

4 endpoints.

### GET /v1/variants/{id}/suppliers

**List Suppliers for a Variant**

Retrieves the suppliers linked to a single variant, along with their purchasing conditions,
so you can compare sourcing options and manage buying strategy at the variant level.
Suppliers are returned in pages for variants with many sources.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the product variant. Example: `4821`. |
| `page` | query | integer (int32) |  | Page number for pagination |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |

**Response** `200` `ProductVariantSuppliers`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of suppliers for the variant. |
| `filtered_count` | integer (int32) |  | Number of suppliers after applying filters. |
| `suppliers` | ProductVariantSupplier[] |  | List of suppliers for the product variant. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/suppliers' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### PUT /v1/variants/{id}/suppliers

**Update Suppliers**

Updates the suppliers linked to a variant, letting you assign, modify, or replace supplier
relationships and their purchasing details in one request. Use it to keep procurement data
current as your sourcing arrangements change.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the product variant. Example: `4821`. |

**Request body** `ProductUpdateVariantSuppliersRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `product_variant_id` | integer (int32) |  | Identifier of the product variant. |
| `items` | ProductVariantSupplierUpdate[] |  | List of supplier assignments for the variant. |

**Response** `200` `ProductVariantSuppliers`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of suppliers for the variant. |
| `filtered_count` | integer (int32) |  | Number of suppliers after applying filters. |
| `suppliers` | ProductVariantSupplier[] |  | List of suppliers for the product variant. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/suppliers' \
  -X PUT \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/variants/{id}/suppliers/{supplier_id}

**Delete Supplier**

Removes a supplier from a variant, so you can retire sourcing arrangements you no longer use
and keep supplier records accurate. The removed supplier assignment, including its purchasing
information, is returned so you can confirm exactly what was unlinked.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the product variant. Example: `4821`. |
| `supplier_id` | path | integer (int32) | yes |  |

**Response** `200` `ProductVariantSupplier`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `supplier_id` | integer (int32) |  | Unique identifier of the supplier. |
| `name` | string |  | Supplier name. |
| `sku` | string |  | Supplier-specific Stock Keeping Unit for the product variant. |
| `purchase_price` | number (double) |  | Purchase price offered by the supplier. |
| `currency` | string |  | Currency of the purchase price. |
| `minimum_order_quantity` | number (double) |  | Minimum quantity that can be ordered from the supplier. |
| `is_default` | boolean |  | Indicates whether the supplier is the default supplier for the product variant or not. |
| `minimum_order_value` | number (double) |  | Minimum order value required by the supplier. |
| `lead_time` | number (double) |  | Supplier lead time. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/suppliers/{supplier_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/variants/suppliers

**List Suppliers**

Retrieves the suppliers linked to one or more variants, so you can plan procurement and
compare sourcing options in one place. The response carries supplier details, purchasing
information, minimum order requirements, lead times, and which supplier is the default.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `product_variant_ids` | query | integer (int32)[] |  | List of product variant identifiers to retrieve supplier information for. |

**Response** `200` `ProductListVariantsSuppliersResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | ProductSuppliersForVariantDto[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/suppliers' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

