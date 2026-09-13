# Suppliers

A supplier is a vendor you buy stock from. The supplier object holds identity and contact details,
            addresses, and the employees linked to the account, and is referenced throughout purchasing, from
            purchase orders to bills and returns. Use these endpoints to list, retrieve, create, update, and
            remove the suppliers available to your purchasing workflow.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

5 endpoints.

### GET /v1/suppliers

**List Suppliers**

Returns the suppliers set up in your account so you can manage the vendors you buy from and raise purchase orders against them. Filter, sort, and page through the list to find the supplier you need.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Page number for pagination. |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |

**Response** `200` `SupplierListResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | Supplier[] |  | The list of items. |
| `count` | integer (int32) |  | The total number of items in the list. |
| `filtered_count` | integer (int32) |  | The total number of items in the list after applying filters, if any. |

```bash
curl -sS 'https://api.qoblex.com/v1/suppliers' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/suppliers

**Create Supplier**

Creates a new supplier so you can start raising purchase orders and bills against it right away.
Include the supplier's contact details and at least one address.

**Request body** `SupplierRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string |  | Name of the supplier. |
| `primary_contact` | string |  | Name of the primary contact person at the supplier. |
| `default_email` | string |  | The supplier's primary email address. |
| `land_line_phone` | string |  | The supplier's landline phone number. |
| `mobile_phone` | string |  | The supplier's mobile phone number. |
| `fax_number` | string |  | The supplier's fax number. |
| `website` | string |  | The supplier's website URL. |
| `tax_number` | string |  | The supplier's tax identification number. |
| `eori` | string |  | The supplier's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment. |
| `business_type` | enum(`Wholesale`, `Retailer`) |  | The business type of the supplier. One of `Wholesale` or `Retailer`. |
| `currency` | string |  | The default currency used for orders with this supplier. |
| `minimum_order_value` | number (double) |  | The minimum order value accepted for this supplier. |
| `discount` | number (double) |  | The default discount percentage applied to this supplier. |
| `price_list_id` | integer (int32) |  | The price list this supplier is priced against, if any. |
| `comments` | string |  | General notes about the supplier. |
| `purchase_tax_class_id` | integer (int32) |  | The default tax class applied to purchases from this supplier. |
| `account_manager_id` | integer (int32) |  | The team member who manages this supplier relationship. |
| `logo` | string |  | The supplier's logo, as a URL or data URI. |
| `addresses` | Address[] |  | Addresses for the supplier. On create, at least one address is required. On update, existing addresses already on file are left as-is; addresses here that don't match one already on file (by content) are appended. |
| `employees` | SupplierEmployee[] |  | Contact persons at the supplier. On update, these are matched to existing employees by (normalized) name, and added or updated accordingly. |

**Response** `200` `SupplierDetails`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `mobile_phone` | string |  | The supplier's mobile phone number. |
| `fax` | string |  | The supplier's fax number. |
| `website` | string |  | The supplier's website URL. |
| `created_time` | string (date-time) |  | Creation date of the supplier record |
| `addresses` | Address[] |  | A list of addresses associated with the supplier. |
| `notes` | string |  | General notes about the supplier. |
| `tax_number` | string |  | The supplier's tax identification number. |
| `eori` | string |  | The supplier's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment |
| `type` | string |  | The type or category of the supplier |
| `employees` | Qoblex.Api.Suppliers.Dto.EmployeeDto[] |  | List of employees associated with the supplier. |
| `business_type` | string |  | The business type of the supplier. One of `Wholesale` or `Retailer`. |
| `currency` | string |  | The default currency used for orders with this supplier. |
| `minimum_order_value` | number (double) |  | The minimum order value accepted for this supplier. |
| `discount` | number (double) |  | The default discount percentage applied to this supplier. |
| `price_list_id` | integer (int32) |  | The price list this supplier is priced against, if any. |
| `purchase_tax_class_id` | integer (int32) |  | The default tax class applied to purchases from this supplier. |
| `account_manager_id` | integer (int32) |  | The team member who manages this supplier relationship. |
| `integration_name` | string |  | The name of the tenant's connected accounting integration (for example `Xero` or `QuickBooks`), if one is connected and this supplier has synced to it. |
| `external_link` | string |  | A direct link to view this supplier in the tenant's connected accounting integration, if one is connected and this supplier has synced to it. |
| `logo` | string |  | The supplier's logo, as a URL or data URI. |
| `primary_contact` | string |  | The main contact person at the supplier. |
| `default_email` | string |  | The supplier's primary email address. |
| `land_line_phone` | string |  | The supplier's landline phone number. |
| `id` | integer (int32) |  | Unique identifier of the supplier. |
| `name` | string |  | Full name of the supplier. |

```bash
curl -sS 'https://api.qoblex.com/v1/suppliers' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/suppliers/{id}

**Get Supplier**

Retrieves a single supplier's complete profile, including contact details and addresses, so you
can view or reconcile everything on file for one vendor before raising a purchase order against it.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the supplier. For example, `4521`. |

**Response** `200` `SupplierDetails`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `mobile_phone` | string |  | The supplier's mobile phone number. |
| `fax` | string |  | The supplier's fax number. |
| `website` | string |  | The supplier's website URL. |
| `created_time` | string (date-time) |  | Creation date of the supplier record |
| `addresses` | Address[] |  | A list of addresses associated with the supplier. |
| `notes` | string |  | General notes about the supplier. |
| `tax_number` | string |  | The supplier's tax identification number. |
| `eori` | string |  | The supplier's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment |
| `type` | string |  | The type or category of the supplier |
| `employees` | Qoblex.Api.Suppliers.Dto.EmployeeDto[] |  | List of employees associated with the supplier. |
| `business_type` | string |  | The business type of the supplier. One of `Wholesale` or `Retailer`. |
| `currency` | string |  | The default currency used for orders with this supplier. |
| `minimum_order_value` | number (double) |  | The minimum order value accepted for this supplier. |
| `discount` | number (double) |  | The default discount percentage applied to this supplier. |
| `price_list_id` | integer (int32) |  | The price list this supplier is priced against, if any. |
| `purchase_tax_class_id` | integer (int32) |  | The default tax class applied to purchases from this supplier. |
| `account_manager_id` | integer (int32) |  | The team member who manages this supplier relationship. |
| `integration_name` | string |  | The name of the tenant's connected accounting integration (for example `Xero` or `QuickBooks`), if one is connected and this supplier has synced to it. |
| `external_link` | string |  | A direct link to view this supplier in the tenant's connected accounting integration, if one is connected and this supplier has synced to it. |
| `logo` | string |  | The supplier's logo, as a URL or data URI. |
| `primary_contact` | string |  | The main contact person at the supplier. |
| `default_email` | string |  | The supplier's primary email address. |
| `land_line_phone` | string |  | The supplier's landline phone number. |
| `id` | integer (int32) |  | Unique identifier of the supplier. |
| `name` | string |  | Full name of the supplier. |

```bash
curl -sS 'https://api.qoblex.com/v1/suppliers/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/suppliers/{id}

**Update Supplier**

Updates an existing supplier's contact details. Any addresses included that don't match one
already on file are added; existing addresses are otherwise left as-is.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The supplier to update. For example, `4521`. |

**Request body** `SupplierRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string |  | Name of the supplier. |
| `primary_contact` | string |  | Name of the primary contact person at the supplier. |
| `default_email` | string |  | The supplier's primary email address. |
| `land_line_phone` | string |  | The supplier's landline phone number. |
| `mobile_phone` | string |  | The supplier's mobile phone number. |
| `fax_number` | string |  | The supplier's fax number. |
| `website` | string |  | The supplier's website URL. |
| `tax_number` | string |  | The supplier's tax identification number. |
| `eori` | string |  | The supplier's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment. |
| `business_type` | enum(`Wholesale`, `Retailer`) |  | The business type of the supplier. One of `Wholesale` or `Retailer`. |
| `currency` | string |  | The default currency used for orders with this supplier. |
| `minimum_order_value` | number (double) |  | The minimum order value accepted for this supplier. |
| `discount` | number (double) |  | The default discount percentage applied to this supplier. |
| `price_list_id` | integer (int32) |  | The price list this supplier is priced against, if any. |
| `comments` | string |  | General notes about the supplier. |
| `purchase_tax_class_id` | integer (int32) |  | The default tax class applied to purchases from this supplier. |
| `account_manager_id` | integer (int32) |  | The team member who manages this supplier relationship. |
| `logo` | string |  | The supplier's logo, as a URL or data URI. |
| `addresses` | Address[] |  | Addresses for the supplier. On create, at least one address is required. On update, existing addresses already on file are left as-is; addresses here that don't match one already on file (by content) are appended. |
| `employees` | SupplierEmployee[] |  | Contact persons at the supplier. On update, these are matched to existing employees by (normalized) name, and added or updated accordingly. |

**Response** `200` `SupplierDetails`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `mobile_phone` | string |  | The supplier's mobile phone number. |
| `fax` | string |  | The supplier's fax number. |
| `website` | string |  | The supplier's website URL. |
| `created_time` | string (date-time) |  | Creation date of the supplier record |
| `addresses` | Address[] |  | A list of addresses associated with the supplier. |
| `notes` | string |  | General notes about the supplier. |
| `tax_number` | string |  | The supplier's tax identification number. |
| `eori` | string |  | The supplier's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment |
| `type` | string |  | The type or category of the supplier |
| `employees` | Qoblex.Api.Suppliers.Dto.EmployeeDto[] |  | List of employees associated with the supplier. |
| `business_type` | string |  | The business type of the supplier. One of `Wholesale` or `Retailer`. |
| `currency` | string |  | The default currency used for orders with this supplier. |
| `minimum_order_value` | number (double) |  | The minimum order value accepted for this supplier. |
| `discount` | number (double) |  | The default discount percentage applied to this supplier. |
| `price_list_id` | integer (int32) |  | The price list this supplier is priced against, if any. |
| `purchase_tax_class_id` | integer (int32) |  | The default tax class applied to purchases from this supplier. |
| `account_manager_id` | integer (int32) |  | The team member who manages this supplier relationship. |
| `integration_name` | string |  | The name of the tenant's connected accounting integration (for example `Xero` or `QuickBooks`), if one is connected and this supplier has synced to it. |
| `external_link` | string |  | A direct link to view this supplier in the tenant's connected accounting integration, if one is connected and this supplier has synced to it. |
| `logo` | string |  | The supplier's logo, as a URL or data URI. |
| `primary_contact` | string |  | The main contact person at the supplier. |
| `default_email` | string |  | The supplier's primary email address. |
| `land_line_phone` | string |  | The supplier's landline phone number. |
| `id` | integer (int32) |  | Unique identifier of the supplier. |
| `name` | string |  | Full name of the supplier. |

```bash
curl -sS 'https://api.qoblex.com/v1/suppliers/{id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/suppliers/{id}

**Delete Supplier**

Removes a supplier from your account so it no longer appears when raising new purchase orders.
The supplier's history on existing purchase orders, bills, and returns is preserved.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The supplier to delete. For example, `4521`. |

**Response** `200` `SupplierDetails`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `mobile_phone` | string |  | The supplier's mobile phone number. |
| `fax` | string |  | The supplier's fax number. |
| `website` | string |  | The supplier's website URL. |
| `created_time` | string (date-time) |  | Creation date of the supplier record |
| `addresses` | Address[] |  | A list of addresses associated with the supplier. |
| `notes` | string |  | General notes about the supplier. |
| `tax_number` | string |  | The supplier's tax identification number. |
| `eori` | string |  | The supplier's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment |
| `type` | string |  | The type or category of the supplier |
| `employees` | Qoblex.Api.Suppliers.Dto.EmployeeDto[] |  | List of employees associated with the supplier. |
| `business_type` | string |  | The business type of the supplier. One of `Wholesale` or `Retailer`. |
| `currency` | string |  | The default currency used for orders with this supplier. |
| `minimum_order_value` | number (double) |  | The minimum order value accepted for this supplier. |
| `discount` | number (double) |  | The default discount percentage applied to this supplier. |
| `price_list_id` | integer (int32) |  | The price list this supplier is priced against, if any. |
| `purchase_tax_class_id` | integer (int32) |  | The default tax class applied to purchases from this supplier. |
| `account_manager_id` | integer (int32) |  | The team member who manages this supplier relationship. |
| `integration_name` | string |  | The name of the tenant's connected accounting integration (for example `Xero` or `QuickBooks`), if one is connected and this supplier has synced to it. |
| `external_link` | string |  | A direct link to view this supplier in the tenant's connected accounting integration, if one is connected and this supplier has synced to it. |
| `logo` | string |  | The supplier's logo, as a URL or data URI. |
| `primary_contact` | string |  | The main contact person at the supplier. |
| `default_email` | string |  | The supplier's primary email address. |
| `land_line_phone` | string |  | The supplier's landline phone number. |
| `id` | integer (int32) |  | Unique identifier of the supplier. |
| `name` | string |  | Full name of the supplier. |

```bash
curl -sS 'https://api.qoblex.com/v1/suppliers/{id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

