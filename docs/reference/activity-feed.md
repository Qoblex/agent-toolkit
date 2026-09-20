# Activity Feed

The activity feed is a chronological record of notable events across your account, such as orders and stock movements your team should be aware of. Use it to surface recent activity and notifications in your own tools, and to mark entries as read.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

1 endpoint.

### GET /v1/activity

**List Activity**

Returns your activity feed so you can keep an eye on recent notifications and what has
changed across the business. Pass `source_id` to narrow the feed to a single order's
activity (such as a purchase order's approvals, receipts, and billing changes) instead of
the full company-wide feed.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `log_level` | query | string |  |  |
| `page` | query | integer (int32) |  |  |
| `page_size` | query | integer (int32) |  |  |
| `search` | query | string |  |  |
| `unread_only` | query | boolean |  |  |
| `app_id` | query | integer (int32) |  |  |
| `source_id` | query | integer (int32) |  |  |

**Response** `200` `ActivityLogList`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | ActivityLog[] |  |  |
| `total_count` | integer (int32) |  |  |
| `prev` | integer (int32) |  |  |
| `next` | integer (int32) |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/activity' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

