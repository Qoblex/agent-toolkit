# BOM & Kits

Composition turns a simple variant into a bundle or a bill of material built from component variants. A bundle is sold and shipped as its parts; a bill of material is assembled into the finished variant through a manufacturing order, and may itself nest other bills of material for multi-level structures. Set or dismantle a variant's composition, and add, update, or remove individual components.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

4 endpoints.

### POST /v1/variants/{id}/components

**Add or Update Component**

Adds a component to a composed variant, or updates its quantity when the `component_variant_id` is
already present (the component is matched, and upserted, by that id). Use this to amend a bundle or bill of
material without rebuilding it. The variant must already be a bundle or bill of material.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the composed variant. Example: `4821`. |

**Request body** `Qoblex.Api.Products.Composition.Dto.VariantComponentDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `component_variant_id` | integer (int32) |  | Identifier of the variant used as a component. On a response, use the variant endpoints to fetch its SKU, name, or stock. |
| `quantity` | number (double) |  | Quantity of the component consumed per unit of the parent variant. Must be greater than zero. |

**Response** `200` `Qoblex.Api.Products.Composition.Dto.VariantCompositionDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Identifier of the composed variant. |
| `product_id` | integer (int32) |  | Product the composed variant belongs to. |
| `sku` | string |  | Stock keeping unit of the composed variant. |
| `name` | string |  | Display name of the composed variant. |
| `type` | enum(`simple`, `bundle`, `bill_of_material`) |  | Composition type after the change: `simple`, `bundle`, or `bill_of_material`. |
| `components` | Qoblex.Api.Products.Composition.Dto.VariantComponentDto[] |  | Component lines that currently make up the variant. Empty when the variant is simple. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/components' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/variants/{id}/components/{component_variant_id}

**Delete Component**

Removes a single component from a composed variant. Removing the last remaining component dismantles the
variant back into a simple variant.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the composed variant. Example: `4821`. |
| `component_variant_id` | path | integer (int32) | yes |  |

**Response** `200` `Qoblex.Api.Products.Composition.Dto.VariantCompositionDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Identifier of the composed variant. |
| `product_id` | integer (int32) |  | Product the composed variant belongs to. |
| `sku` | string |  | Stock keeping unit of the composed variant. |
| `name` | string |  | Display name of the composed variant. |
| `type` | enum(`simple`, `bundle`, `bill_of_material`) |  | Composition type after the change: `simple`, `bundle`, or `bill_of_material`. |
| `components` | Qoblex.Api.Products.Composition.Dto.VariantComponentDto[] |  | Component lines that currently make up the variant. Empty when the variant is simple. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/components/{component_variant_id}' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### POST /v1/variants/{id}/composition

**Set Composition**

Turns a simple variant into a bundle or a bill of material made up of component variants, so you can build
kit and manufacturing structures in your catalog. A bundle is sold and shipped as its parts; a bill of
material is assembled into the variant through a manufacturing order. Bundles must use standard stock
tracking, while a bill of material may be batch or serial tracked. Components can themselves be bills of
material, so multi-level structures are supported. The supplied components are the complete set for the
variant. To amend the components of an already-composed variant, use the component endpoints; to change its
type, dismantle it first.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the variant to compose. Example: `4821`. |

**Request body** `Qoblex.Api.Products.Composition.Dto.SetVariantCompositionRequestDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string |  | Composition to apply: `bundle` or `bill_of_material`. Use the dismantle endpoint to return a variant to `simple`. Bundles must use standard stock tracking; a bill of material may be batch or serial tracked. |
| `components` | Qoblex.Api.Products.Composition.Dto.VariantComponentDto[] |  | The complete set of component lines that make up the variant. At least one line is required, quantities must be greater than zero, a variant cannot include itself, and a plain bundle cannot be used as a component (a bill of material can). |

**Response** `200` `Qoblex.Api.Products.Composition.Dto.VariantCompositionDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Identifier of the composed variant. |
| `product_id` | integer (int32) |  | Product the composed variant belongs to. |
| `sku` | string |  | Stock keeping unit of the composed variant. |
| `name` | string |  | Display name of the composed variant. |
| `type` | enum(`simple`, `bundle`, `bill_of_material`) |  | Composition type after the change: `simple`, `bundle`, or `bill_of_material`. |
| `components` | Qoblex.Api.Products.Composition.Dto.VariantComponentDto[] |  | Component lines that currently make up the variant. Empty when the variant is simple. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/composition' \
  -X POST \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ }'
```

### DELETE /v1/variants/{id}/composition

**Dismantle Composition**

Dismantles a bundle or bill-of-material variant back into a simple variant, removing all of its components.
Use this to undo a composition or to change a variant's type before composing it again.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | path | integer (int32) | yes | Unique identifier of the composed variant to dismantle. Example: `4821`. |

**Response** `200` `Qoblex.Api.Products.Composition.Dto.VariantCompositionDto`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Identifier of the composed variant. |
| `product_id` | integer (int32) |  | Product the composed variant belongs to. |
| `sku` | string |  | Stock keeping unit of the composed variant. |
| `name` | string |  | Display name of the composed variant. |
| `type` | enum(`simple`, `bundle`, `bill_of_material`) |  | Composition type after the change: `simple`, `bundle`, or `bill_of_material`. |
| `components` | Qoblex.Api.Products.Composition.Dto.VariantComponentDto[] |  | Component lines that currently make up the variant. Empty when the variant is simple. |

```bash
curl -sS 'https://api.qoblex.com/v1/variants/{id}/composition' \
  -X DELETE \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

