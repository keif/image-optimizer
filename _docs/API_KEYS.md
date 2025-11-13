# API Keys

Squish uses bearer-style API keys stored in SQLite. Authentication is enabled by default in production deployments and can be disabled for local testing.

## Bootstrapping

`POST /api/keys` is intentionally left open so you can create the first key:

```bash
curl -X POST "http://localhost:8080/api/keys" \
  -H "Content-Type: application/json" \
  -d '{"name":"Local Dev"}'
```

Response:

```json
{
  "id": 1,
  "name": "Local Dev",
  "key": "sk_2wV8...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

Save the `key` immediately—it is only returned once.

## List Keys

```bash
curl -H "Authorization: Bearer sk_your_key" \
  http://localhost:8080/api/keys | jq
```

Returns `id`, `name`, `created_at`, and `revoked_at` (if applicable).

## Revoke Key

```bash
curl -X DELETE "http://localhost:8080/api/keys/1" \
  -H "Authorization: Bearer sk_your_key"
```

Response:

```json
{ "message": "API key revoked successfully" }
```

## Using Keys

Send the key via the `Authorization` header:

```bash
curl -H "Authorization: Bearer sk_your_key" ...
# or
curl -H "Authorization: sk_your_key" ...
```

## Auth Bypass Rules

The following endpoints remain open so the public web UI works out-of-the-box:

- `GET /health`
- `/swagger/*`
- `/optimize` + `/batch-optimize` (when `PUBLIC_OPTIMIZATION_ENABLED=true`)
- `POST /api/keys` (bootstrap only)

All other routes—including key listing/revocation, metrics, spritesheet APIs, and admin tasks—require a valid key.

## Recommended Modes

| Mode | `API_KEY_AUTH_ENABLED` | `PUBLIC_OPTIMIZATION_ENABLED` | Notes |
|------|------------------------|-------------------------------|-------|
| Local development | `false` | `true` | Simplest experience |
| Public website | `true` | `true` | Web UI open, API locked down |
| Private/self-hosted | `true` | `false` | Maximum security |
