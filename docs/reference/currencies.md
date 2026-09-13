# Currencies

Currency reference data: the full set of ISO 4217 codes you can assign to orders and price lists, and the current market exchange rate between any two of them. Your account's own manual rate overrides are managed under Account.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 355 schemas declare one. The `400` response names the fields it rejected.

2 endpoints.

### GET /v1/currencies

**List Currencies**

Returns every currency code Qoblex supports, in ISO 4217 format (for example USD, EUR, GBP). Use these codes when setting the currency on orders, price lists, and other financial records.

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/currencies' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/currencies/exchange_rate

**Get Exchange Rate**

Retrieves the current market exchange rate between two currencies, for example to pre-fill the rate when creating an order in a foreign currency. Both `from` and `to` must be ISO 4217 codes.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `from` | query | string |  | The source ISO 4217 currency code, for example `USD`. |
| `to` | query | string |  | The target ISO 4217 currency code, for example `EUR`. |

**Response** `200`

```bash
curl -sS 'https://api.qoblex.com/v1/currencies/exchange_rate' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

