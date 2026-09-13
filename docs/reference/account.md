# Account

Your Qoblex account is the top-level container for your business. These endpoints read and update company details, tax defaults, the currencies and manual exchange-rate overrides you trade in, your warehouse and store locations, and your subscription, billing history, and usage. Responses generally return the current account and the settings that shape how orders, stock, and pricing behave across the platform.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

5 endpoints.

### GET /v1/account

**Get Account**

Returns your account: the company profile that everything else in Qoblex hangs off. Read it to
see your account name, billing and warehouse locations, and base currency in one call, for
example when populating a settings screen or confirming which currency your reports are in.

**Response** `200` `Qoblex.Api.Account.Dtos.AccountDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string |  | The company's display name |
| `currency` | string |  | ISO 4217 currency code used by the account |
| `rounding_decimals` | integer (int32) |  | Number of decimal places used for rounding monetary values |
| `registration_number` | string |  | Legal or tax registration number for the company |
| `timezone` | string |  | Name of the account's timezone |
| `timezone_offset` | integer (int32) |  | Offset from UTC in minutes for the account's timezone |
| `realm_id` | string |  | Unique hashed identifier for the account realm |
| `default_sales_tax` | TaxClass |  | The tax class to apply. |
| `default_purchases_tax` | TaxClass |  | The tax class to apply. |
| `default_product_tax` | TaxClass |  | The tax class to apply. |
| `default_tax_exempt` | TaxClass |  | The tax class to apply. |
| `is_sales_tax_included_in_price` | boolean |  | Whether sale orders are created with tax included in the price. |
| `is_purchase_tax_included_in_price` | boolean |  | Whether purchase orders are created with tax included in the price. |
| `is_product_tax_included_in_price` | boolean |  | Whether product prices are tax included. |
| `feature_flags` | Qoblex.Api.Account.Dtos.FeatureFlagDto[] |  | List of feature flags enabled for the account. Each flag indicates whether a specific feature is enabled or disabled. |

```bash
curl -sS 'https://api.qoblex.com/v1/account' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/account/adjustment_reasons

**List Adjustment Reasons**

Returns the adjustment reasons your team can pick from when recording an inventory adjustment.
Use it to populate the reason dropdown so every adjustment is logged against a consistent,
account-defined reason.

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/account/adjustment_reasons' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/account/locations

**List Locations**

Returns your account's locations: warehouses, stores, offices, and anywhere else you track
stock or ship from. Use it to populate location pickers on orders and transfers. Narrow the
list to only locations available on purchase orders, or only those allowed to hold inventory.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `filters` | query | string |  | Filters to apply on the location list: property operator value. Supported properties: - `id` - `name` - `type` (one of `Warehouse`, `Billing`, `Dropship`) - `available_in_purchase_orders` Supported operators: `==` (equals), `!=` (not equals), `@=*` (contains, case-insensitive) String values must be double-quoted. Combine multiple filters with `,` (AND) or `\|` (OR), with a space on each side of the operator. |
| `sort_by` | query | string |  | Sorting to apply on the location list: prefix with - for descending, no prefix for ascending. Multiple sorts can be combined using commas. Supported properties: `id`, `name`, `available_in_purchase_orders`. |
| `expand` | query | string |  | Comma separated values of properties to expand on and include in the response. The following values are supported for expansion: - `address` |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the location. |
| `name` | string |  | Name of the location. |
| `type` | enum(`warehouse`, `billing`, `dropship`) |  | The kind of location this is. Accepted values: `Billing`, `Warehouse`, `Dropship`. |
| `available_in_purchase_orders` | boolean |  | Whether this location can be used in purchase orders. |
| `address` | LocationAddress |  | The location's address. |

```bash
curl -sS 'https://api.qoblex.com/v1/account/locations' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/account/locations/{id}

**Get Location**

Retrieves the details of a single location by its identifier, such as its name, type, and address.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The location to retrieve. Example: `7`. |
| `expand` | query | string |  | Comma separated list of properties to expand. Example: `address`. |

**Response** `200` `AccountLocation`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the location. |
| `name` | string |  | Name of the location. |
| `type` | enum(`warehouse`, `billing`, `dropship`) |  | The kind of location this is. Accepted values: `Billing`, `Warehouse`, `Dropship`. |
| `available_in_purchase_orders` | boolean |  | Whether this location can be used in purchase orders. |
| `address` | LocationAddress |  | The location's address. |

```bash
curl -sS 'https://api.qoblex.com/v1/account/locations/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/account/stores

**List Stores**

Returns the stores connected to your account: the sales channels and storefronts you sell
through, such as e-commerce platforms or B2B portals. Each store carries its name and host
URL, so you can tell your channels apart and match orders back to where they came from.

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the store. |
| `name` | string |  | Name of the store. |
| `host_url` | string |  | The URL of the storefront. |

```bash
curl -sS 'https://api.qoblex.com/v1/account/stores' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

