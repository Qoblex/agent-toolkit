# Quotes

A quote is a priced proposal you send to a customer before it becomes a firm order. It carries the customer, proposed line items, and pricing, and can be converted into a sale order once accepted. Use these endpoints to list and manage quotes at the top of your sales workflow.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

1 endpoint.

### GET /v1/quotes

**List Quotes**

Returns your quotes so you can track what you've offered customers before a sale is confirmed.
Use this to review open quotes during your pre-sale workflow, follow up on ones awaiting a decision,
and see which are ready to turn into sale orders.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `page` | query | integer (int32) |  |  |
| `expand` | query | string |  |  |
| `filters` | query | string |  |  |
| `sort_by` | query | string |  |  |
| `include_count` | query | boolean |  |  |

**Response** `200` `QuotesResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | integer (int32) |  |  |
| `filtered_count` | integer (int32) |  |  |
| `quotes` | Quote[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/quotes' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

