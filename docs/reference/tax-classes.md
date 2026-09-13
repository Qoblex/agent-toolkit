# Tax Classes

Tax classes are the rates you charge or pay - a single flat rate, or several components combined
            (including compound taxes). These endpoints create, read, update, and retire tax classes,
            independently of your account's default-tax settings.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

5 endpoints.

### GET /v1/tax_classes

**List Tax Classes**

Returns the account's tax classes, each with its components. Narrow the list by active status.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `filters` | query | string |  | Filters to apply on the tax list: property operator value. Supported properties: `id`, `name`, `accounting_reference_id`, `tax_type`, `is_deleted`. Supported operators: `==`, `!=`, `@=*` (contains, case-insensitive). String values must be double-quoted. Combine multiple filters with `,` (AND) or `\|` (OR). |
| `sort_by` | query | string |  | Sorting to apply on the tax list: prefix with - for descending, no prefix for ascending. Supported properties: `id`, `name`, `accounting_reference_id`, `tax_type`. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the tax class. |
| `name` | string |  | Name of the tax. |
| `tax_type` | string |  | Whether this is a sales tax or a purchases tax. |
| `accounting_reference_id` | string |  | External accounting reference id, if any. |
| `is_active` | boolean |  | Whether the tax is active (false once deleted). |
| `components` | TaxComponentResponse[] |  | The components that make up the tax. |

```bash
curl -sS 'https://api.qoblex.com/v1/tax_classes' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/tax_classes

**Create Tax Class**

Creates a tax class made up of one or more components. Once created, it's available to select
on orders and products.

**Request body** `CreateTaxClassRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string |  | Name of the tax. |
| `tax_type` | enum(`SALES`, `PURCHASES`) | yes | Whether this is a sales tax or a purchases tax. |
| `components` | CreateTaxComponentRequest[] |  | Components that make up the tax (at least one). |
| `accounting_reference_id` | string |  | Optional external accounting reference id. |

**Response** `200` `TaxClassResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the tax class. |
| `name` | string |  | Name of the tax. |
| `tax_type` | string |  | Whether this is a sales tax or a purchases tax. |
| `accounting_reference_id` | string |  | External accounting reference id, if any. |
| `is_active` | boolean |  | Whether the tax is active (false once deleted). |
| `components` | TaxComponentResponse[] |  | The components that make up the tax. |

```bash
curl -sS 'https://api.qoblex.com/v1/tax_classes' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/tax_classes/{id}

**Get Tax Class**

Returns a single tax class, including its components.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The tax class to retrieve. Example: `42`. |

**Response** `200` `TaxClassResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the tax class. |
| `name` | string |  | Name of the tax. |
| `tax_type` | string |  | Whether this is a sales tax or a purchases tax. |
| `accounting_reference_id` | string |  | External accounting reference id, if any. |
| `is_active` | boolean |  | Whether the tax is active (false once deleted). |
| `components` | TaxComponentResponse[] |  | The components that make up the tax. |

```bash
curl -sS 'https://api.qoblex.com/v1/tax_classes/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/tax_classes/{id}

**Update Tax Class**

Updates a tax class. The name can always change. The type, rate, and components can only
change while the tax is not referenced anywhere yet - if it is, the response explains what to
fix first (for example, an existing order or a product's default tax).

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The tax class to update. Example: `42`. |

**Request body** `UpdateTaxClassRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string |  | New name for the tax. Can always be changed, even while the tax is in use. |
| `tax_type` | enum(`SALES`, `PURCHASES`) |  | New tax type. Only allowed while the tax is not used anywhere - see the error message for what to fix first. |
| `components` | UpdateTaxComponentRequest[] |  | New set of components (name, rate, whether it compounds on top of the others). Replaces the existing components entirely. Only allowed while the tax is not used anywhere. |
| `accounting_reference_id` | string |  | New external accounting reference id. Can always be changed. |

**Response** `200` `TaxClassResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the tax class. |
| `name` | string |  | Name of the tax. |
| `tax_type` | string |  | Whether this is a sales tax or a purchases tax. |
| `accounting_reference_id` | string |  | External accounting reference id, if any. |
| `is_active` | boolean |  | Whether the tax is active (false once deleted). |
| `components` | TaxComponentResponse[] |  | The components that make up the tax. |

```bash
curl -sS 'https://api.qoblex.com/v1/tax_classes/{id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/tax_classes/{id}

**Delete Tax Class**

Retires a tax class so it no longer appears when creating orders and products. Blocked, with an
explanation, while the tax is still referenced anywhere - for example an account default, a
product's default tax, or an existing order, refund, return, or landed cost.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The tax class to delete. Example: `42`. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/tax_classes/{id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

