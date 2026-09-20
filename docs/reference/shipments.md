# Shipments

Shipments fulfil a sale order. Create a shipment for the goods going out, pick and pack it, assign batches where items are batch-tracked, then dispatch it and produce a delivery note. Shipments are how committed stock is reduced as goods leave.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

10 endpoints.

### POST /v1/sale_orders/{id}/shipments

**Create Shipment**

Creates a shipment for a sale order, covering either the whole order or just part of it so
you can fulfill in stages. The shipment status sets the state the shipment starts in, and
defaults to Draft when not specified.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order to create a shipment for. |

**Request body** `SalesCreateShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `carrier` | string |  | The name of the shipping carrier handling the delivery. |
| `shipping_method` | string |  | The shipping method or service level used. |
| `tracking_code` | string |  | The tracking number or code provided by the carrier to monitor the shipment's progress. |
| `delivery_date` | string (date-time) |  | The date and time when the shipment was dispatched. (ISO 8601 format) |
| `shipment_date` | string (date-time) |  | The expected or actual delivery date and time. (ISO 8601 format) |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered to the recipient. |
| `comments` | string |  | Optional notes or instructions related to the shipment. |
| `location_id` | integer (int32) |  | The identifier of the warehouse or fulfillment location from which the shipment is dispatched. |
| `line_items` | SalesShipmentLineItem[] |  | The list of items included in this shipment. |

**Response** `200` `SalesShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_id` | integer (int64) |  | Sale order identifier. |
| `number` | string |  | Shipment number. |
| `location` | SalesLocation |  | The warehouse or location from which this order will be fulfilled. |
| `shipment_items` | SalesShipmentItem[] |  | The individual order items included in this shipment with their quantities. |
| `labels` | Qoblex.Api.Sales.Dto.ShipmentLabelDto[] |  | Labels generated for the shipment. |
| `can_hold_inventory` | boolean |  | Indicates whether this shipment location can hold inventory. |
| `carrier` | string |  | Shipping carrier. |
| `shipping_method` | string |  | Shipping method used |
| `tracking_code` | string |  | The carrier tracking number for the shipment. |
| `shipment_date` | string (date-time) |  | Date the shipment was sent (ISO 8601 format). |
| `delivery_date` | string (date-time) |  | Delivery date (ISO 8601 format). |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered. |
| `comments` | string |  | Notes or comments about the shipment. |
| `status` | string |  | Current status of the shipment. |
| `delivery_note` | SalesDeliveryNote |  | Proof of delivery details including who delivered and received the package. |
| `id` | integer (int64) |  | Unique identifier for the shipment. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/shipments/{shipment_id}

**Update Shipment**

Updates the details of a shipment while it is still being prepared. Changes are only allowed
before the shipment has been picked, since picking begins committing physical stock to it.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int32) | yes | The ID of the shipment to update. |

**Request body** `SalesUpdateShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `carrier` | string |  | The name of the shipping carrier handling the delivery. |
| `shipping_method` | string |  | The shipping method or service level used. |
| `tracking_code` | string |  | The tracking number or code provided by the carrier to monitor the shipment's progress. |
| `delivery_date` | string (date-time) |  | The date and time when the shipment was dispatched. (ISO 8601 format) |
| `shipment_date` | string (date-time) |  | The expected or actual delivery date and time. (ISO 8601 format) |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered to the recipient. |
| `comments` | string |  | Optional notes or instructions related to the shipment. |
| `location_id` | integer (int32) |  | The identifier of the warehouse or fulfillment location from which the shipment is dispatched. |
| `line_items` | SalesShipmentLineItem[] |  | The list of items included in this shipment. |

**Response** `200` `SalesShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_id` | integer (int64) |  | Sale order identifier. |
| `number` | string |  | Shipment number. |
| `location` | SalesLocation |  | The warehouse or location from which this order will be fulfilled. |
| `shipment_items` | SalesShipmentItem[] |  | The individual order items included in this shipment with their quantities. |
| `labels` | Qoblex.Api.Sales.Dto.ShipmentLabelDto[] |  | Labels generated for the shipment. |
| `can_hold_inventory` | boolean |  | Indicates whether this shipment location can hold inventory. |
| `carrier` | string |  | Shipping carrier. |
| `shipping_method` | string |  | Shipping method used |
| `tracking_code` | string |  | The carrier tracking number for the shipment. |
| `shipment_date` | string (date-time) |  | Date the shipment was sent (ISO 8601 format). |
| `delivery_date` | string (date-time) |  | Delivery date (ISO 8601 format). |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered. |
| `comments` | string |  | Notes or comments about the shipment. |
| `status` | string |  | Current status of the shipment. |
| `delivery_note` | SalesDeliveryNote |  | Proof of delivery details including who delivered and received the package. |
| `id` | integer (int64) |  | Unique identifier for the shipment. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/shipments/{shipment_id}/batches

**Assign Batches**

Assigns warehouse batches (stock lots) to the lines of a shipment, pinning down exactly which
inventory batches will fulfill each line item. Operators use this when they need to control
which lots go out, for example to ship oldest stock first or honor a customer's batch request.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int64) | yes | The ID of the shipment to assign batches to. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `shipment_line_item_id` | integer (int32) |  | The unique identifier of the shipment line item for which batches are being reserved to ship. |
| `batches` | SalesBatchReservationOperation[] |  | List of inventory batch allocations used to fulfill this shipment line item. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/batches' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/sale_orders/{id}/shipments/{shipment_id}/batches/{reservation_id}

**Delete Batch Reservation**

Deletes a batch reservation on a shipment, releasing the reserved stock back to available
inventory. Use this to undo a batch assignment when the wrong lot was reserved or the
shipment no longer needs it.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int64) | yes | The ID of the shipment the reservation belongs to. |
| `reservation_id` | path | integer (int64) | yes | The ID of the batch reservation to delete. |

**Response** `200` `ProductBatchOperation`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int64) |  | Unique identifier of the batch operation record. |
| `batch_id` | integer (int32) |  | Unique identifier of the batch this operation belongs to. |
| `location_id` | integer (int32) |  | The identifier of location where this operation took place. |
| `title` | string |  | Human-readable label describing the operation. |
| `product_id` | integer (int32) |  | Unique identifier of the product associated with this batch. |
| `batch_number` | string |  | The batch or lot number. |
| `quantity` | number (double) |  | Quantity affected by this operation. Positive for stock in, negative for stock out. |
| `value` | number (double) |  | Monetary value of the quantity affected. |
| `closing_quantity` | number (double) |  | Total batch stock quantity after this operation. |
| `closing_value` | number (double) |  | Total batch stock value after this operation. |
| `mac` | number (double) |  | Moving Average Cost at the time of the operation. |
| `created_at` | string (date-time) |  | Timestamp when the operation was created. |
| `updated_at` | string (date-time) |  | Timestamp when the operation was last updated. |
| `type` | string |  | Type of inventory transaction. |
| `authorized_at` | string (date-time) |  | Timestamp when the operation was authorized. |
| `transaction_id` | integer (int64) |  | Unique identifier of the parent transaction this operation belongs to. |
| `transaction_number` | string |  | Human-readable reference number of the parent transaction. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/batches/{reservation_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/sale_orders/{id}/shipments/{shipment_id}/delivery_note

**Create Delivery Note**

Creates a delivery note for a specific shipment, capturing proof-of-delivery details such
as when it was delivered, who delivered it, who received it, and an optional signed document.
Operators use this to attach delivery confirmation to a shipment for their records.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int32) | yes | The ID of the shipment to attach the delivery note to. |

**Request body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `delivered_at` | string (date-time) |  | The date and time when the shipment was delivered. |
| `delivered_by` | string |  | The name of the person or carrier who delivered the shipment. |
| `received_by` | string |  | The name of the person who received the shipment. |
| `document` | string (binary) |  | The delivery note document file. |
| `notes` | string |  | Additional notes or remarks about the delivery. |

**Response** `200` `SalesShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_id` | integer (int64) |  | Sale order identifier. |
| `number` | string |  | Shipment number. |
| `location` | SalesLocation |  | The warehouse or location from which this order will be fulfilled. |
| `shipment_items` | SalesShipmentItem[] |  | The individual order items included in this shipment with their quantities. |
| `labels` | Qoblex.Api.Sales.Dto.ShipmentLabelDto[] |  | Labels generated for the shipment. |
| `can_hold_inventory` | boolean |  | Indicates whether this shipment location can hold inventory. |
| `carrier` | string |  | Shipping carrier. |
| `shipping_method` | string |  | Shipping method used |
| `tracking_code` | string |  | The carrier tracking number for the shipment. |
| `shipment_date` | string (date-time) |  | Date the shipment was sent (ISO 8601 format). |
| `delivery_date` | string (date-time) |  | Delivery date (ISO 8601 format). |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered. |
| `comments` | string |  | Notes or comments about the shipment. |
| `status` | string |  | Current status of the shipment. |
| `delivery_note` | SalesDeliveryNote |  | Proof of delivery details including who delivered and received the package. |
| `id` | integer (int64) |  | Unique identifier for the shipment. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/delivery_note' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/shipments/{shipment_id}/dispatch

**Dispatch Shipment**

Marks a shipment as dispatched, the final step that records the goods as having left your
premises and on their way to the customer. Send a request body to update the shipment's
header details as part of dispatching; omit it to simply advance the status.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int32) | yes | The ID of the shipment to mark as dispatched. |

**Request body** `SalesUpdateShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `carrier` | string |  | The name of the shipping carrier handling the delivery. |
| `shipping_method` | string |  | The shipping method or service level used. |
| `tracking_code` | string |  | The tracking number or code provided by the carrier to monitor the shipment's progress. |
| `delivery_date` | string (date-time) |  | The date and time when the shipment was dispatched. (ISO 8601 format) |
| `shipment_date` | string (date-time) |  | The expected or actual delivery date and time. (ISO 8601 format) |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered to the recipient. |
| `comments` | string |  | Optional notes or instructions related to the shipment. |
| `location_id` | integer (int32) |  | The identifier of the warehouse or fulfillment location from which the shipment is dispatched. |
| `line_items` | SalesShipmentLineItem[] |  | The list of items included in this shipment. |

**Response** `200` `SalesShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_id` | integer (int64) |  | Sale order identifier. |
| `number` | string |  | Shipment number. |
| `location` | SalesLocation |  | The warehouse or location from which this order will be fulfilled. |
| `shipment_items` | SalesShipmentItem[] |  | The individual order items included in this shipment with their quantities. |
| `labels` | Qoblex.Api.Sales.Dto.ShipmentLabelDto[] |  | Labels generated for the shipment. |
| `can_hold_inventory` | boolean |  | Indicates whether this shipment location can hold inventory. |
| `carrier` | string |  | Shipping carrier. |
| `shipping_method` | string |  | Shipping method used |
| `tracking_code` | string |  | The carrier tracking number for the shipment. |
| `shipment_date` | string (date-time) |  | Date the shipment was sent (ISO 8601 format). |
| `delivery_date` | string (date-time) |  | Delivery date (ISO 8601 format). |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered. |
| `comments` | string |  | Notes or comments about the shipment. |
| `status` | string |  | Current status of the shipment. |
| `delivery_note` | SalesDeliveryNote |  | Proof of delivery details including who delivered and received the package. |
| `id` | integer (int64) |  | Unique identifier for the shipment. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/dispatch' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/sale_orders/{id}/shipments/{shipment_id}/line_items

**Delete Shipment Line Items**

Removes line items from a draft shipment, letting you trim what goes out before the goods are
pulled. Lines on a shipment that has already been picked, packed, or dispatched cannot be
removed here.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int32) | yes | The ID of the shipment to remove lines from. |

**Request body** `SalesDeleteShipmentLineItem`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `shipment_line_item_ids` | integer (int32)[] |  | The shipment line items to remove from the draft shipment. |

**Response** `200` `SalesShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_id` | integer (int64) |  | Sale order identifier. |
| `number` | string |  | Shipment number. |
| `location` | SalesLocation |  | The warehouse or location from which this order will be fulfilled. |
| `shipment_items` | SalesShipmentItem[] |  | The individual order items included in this shipment with their quantities. |
| `labels` | Qoblex.Api.Sales.Dto.ShipmentLabelDto[] |  | Labels generated for the shipment. |
| `can_hold_inventory` | boolean |  | Indicates whether this shipment location can hold inventory. |
| `carrier` | string |  | Shipping carrier. |
| `shipping_method` | string |  | Shipping method used |
| `tracking_code` | string |  | The carrier tracking number for the shipment. |
| `shipment_date` | string (date-time) |  | Date the shipment was sent (ISO 8601 format). |
| `delivery_date` | string (date-time) |  | Delivery date (ISO 8601 format). |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered. |
| `comments` | string |  | Notes or comments about the shipment. |
| `status` | string |  | Current status of the shipment. |
| `delivery_note` | SalesDeliveryNote |  | Proof of delivery details including who delivered and received the package. |
| `id` | integer (int64) |  | Unique identifier for the shipment. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/line_items' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/shipments/{shipment_id}/pack

**Pack Shipment**

Marks a shipment as packed, the step after picking that confirms the goods are boxed and
ready to go out. Send a request body to update the shipment's header details as part of
packing; omit it to simply advance the status.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int32) | yes | The ID of the shipment to mark as packed. |

**Request body** `SalesUpdateShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `carrier` | string |  | The name of the shipping carrier handling the delivery. |
| `shipping_method` | string |  | The shipping method or service level used. |
| `tracking_code` | string |  | The tracking number or code provided by the carrier to monitor the shipment's progress. |
| `delivery_date` | string (date-time) |  | The date and time when the shipment was dispatched. (ISO 8601 format) |
| `shipment_date` | string (date-time) |  | The expected or actual delivery date and time. (ISO 8601 format) |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered to the recipient. |
| `comments` | string |  | Optional notes or instructions related to the shipment. |
| `location_id` | integer (int32) |  | The identifier of the warehouse or fulfillment location from which the shipment is dispatched. |
| `line_items` | SalesShipmentLineItem[] |  | The list of items included in this shipment. |

**Response** `200` `SalesShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_id` | integer (int64) |  | Sale order identifier. |
| `number` | string |  | Shipment number. |
| `location` | SalesLocation |  | The warehouse or location from which this order will be fulfilled. |
| `shipment_items` | SalesShipmentItem[] |  | The individual order items included in this shipment with their quantities. |
| `labels` | Qoblex.Api.Sales.Dto.ShipmentLabelDto[] |  | Labels generated for the shipment. |
| `can_hold_inventory` | boolean |  | Indicates whether this shipment location can hold inventory. |
| `carrier` | string |  | Shipping carrier. |
| `shipping_method` | string |  | Shipping method used |
| `tracking_code` | string |  | The carrier tracking number for the shipment. |
| `shipment_date` | string (date-time) |  | Date the shipment was sent (ISO 8601 format). |
| `delivery_date` | string (date-time) |  | Delivery date (ISO 8601 format). |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered. |
| `comments` | string |  | Notes or comments about the shipment. |
| `status` | string |  | Current status of the shipment. |
| `delivery_note` | SalesDeliveryNote |  | Proof of delivery details including who delivered and received the package. |
| `id` | integer (int64) |  | Unique identifier for the shipment. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/pack' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### POST /v1/sale_orders/{id}/shipments/{shipment_id}/pick

**Pick Shipment**

Marks a shipment as picked, confirming that stock has been pulled from the warehouse for
this order. Supply a pick plan to choose specific quantities and batches when you need
control over which lots go out, or send no body to accept Qoblex's recommended picks.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int32) | yes | The ID of the shipment to mark as picked. |

**Request body** `SalesPickShipmentRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `sale_order_id` | integer (int32) |  | The sale order being picked. When supplied, it must match the sale order in the route. |
| `shipment_id` | integer (int32) |  | The shipment being picked. When supplied, it must match the shipment in the route. |
| `shipment_line_items` | SalesPickShipmentLineItemRequest[] |  | The shipment items and batch choices the picker wants Qoblex to reserve. Leave this empty to use the recommended picking choices for the shipment. |

**Response** `200` `SalesShipment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `order_id` | integer (int64) |  | Sale order identifier. |
| `number` | string |  | Shipment number. |
| `location` | SalesLocation |  | The warehouse or location from which this order will be fulfilled. |
| `shipment_items` | SalesShipmentItem[] |  | The individual order items included in this shipment with their quantities. |
| `labels` | Qoblex.Api.Sales.Dto.ShipmentLabelDto[] |  | Labels generated for the shipment. |
| `can_hold_inventory` | boolean |  | Indicates whether this shipment location can hold inventory. |
| `carrier` | string |  | Shipping carrier. |
| `shipping_method` | string |  | Shipping method used |
| `tracking_code` | string |  | The carrier tracking number for the shipment. |
| `shipment_date` | string (date-time) |  | Date the shipment was sent (ISO 8601 format). |
| `delivery_date` | string (date-time) |  | Delivery date (ISO 8601 format). |
| `is_package_delivered` | boolean |  | Indicates whether the package has been delivered. |
| `comments` | string |  | Notes or comments about the shipment. |
| `status` | string |  | Current status of the shipment. |
| `delivery_note` | SalesDeliveryNote |  | Proof of delivery details including who delivered and received the package. |
| `id` | integer (int64) |  | Unique identifier for the shipment. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/pick' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### GET /v1/sale_orders/{id}/shipments/{shipment_id}/pick_plan

**Get Pick Plan**

Returns a pick plan for a shipment: a picking guide that tells warehouse staff which batches
to pull from and how much to take from each to fulfill the shipment's line items. A single
line item may draw from several batches when no one batch holds enough to cover the full
quantity.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int64) | yes | The ID of the sale order the shipment belongs to. |
| `shipment_id` | path | integer (int64) | yes | The ID of the shipment to get the pick plan for. |

**Response** `200` `SalesPickPlan`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `sale_order_id` | integer (int32) |  | The sale order the pick plan belongs to. |
| `shipment_id` | integer (int32) |  | The shipment the pick plan belongs to. |
| `shipment_line_items` | SalesPickPlanShipmentItem[] |  | The shipment items Qoblex recommends picking. |

```bash
curl -sS 'https://api.qoblex.com/v1/sale_orders/{id}/shipments/{shipment_id}/pick_plan' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

