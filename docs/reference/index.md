# Endpoint index

Every endpoint in Qoblex API v1: 197 across 30 resource groups.
Generated from the OpenAPI document. Do not edit by hand.

| Method | Path | Summary | Group |
| --- | --- | --- | --- |
| `GET` | `/v1/account` | Get Account | [Account](account.md) |
| `GET` | `/v1/account/adjustment_reasons` | List Adjustment Reasons | [Account](account.md) |
| `GET` | `/v1/account/locations` | List Locations | [Account](account.md) |
| `GET` | `/v1/account/locations/{id}` | Get Location | [Account](account.md) |
| `GET` | `/v1/account/stores` | List Stores | [Account](account.md) |
| `GET` | `/v1/activity` | List Activity | [Activity Feed](activity-feed.md) |
| `GET` | `/v1/adjustments` | List Adjustments | [Adjustment](adjustment.md) |
| `POST` | `/v1/adjustments` | Create Adjustment | [Adjustment](adjustment.md) |
| `GET` | `/v1/adjustments/{id}` | Get Adjustment | [Adjustment](adjustment.md) |
| `PUT` | `/v1/adjustments/{id}` | Update Adjustment | [Adjustment](adjustment.md) |
| `DELETE` | `/v1/adjustments/{id}` | Delete Adjustment | [Adjustment](adjustment.md) |
| `POST` | `/v1/adjustments/{id}/authorize` | Authorize Adjustment | [Adjustment](adjustment.md) |
| `POST` | `/v1/adjustments/{id}/batches` | Assign Batches | [Adjustment](adjustment.md) |
| `POST` | `/v1/adjustments/{id}/duplicate` | Duplicate Adjustment | [Adjustment](adjustment.md) |
| `GET` | `/v1/adjustments/{id}/items` | List Adjustment Items | [Adjustment](adjustment.md) |
| `DELETE` | `/v1/adjustments/{id}/items` | Delete Adjustment Items | [Adjustment](adjustment.md) |
| `POST` | `/v1/adjustments/{id}/reconcile` | Reconcile Adjustment | [Adjustment](adjustment.md) |
| `POST` | `/v1/adjustments/stocktake/csv` | Import Stocktake CSV | [Adjustment](adjustment.md) |
| `GET` | `/v1/batches` | List Batches | [Batches](batches.md) |
| `POST` | `/v1/batches` | Upsert Batches | [Batches](batches.md) |
| `DELETE` | `/v1/batches/{batch_id}` | Delete Batch | [Batches](batches.md) |
| `GET` | `/v1/batches/{batch_id}/trace` | Get Trace | [Batches](batches.md) |
| `POST` | `/v1/purchase_orders/{id}/bills/{bill_id}/payments` | Add Payment | [Bill Payments](bill-payments.md) |
| `POST` | `/v1/purchase_orders/{id}/bills/{bill_id}/payments/{payment_id}` | Update Payment | [Bill Payments](bill-payments.md) |
| `DELETE` | `/v1/purchase_orders/{id}/bills/{bill_id}/payments/{payment_id}` | Delete Payment | [Bill Payments](bill-payments.md) |
| `POST` | `/v1/purchase_orders/{id}/bills` | Create Bill | [Bills](bills.md) |
| `GET` | `/v1/purchase_orders/{id}/bills/{bill_id}` | Get Bill | [Bills](bills.md) |
| `PATCH` | `/v1/purchase_orders/{id}/bills/{bill_id}` | Update a draft bill | [Bills](bills.md) |
| `DELETE` | `/v1/purchase_orders/{id}/bills/{bill_id}` | Delete Bill | [Bills](bills.md) |
| `POST` | `/v1/purchase_orders/{id}/bills/{bill_id}/authorize` | Authorize Bill | [Bills](bills.md) |
| `DELETE` | `/v1/purchase_orders/{id}/bills/{bill_id}/landed_costs/{landed_cost_item_id}` | Remove a landed cost item from a draft bill | [Bills](bills.md) |
| `DELETE` | `/v1/purchase_orders/{id}/bills/{bill_id}/line_items/{line_item_id}` | Remove a line item from a draft bill | [Bills](bills.md) |
| `POST` | `/v1/purchase_orders/{id}/bills/{bill_id}/unauthorize` | Unauthorize Bill | [Bills](bills.md) |
| `POST` | `/v1/variants/{id}/components` | Add or Update Component | [BOM & Kits](bom-and-kits.md) |
| `DELETE` | `/v1/variants/{id}/components/{component_variant_id}` | Delete Component | [BOM & Kits](bom-and-kits.md) |
| `POST` | `/v1/variants/{id}/composition` | Set Composition | [BOM & Kits](bom-and-kits.md) |
| `DELETE` | `/v1/variants/{id}/composition` | Dismantle Composition | [BOM & Kits](bom-and-kits.md) |
| `GET` | `/v1/currencies` | List Currencies | [Currencies](currencies.md) |
| `GET` | `/v1/currencies/exchange_rate` | Get Exchange Rate | [Currencies](currencies.md) |
| `GET` | `/v1/custom_fields` | List Custom Fields | [Custom Fields](custom-fields.md) |
| `POST` | `/v1/custom_fields` | Create Custom Field | [Custom Fields](custom-fields.md) |
| `DELETE` | `/v1/custom_fields/{id}` | Delete Custom Field | [Custom Fields](custom-fields.md) |
| `POST` | `/v1/custom_fields/assign` | Assign Custom Fields | [Custom Fields](custom-fields.md) |
| `GET` | `/v1/custom_fields/definitions` | List Custom Field Definitions | [Custom Fields](custom-fields.md) |
| `POST` | `/v1/custom_fields/definitions` | Create Custom Field Definition | [Custom Fields](custom-fields.md) |
| `PUT` | `/v1/custom_fields/definitions/{id}` | Update Custom Field Definition | [Custom Fields](custom-fields.md) |
| `DELETE` | `/v1/custom_fields/definitions/{id}` | Delete Custom Field Definition | [Custom Fields](custom-fields.md) |
| `GET` | `/v1/custom_fields/definitions/{id}/usage` | Get Custom Field Definition Usage | [Custom Fields](custom-fields.md) |
| `GET` | `/v1/customers` | List Customers | [Customers](customers.md) |
| `POST` | `/v1/customers` | Create Customer | [Customers](customers.md) |
| `GET` | `/v1/customers/{id}` | Get Customer | [Customers](customers.md) |
| `POST` | `/v1/purchase_orders/{id}/deposits` | Create Supplier Deposit | [Deposits & Refunds](deposits-and-refunds.md) |
| `PATCH` | `/v1/purchase_orders/{id}/deposits/{deposit_id}` | Update Supplier Deposit | [Deposits & Refunds](deposits-and-refunds.md) |
| `DELETE` | `/v1/purchase_orders/{id}/deposits/{deposit_id}` | Delete Supplier Deposit | [Deposits & Refunds](deposits-and-refunds.md) |
| `POST` | `/v1/purchase_orders/{id}/deposits/{deposit_id}/allocations/{bill_id}` | Allocate Deposit | [Deposits & Refunds](deposits-and-refunds.md) |
| `DELETE` | `/v1/purchase_orders/{id}/deposits/{deposit_id}/allocations/{bill_id}` | Delete Deposit Allocation | [Deposits & Refunds](deposits-and-refunds.md) |
| `POST` | `/v1/purchase_orders/{id}/refunds` | Create Supplier Refund | [Deposits & Refunds](deposits-and-refunds.md) |
| `DELETE` | `/v1/purchase_orders/{id}/refunds/{refund_id}` | Delete Supplier Refund | [Deposits & Refunds](deposits-and-refunds.md) |
| `POST` | `/v1/purchase_orders/{id}/refunds/{refund_id}/authorize` | Authorize Supplier Refund | [Deposits & Refunds](deposits-and-refunds.md) |
| `POST` | `/v1/purchase_orders/{id}/refunds/{refund_id}/unauthorize` | Unauthorize Supplier Refund | [Deposits & Refunds](deposits-and-refunds.md) |
| `POST` | `/v1/purchase_orders/{id}/goods_receipt_notes` | Create Goods Receipt Note | [Goods Receipt Notes](goods-receipt-notes.md) |
| `GET` | `/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}` | Get Goods Receipt Note | [Goods Receipt Notes](goods-receipt-notes.md) |
| `PATCH` | `/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}` | Update Goods Receipt Note | [Goods Receipt Notes](goods-receipt-notes.md) |
| `DELETE` | `/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}` | Delete Goods Receipt Note | [Goods Receipt Notes](goods-receipt-notes.md) |
| `POST` | `/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/authorize` | Authorize Goods Receipt Note | [Goods Receipt Notes](goods-receipt-notes.md) |
| `POST` | `/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/batches` | Assign Batches | [Goods Receipt Notes](goods-receipt-notes.md) |
| `DELETE` | `/v1/purchase_orders/{id}/goods_receipt_notes/{grn_id}/line_items/{line_item_id}` | Delete Goods Receipt Note Line Item | [Goods Receipt Notes](goods-receipt-notes.md) |
| `POST` | `/v1/sale_orders/{id}/invoices` | Create Invoice | [Invoices & Payments](invoices-and-payments.md) |
| `POST` | `/v1/sale_orders/{id}/invoices/{invoice_id}/authorize` | Authorize Invoice | [Invoices & Payments](invoices-and-payments.md) |
| `POST` | `/v1/sale_orders/{id}/payments` | Create Payment | [Invoices & Payments](invoices-and-payments.md) |
| `GET` | `/v1/manufacturing_orders` | List Orders | [Manufacturing Orders](manufacturing-orders.md) |
| `POST` | `/v1/manufacturing_orders` | Create Order | [Manufacturing Orders](manufacturing-orders.md) |
| `GET` | `/v1/manufacturing_orders/{id}` | Get Order | [Manufacturing Orders](manufacturing-orders.md) |
| `POST` | `/v1/manufacturing_orders/{id}` | Update Order | [Manufacturing Orders](manufacturing-orders.md) |
| `POST` | `/v1/manufacturing_orders/{id}/complete` | Complete Order | [Manufacturing Orders](manufacturing-orders.md) |
| `POST` | `/v1/manufacturing_orders/{id}/start` | Start Order | [Manufacturing Orders](manufacturing-orders.md) |
| `POST` | `/v1/manufacturing_orders/{id}/stop` | Stop Order | [Manufacturing Orders](manufacturing-orders.md) |
| `GET` | `/v1/price_lists` | List Price Lists | [Price Lists](price-lists.md) |
| `POST` | `/v1/variants/prices` | Update Prices | [Price Lists](price-lists.md) |
| `GET` | `/v1/products` | List Products | [Product](product.md) |
| `POST` | `/v1/products` | Create Product | [Product](product.md) |
| `GET` | `/v1/products/{id}` | Get Product | [Product](product.md) |
| `POST` | `/v1/products/{id}` | Update Product | [Product](product.md) |
| `DELETE` | `/v1/products/{id}` | Delete Product | [Product](product.md) |
| `GET` | `/v1/products/{id}/external_links` | List External Links | [Product](product.md) |
| `POST` | `/v1/products/{id}/external_links` | Create External Link | [Product](product.md) |
| `POST` | `/v1/products/{id}/external_links/{integration_id}` | Update External Link | [Product](product.md) |
| `DELETE` | `/v1/products/{id}/external_links/{integration_id}` | Delete External Link | [Product](product.md) |
| `GET` | `/v1/products/{id}/variants` | List Product Variants | [Product](product.md) |
| `DELETE` | `/v1/products/{id}/variants/{variant_id}` | Delete Product Variant | [Product](product.md) |
| `GET` | `/v1/products/overview` | List Product Overviews | [Product](product.md) |
| `GET` | `/v1/purchase_orders` | List Purchase Orders | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders` | Create Purchase Order | [Purchase Orders](purchase-orders.md) |
| `GET` | `/v1/purchase_orders/{id}` | Get Purchase Order | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}` | Update Purchase Order | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/approve` | Approve Purchase Order | [Purchase Orders](purchase-orders.md) |
| `GET` | `/v1/purchase_orders/{id}/attachments` | List Attachments | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/attachments` | Upload Attachment | [Purchase Orders](purchase-orders.md) |
| `DELETE` | `/v1/purchase_orders/{id}/attachments/{attachment_id}` | Delete Attachment | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/backorder` | Move Line Items to a Back Order | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/close` | Close Purchase Order | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/duplicate` | Duplicate Purchase Order | [Purchase Orders](purchase-orders.md) |
| `DELETE` | `/v1/purchase_orders/{id}/landed_costs` | Delete Landed Costs | [Purchase Orders](purchase-orders.md) |
| `DELETE` | `/v1/purchase_orders/{id}/line_items` | Delete Line Items | [Purchase Orders](purchase-orders.md) |
| `GET` | `/v1/purchase_orders/{id}/line_items/csv` | Export Line Items | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/line_items/csv` | Import Line Items | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/link` | Link Related Orders | [Purchase Orders](purchase-orders.md) |
| `DELETE` | `/v1/purchase_orders/{id}/link/{target_id}` | Unlink Related Order | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/{id}/receive` | Receive Purchase Order | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/bulk` | Create Purchase Orders | [Purchase Orders](purchase-orders.md) |
| `POST` | `/v1/purchase_orders/bulk/csv` | Bulk-create Purchase Orders from a CSV file | [Purchase Orders](purchase-orders.md) |
| `GET` | `/v1/purchase_orders/bulk/csv/template` | Download the bulk Purchase Order import CSV template | [Purchase Orders](purchase-orders.md) |
| `GET` | `/v1/purchase_orders/open_purchases` | List Open Purchase Orders | [Purchase Orders](purchase-orders.md) |
| `GET` | `/v1/quotes` | List Quotes | [Quotes](quotes.md) |
| `POST` | `/v1/sale_orders/{id}/refunds` | Create Refund | [Refunds & Returns](refunds-and-returns.md) |
| `POST` | `/v1/sale_orders/{id}/refunds/{refund_id}` | Update Refund | [Refunds & Returns](refunds-and-returns.md) |
| `POST` | `/v1/sale_orders/{id}/refunds/{refund_id}/authorize` | Authorize Refund | [Refunds & Returns](refunds-and-returns.md) |
| `POST` | `/v1/sale_orders/{id}/refunds/calculate` | Calculate Refund | [Refunds & Returns](refunds-and-returns.md) |
| `POST` | `/v1/sale_orders/{id}/returns` | Create Return | [Refunds & Returns](refunds-and-returns.md) |
| `POST` | `/v1/sale_orders/{id}/returns/{return_id}/authorize` | Authorize Return | [Refunds & Returns](refunds-and-returns.md) |
| `POST` | `/v1/sale_orders/{id}/returns/calculate` | Calculate Return | [Refunds & Returns](refunds-and-returns.md) |
| `GET` | `/v1/reporting/filters` | List Reporting Filters | [Reporting](reporting.md) |
| `GET` | `/v1/reporting/forecasting` | Get Forecasting Report | [Reporting](reporting.md) |
| `GET` | `/v1/reporting/inventory` | Get Inventory Report | [Reporting](reporting.md) |
| `GET` | `/v1/reporting/purchases` | Get Purchases Report | [Reporting](reporting.md) |
| `GET` | `/v1/reporting/sales` | Get Sales Report | [Reporting](reporting.md) |
| `GET` | `/v1/sale_orders` | List Sale Orders | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders` | Create Sale Order | [Sale Orders](sale-orders.md) |
| `GET` | `/v1/sale_orders/{id}` | Get Sale Order | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}` | Update Sale Order | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/allocate` | Allocate Sale Order | [Sale Orders](sale-orders.md) |
| `GET` | `/v1/sale_orders/{id}/attachments` | List Attachments | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/attachments` | Upload Attachment | [Sale Orders](sale-orders.md) |
| `DELETE` | `/v1/sale_orders/{id}/attachments/{attachment_id}` | Delete Attachment | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/cancel` | Cancel Sale Order | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/close` | Close Sale Order | [Sale Orders](sale-orders.md) |
| `DELETE` | `/v1/sale_orders/{id}/custom_lines` | Delete Custom Lines | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/deallocate` | Deallocate Sale Order | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/drop_ship` | Drop Ship Sale Order | [Sale Orders](sale-orders.md) |
| `GET` | `/v1/sale_orders/{id}/drop_ship/items` | List Drop Ship Items | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/duplicate` | Duplicate Sale Order | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/hold` | Hold Allocations | [Sale Orders](sale-orders.md) |
| `DELETE` | `/v1/sale_orders/{id}/line_items` | Delete Line Items | [Sale Orders](sale-orders.md) |
| `GET` | `/v1/sale_orders/{id}/line_items/export` | Export Line Items | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/line_items/import` | Import Line Items | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/open` | Open Sale Order | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/revert_to_quote` | Revert Sale Order to Quote | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/{id}/unlock` | Unlock Sale Order | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/create_purchase_orders` | Create Purchase Orders From Sale Orders | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/export` | Export Sale Orders | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/import` | Import Sale Orders | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/import_from_channel` | Import Sale Orders from Channel | [Sale Orders](sale-orders.md) |
| `GET` | `/v1/sale_orders/preview_purchase_orders` | Preview Purchase Orders From Sale Orders | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/print_packing_slips` | Print Packing Slips | [Sale Orders](sale-orders.md) |
| `POST` | `/v1/sale_orders/ship` | Ship Sale Orders | [Sale Orders](sale-orders.md) |
| `GET` | `/v1/settings/payment_terms` | List Payment Terms | [Settings](settings.md) |
| `POST` | `/v1/sale_orders/{id}/shipments` | Create Shipment | [Shipments](shipments.md) |
| `POST` | `/v1/sale_orders/{id}/shipments/{shipment_id}` | Update Shipment | [Shipments](shipments.md) |
| `POST` | `/v1/sale_orders/{id}/shipments/{shipment_id}/batches` | Assign Batches | [Shipments](shipments.md) |
| `DELETE` | `/v1/sale_orders/{id}/shipments/{shipment_id}/batches/{reservation_id}` | Delete Batch Reservation | [Shipments](shipments.md) |
| `POST` | `/v1/sale_orders/{id}/shipments/{shipment_id}/delivery_note` | Create Delivery Note | [Shipments](shipments.md) |
| `POST` | `/v1/sale_orders/{id}/shipments/{shipment_id}/dispatch` | Dispatch Shipment | [Shipments](shipments.md) |
| `DELETE` | `/v1/sale_orders/{id}/shipments/{shipment_id}/line_items` | Delete Shipment Line Items | [Shipments](shipments.md) |
| `POST` | `/v1/sale_orders/{id}/shipments/{shipment_id}/pack` | Pack Shipment | [Shipments](shipments.md) |
| `POST` | `/v1/sale_orders/{id}/shipments/{shipment_id}/pick` | Pick Shipment | [Shipments](shipments.md) |
| `GET` | `/v1/sale_orders/{id}/shipments/{shipment_id}/pick_plan` | Get Pick Plan | [Shipments](shipments.md) |
| `POST` | `/v1/purchase_orders/{id}/supplier_returns` | Create Supplier Return | [Supplier Returns](supplier-returns.md) |
| `GET` | `/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}` | Get Supplier Return | [Supplier Returns](supplier-returns.md) |
| `PATCH` | `/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}` | Update Supplier Return | [Supplier Returns](supplier-returns.md) |
| `DELETE` | `/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}` | Delete Supplier Return | [Supplier Returns](supplier-returns.md) |
| `POST` | `/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}/authorize` | Authorize Supplier Return | [Supplier Returns](supplier-returns.md) |
| `DELETE` | `/v1/purchase_orders/{id}/supplier_returns/{supplier_return_id}/line_items/{line_item_id}` | Delete Supplier Return Line Item | [Supplier Returns](supplier-returns.md) |
| `GET` | `/v1/suppliers` | List Suppliers | [Suppliers](suppliers.md) |
| `POST` | `/v1/suppliers` | Create Supplier | [Suppliers](suppliers.md) |
| `GET` | `/v1/suppliers/{id}` | Get Supplier | [Suppliers](suppliers.md) |
| `POST` | `/v1/suppliers/{id}` | Update Supplier | [Suppliers](suppliers.md) |
| `DELETE` | `/v1/suppliers/{id}` | Delete Supplier | [Suppliers](suppliers.md) |
| `GET` | `/v1/tax_classes` | List Tax Classes | [Tax Classes](tax-classes.md) |
| `POST` | `/v1/tax_classes` | Create Tax Class | [Tax Classes](tax-classes.md) |
| `GET` | `/v1/tax_classes/{id}` | Get Tax Class | [Tax Classes](tax-classes.md) |
| `POST` | `/v1/tax_classes/{id}` | Update Tax Class | [Tax Classes](tax-classes.md) |
| `DELETE` | `/v1/tax_classes/{id}` | Delete Tax Class | [Tax Classes](tax-classes.md) |
| `POST` | `/v1/transfers` | Create Transfer | [Transfer](transfer.md) |
| `POST` | `/v1/transfers/{id}/authorize` | Authorize Transfer | [Transfer](transfer.md) |
| `POST` | `/v1/transfers/{id}/batches` | Assign Batches | [Transfer](transfer.md) |
| `GET` | `/v1/users` | List Users | [Users](users.md) |
| `GET` | `/v1/users/me` | Get Current User | [Users](users.md) |
| `GET` | `/v1/variants/{id}/suppliers` | List Suppliers for a Variant | [Variant Suppliers](variant-suppliers.md) |
| `PUT` | `/v1/variants/{id}/suppliers` | Update Suppliers | [Variant Suppliers](variant-suppliers.md) |
| `DELETE` | `/v1/variants/{id}/suppliers/{supplier_id}` | Delete Supplier | [Variant Suppliers](variant-suppliers.md) |
| `GET` | `/v1/variants/suppliers` | List Suppliers | [Variant Suppliers](variant-suppliers.md) |
| `GET` | `/v1/variants` | List Variants | [Variants](variants.md) |
| `GET` | `/v1/variants/{id}/inventory` | Get Inventory | [Variants](variants.md) |
| `GET` | `/v1/variants/external_links` | List External Links | [Variants](variants.md) |
| `POST` | `/v1/variants/external_links` | Create External Links | [Variants](variants.md) |
| `GET` | `/v1/variants/filters` | Get Filters | [Variants](variants.md) |
| `GET` | `/v1/variants/groupings` | Get Groupings | [Variants](variants.md) |
