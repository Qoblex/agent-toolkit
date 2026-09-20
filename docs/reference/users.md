# Users

A user is a member of your team with access to the account. The user object carries their profile and the permissions that determine what they can see and do. Use these endpoints to list users, retrieve the signed-in user, update a user's permissions, and remove access when someone leaves.

Base URL `https://api.qoblex.com`. Every request carries the `qoblex-x-api-key` header. See
[conventions](../conventions.md) for paging, filtering, expanding and rate limits.

A blank **Required** cell means the spec does not say, not that the field is optional:
only 6 of 361 schemas declare one. The `400` response names the fields it rejected.

2 endpoints.

### GET /v1/users

**List Users**

Returns the team members on your account so you can review who has access and choose a user to manage.

| Parameter | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `search` | query | string |  |  |

**Response** `200`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  |  |
| `name` | string |  |  |
| `email` | string |  |  |
| `has_valid_email` | boolean |  |  |
| `is_deleted` | boolean |  |  |
| `is_partner` | boolean |  |  |
| `is_virtual` | boolean |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/users' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

### GET /v1/users/me

**Get Current User**

Returns the profile of the user making the request, along with the permissions assigned to them, so the signed-in team member and what they are allowed to do can be identified.

**Response** `200` `UserWithPermission`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer (int32) |  |  |
| `name` | string |  |  |
| `email` | string |  |  |
| `has_valid_email` | boolean |  |  |
| `is_deleted` | boolean |  |  |
| `is_partner` | boolean |  |  |
| `is_virtual` | boolean |  |  |
| `timezone` | string |  |  |
| `timezone_offset` | integer (int32) |  |  |
| `last_notified` | string (date-time) |  |  |
| `permissions` | PermissionSet[] |  |  |

```bash
curl -sS 'https://api.qoblex.com/v1/users/me' \
  -H 'qoblex-x-api-key: '"$QOBLEX_API_KEY"
```

