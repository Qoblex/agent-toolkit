# Settings

The settings endpoints manage account-level configuration that other records depend on, such as the payment terms you offer and your locations. Use them to maintain the reusable options that appear across orders, invoices, and stock.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

1 endpoint.

### GET /v1/settings/payment_terms

**List Payment Terms**

Returns the payment terms configured on your account, such as Net 30 or Due on receipt. Use these to set default due dates on invoices and purchase orders and keep billing consistent across your customers and suppliers.

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  | Unique identifier of the payment term. |
| `name` | string |  | Name of the payment term shown to customers and suppliers. |
| `type` | enum(`days_net`, `days_after_e_o_m`, `days_e_o_m_xth_day`) |  | How the due date is calculated: from the invoice date, or relative to the end of the month. |
| `display_type` | string |  | Human-readable description of how the due date is calculated. |
| `days` | integer (int32) |  | Number of days until payment is due, counted per the payment term's type. |
| `months` | integer (int32) |  | Number of months added before the day-count above is applied. Zero when not used. |

```bash
curl -sS 'https://api.qoblex.com/v1/settings/payment_terms' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

