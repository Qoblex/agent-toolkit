# Customers

A customer is a business or person you sell to. The customer object carries identity and contact details, contacts and addresses, tax identifiers, default payment terms, and the price list that governs their pricing. Use these endpoints to list, retrieve, create, and update customers; they are then referenced by quotes and sale orders.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

3 endpoints.

### GET /v1/customers

**List Customers**

Returns a paginated list of your customers so you can browse your customer base,
keep a CRM or other system in sync, and pull records into order and reporting workflows.
Each customer carries its identity and contact details, addresses, tax identifiers,
payment terms, and the employees linked to the account.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Page number for pagination. |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |

**Response** `200` `SalesListCustomersRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of customer records available. |
| `filtered_count` | integer (int32) |  | Number of customer records returned for the current page. |
| `customers` | SalesCustomer[] |  | Paginated list of customer records. |

```bash
curl -sS 'https://api.qoblex.com/v1/customers' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/customers

**Create Customer**

Creates a new customer so you can start quoting, selling, and invoicing against
the account right away. Include the customer's contact details, addresses, employees,
and account information such as payment terms and tax identification numbers.

**Request body** `SalesCreateOrUpdateCustomerRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `primary_contact` | string |  |  |
| `name` | string |  | Full name of the customer. |
| `default_email` | string |  | The customer's primary email address. |
| `land_line_phone` | string |  | The customer's landline phone number. |
| `mobile_phone` | string |  | The customer's mobile phone number. |
| `fax` | string |  | The customer's fax number. |
| `website` | string |  | The customer's website URL. |
| `created_time` | string (date-time) |  | Creation date of the customer record |
| `addresses` | Address[] |  | A list of addresses associated with the customer. |
| `notes` | string |  | General notes about the customer. |
| `tax_number` | string |  | The customer's tax identification number. |
| `eori` | string |  | The customer's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment |
| `type` | string |  | The type or category of the customer |
| `employees` | SalesEmployee[] |  | List of employees associated with the customer. |
| `is_wholesale` | boolean |  | Whether this customer is priced at wholesale rather than retail. New order lines take the variant's wholesale price when true. |
| `discount` | number (double) |  | Discount percentage applied to new order lines for this customer by default. |
| `price_list_id` | integer (int32) |  | The price list this customer is normally ordered against, if any. |
| `sales_tax_class` | TaxClass |  | The tax class to apply. |
| `id` | integer (int64) |  | Unique identifier associated to a customer with this order. |

**Response** `200` `SalesCustomer`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `primary_contact` | string |  |  |
| `name` | string |  | Full name of the customer. |
| `default_email` | string |  | The customer's primary email address. |
| `land_line_phone` | string |  | The customer's landline phone number. |
| `mobile_phone` | string |  | The customer's mobile phone number. |
| `fax` | string |  | The customer's fax number. |
| `website` | string |  | The customer's website URL. |
| `created_time` | string (date-time) |  | Creation date of the customer record |
| `addresses` | Address[] |  | A list of addresses associated with the customer. |
| `notes` | string |  | General notes about the customer. |
| `tax_number` | string |  | The customer's tax identification number. |
| `eori` | string |  | The customer's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment |
| `type` | string |  | The type or category of the customer |
| `employees` | SalesEmployee[] |  | List of employees associated with the customer. |
| `is_wholesale` | boolean |  | Whether this customer is priced at wholesale rather than retail. New order lines take the variant's wholesale price when true. |
| `discount` | number (double) |  | Discount percentage applied to new order lines for this customer by default. |
| `price_list_id` | integer (int32) |  | The price list this customer is normally ordered against, if any. |
| `sales_tax_class` | TaxClass |  | The tax class to apply. |
| `id` | integer (int64) |  | Unique identifier associated to a customer with this order. |

```bash
curl -sS 'https://api.qoblex.com/v1/customers' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/customers/{id}

**Get Customer**

Retrieves a single customer's complete profile so you can view or reconcile
everything on file for one account. The record includes contact details, addresses,
linked employees, and account settings such as payment terms and tax identification numbers.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The unique identifier of the customer. For example, `4521`. |

**Response** `200` `SalesCustomer`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `primary_contact` | string |  |  |
| `name` | string |  | Full name of the customer. |
| `default_email` | string |  | The customer's primary email address. |
| `land_line_phone` | string |  | The customer's landline phone number. |
| `mobile_phone` | string |  | The customer's mobile phone number. |
| `fax` | string |  | The customer's fax number. |
| `website` | string |  | The customer's website URL. |
| `created_time` | string (date-time) |  | Creation date of the customer record |
| `addresses` | Address[] |  | A list of addresses associated with the customer. |
| `notes` | string |  | General notes about the customer. |
| `tax_number` | string |  | The customer's tax identification number. |
| `eori` | string |  | The customer's Economic Operators Registration and Identification number, used for international customs. |
| `payment_term` | integer (int32) |  | The number of days allowed for payment |
| `type` | string |  | The type or category of the customer |
| `employees` | SalesEmployee[] |  | List of employees associated with the customer. |
| `is_wholesale` | boolean |  | Whether this customer is priced at wholesale rather than retail. New order lines take the variant's wholesale price when true. |
| `discount` | number (double) |  | Discount percentage applied to new order lines for this customer by default. |
| `price_list_id` | integer (int32) |  | The price list this customer is normally ordered against, if any. |
| `sales_tax_class` | TaxClass |  | The tax class to apply. |
| `id` | integer (int64) |  | Unique identifier associated to a customer with this order. |

```bash
curl -sS 'https://api.qoblex.com/v1/customers/{id}' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

