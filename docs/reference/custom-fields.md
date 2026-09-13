# Custom Fields

Custom fields extend Qoblex records with your own structured data. A definition describes a field (its name, type, and where it applies) and values are attached to individual records. Use these endpoints to manage definitions and to read and assign values so your integration can carry data Qoblex does not model natively.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

9 endpoints.

### GET /v1/custom_fields

**List Custom Fields**

Returns a paginated list of custom fields, so you can see the extra data your team has
attached to orders, products, contacts, and other records. Each field carries its
definition, stored value, data type, editability, and which record it belongs to.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Page number for pagination. |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |
| `include_count` | query | boolean |  | Indicates whether the total record count should be included in the response. |

**Response** `200` `ListCustomFieldsResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of custom fields. |
| `filtered_count` | integer (int32) |  | Number of custom fields after applying filters. |
| `custom_fields` | CustomField[] |  | List of custom field records. |

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/custom_fields

**Create Custom Field**

Creates a custom field and attaches it to a single record, so you can store extra data
on an order, product, or contact beyond the built-in fields. Use this to capture the
details your business tracks that the standard record does not hold.

**Request body** `CreateCustomField`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `owner_type` | enum(`order`, `product`, `contact`) |  | Type of entity the custom field belongs to. |
| `owner_id` | integer (int32) |  | Identifier of the entity the custom field is attached to. |
| `key` | string |  | Internal key or name of the custom field. |
| `value` | string |  | Value to store in the custom field. |
| `value_type` | string |  | Data type of the field value. |
| `namespace` | string |  | Namespace used to group and organize custom fields. |
| `is_editable` | boolean |  | Indicates whether the custom field can be edited by users. |

**Response** `200` `CustomField`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier for the custom field. |
| `owner_type` | string |  | The type of entity this custom field belongs to (e.g. SaleOrder). |
| `owner_id` | integer (int32) |  | The ID of the entity this custom field is attached to. |
| `key` | string |  | The internal key/name of the custom field. |
| `display_name` | string |  | The human-readable label shown in the UI. |
| `value` | string |  | The value stored in this custom field. |
| `value_type` | string |  | The data type of the field value (e.g. String, Number, Date). |
| `namespace` | string |  | A grouping namespace for organizing custom fields. |
| `options` | string |  | Available options for dropdown-type custom fields. |
| `is_editable` | boolean |  | Indicates whether the field can be edited by the user. |
| `created_time` | string (date-time) |  | Timestamp of when the custom field was created. |
| `last_updated_time` | string (date-time) |  | Timestamp of the last update to the custom field. |

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/custom_fields/{id}

**Delete Custom Field**

Deletes a custom field value from a single record, such as an order or product, when the
extra data no longer applies. This clears the value for that one record only; the custom
field definition and the values held by other records are untouched.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Identifier of the custom field value to delete, for example `4821`. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields/{id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/custom_fields/assign

**Assign Custom Fields**

Assigns existing custom field definitions to a single record such as an order, product,
or contact, so the record is ready to hold that extra data. Use this to attach the fields
your team has already defined to the records where you want to capture their values.

**Request body** `AssignCustonFields`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `owner_type` | enum(`order`, `product`, `contact`) |  | Type of entity the custom fields will be assigned to. |
| `owner_id` | integer (int32) |  | Identifier of the entity receiving the custom fields. |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier for the custom field. |
| `owner_type` | string |  | The type of entity this custom field belongs to (e.g. SaleOrder). |
| `owner_id` | integer (int32) |  | The ID of the entity this custom field is attached to. |
| `key` | string |  | The internal key/name of the custom field. |
| `display_name` | string |  | The human-readable label shown in the UI. |
| `value` | string |  | The value stored in this custom field. |
| `value_type` | string |  | The data type of the field value (e.g. String, Number, Date). |
| `namespace` | string |  | A grouping namespace for organizing custom fields. |
| `options` | string |  | Available options for dropdown-type custom fields. |
| `is_editable` | boolean |  | Indicates whether the field can be edited by the user. |
| `created_time` | string (date-time) |  | Timestamp of when the custom field was created. |
| `last_updated_time` | string (date-time) |  | Timestamp of the last update to the custom field. |

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields/assign' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/custom_fields/definitions

**List Custom Field Definitions**

Returns a paginated list of custom field definitions, so you can see the extra fields
your team has set up before attaching values to records. A definition sets the label,
data type, options, and editability that every value of that field will follow.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  | Page number for pagination. |
| `filters` | query | string |  | A filter expression used to narrow the results, for example `name@=shirt,quantity>10`. See the Filtering and sorting section in the API overview for the full list of operators and syntax. |
| `sort_by` | query | string |  | A sort expression: a comma-separated list of fields, each optionally prefixed with `-` for descending order. See the Filtering and sorting section in the API overview. |
| `include_count` | query | boolean |  | Indicates whether the total record count should be included in the response. |

**Response** `200` `ListCustomFieldsResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  | Total number of custom fields. |
| `filtered_count` | integer (int32) |  | Number of custom fields after applying filters. |
| `custom_fields` | CustomField[] |  | List of custom field records. |

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields/definitions' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/custom_fields/definitions

**Create Custom Field Definition**

Creates a custom field definition for a chosen record type, setting up an extra field
your team can then fill in on orders, products, or contacts. The definition sets the
label, data type, allowed options, grouping, and editability that every value will follow.
The key must be unique for that record type.

**Request body** `CreateCustomFielsDefinition`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `display_name` | string | yes | Human-readable label shown in the UI. |
| `value` | string |  | Default value for the custom field. |
| `value_type` | string |  | Data type of the field. |
| `namespace` | string |  | Namespace used to group custom fields logically. |
| `options` | string |  | Available options for dropdown-type fields. |
| `owner_type` | enum(`order`, `product`, `contact`) |  | Entity type this field belongs to. |
| `is_editable` | boolean |  | Indicates whether the field can be edited by users. |

**Response** `200` `CustomField`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier for the custom field. |
| `owner_type` | string |  | The type of entity this custom field belongs to (e.g. SaleOrder). |
| `owner_id` | integer (int32) |  | The ID of the entity this custom field is attached to. |
| `key` | string |  | The internal key/name of the custom field. |
| `display_name` | string |  | The human-readable label shown in the UI. |
| `value` | string |  | The value stored in this custom field. |
| `value_type` | string |  | The data type of the field value (e.g. String, Number, Date). |
| `namespace` | string |  | A grouping namespace for organizing custom fields. |
| `options` | string |  | Available options for dropdown-type custom fields. |
| `is_editable` | boolean |  | Indicates whether the field can be edited by the user. |
| `created_time` | string (date-time) |  | Timestamp of when the custom field was created. |
| `last_updated_time` | string (date-time) |  | Timestamp of the last update to the custom field. |

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields/definitions' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### PUT /v1/custom_fields/definitions/{id}

**Update Custom Field Definition**

Updates a custom field definition, so a change to its label, data type, allowed options,
grouping, or editability applies everywhere the field is used. The change flows down to
every order or product that already holds a value, keeping the field consistent across
your records.

The field's key cannot be changed. Renaming the display name relabels the field without
detaching it from the records that already store a value.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Identifier of the custom field definition to update, for example `317`. |

**Request body** `UpdateCustomFieldDefinition`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `display_name` | string | yes | Human-readable label shown in the UI. Renaming a definition changes only this label; the field's key stays fixed so records that already hold a value keep it. |
| `value` | string |  | Default value for the custom field. |
| `value_type` | string |  | Data type of the field. |
| `namespace` | string |  | Namespace used to group custom fields logically. |
| `options` | string |  | Available options for dropdown-type fields. |
| `is_editable` | boolean |  | Indicates whether the field can be edited by users. |

**Response** `200` `CustomField`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier for the custom field. |
| `owner_type` | string |  | The type of entity this custom field belongs to (e.g. SaleOrder). |
| `owner_id` | integer (int32) |  | The ID of the entity this custom field is attached to. |
| `key` | string |  | The internal key/name of the custom field. |
| `display_name` | string |  | The human-readable label shown in the UI. |
| `value` | string |  | The value stored in this custom field. |
| `value_type` | string |  | The data type of the field value (e.g. String, Number, Date). |
| `namespace` | string |  | A grouping namespace for organizing custom fields. |
| `options` | string |  | Available options for dropdown-type custom fields. |
| `is_editable` | boolean |  | Indicates whether the field can be edited by the user. |
| `created_time` | string (date-time) |  | Timestamp of when the custom field was created. |
| `last_updated_time` | string (date-time) |  | Timestamp of the last update to the custom field. |

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields/definitions/{id}' \
  -X PUT \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/custom_fields/definitions/{id}

**Delete Custom Field Definition**

Permanently deletes a custom field definition, retiring an extra field your team no longer
needs so it can't be used on future records. Use this to tidy up unused fields; check its
usage first, since records that still store a value must be cleared beforehand.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Identifier of the custom field definition to delete, for example `317`. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields/definitions/{id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/custom_fields/definitions/{id}/usage

**Get Custom Field Definition Usage**

Retrieves which products and orders still store a value for a custom field definition,
so you can see where the field is in use before you delete it. Use this to warn before
removing a definition and to jump straight to the records that must be cleared first.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Identifier of the custom field definition to inspect, for example `317`. |

**Response** `200` `CustomFieldDefinitionUsage`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `definition_id` | integer (int32) |  | Identifier of the custom field definition being inspected. |
| `key` | string |  | The internal key of the definition. |
| `display_name` | string |  | The human-readable label of the definition. |
| `owner_type` | string |  | The owner type of the definition (Order or Product). |
| `in_use` | boolean |  | True when at least one product or order still holds a value for this definition. |
| `products` | CustomFieldProductUsage[] |  | A capped sample of product variants that currently store a value for this definition. The full count is Qoblex.Api.CustomFields.Dtos.CustomFieldDefinitionUsageDto.ProductsTotal. |
| `products_total` | integer (int32) |  | Total number of product variants that store a value, regardless of how many are listed in Qoblex.Api.CustomFields.Dtos.CustomFieldDefinitionUsageDto.Products. |
| `orders` | CustomFieldOrderUsage[] |  | A capped sample of orders that currently store a value for this definition. The full count is Qoblex.Api.CustomFields.Dtos.CustomFieldDefinitionUsageDto.OrdersTotal. |
| `orders_total` | integer (int32) |  | Total number of orders that store a value, regardless of how many are listed in Qoblex.Api.CustomFields.Dtos.CustomFieldDefinitionUsageDto.Orders. |

```bash
curl -sS 'https://api.qoblex.com/v1/custom_fields/definitions/{id}/usage' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

