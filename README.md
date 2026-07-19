# SMS Validator API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://sms-validator.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Validate SMS-capable phone numbers -- mobile vs landline detection, carrier type, E.164 format, SMS readiness. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "sms-validator": {
      "url": "https://sms-validator.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://sms-validator.api.klymax402.com/api/validate" \
  -H "Content-Type: application/json" \
  -d '{"phone":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `sms_validate_number` | POST | `/api/validate` | $0.005 | Validate if a phone number can receive SMS |

### `sms_validate_number`

Use this when you need to check if a phone number can receive SMS messages. Returns SMS capability data in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `phone` | string | yes | Phone number with country code (e.g. +14155551234) |
| `countryCode` | string | no | ISO 3166-1 alpha-2 country code hint (e.g. US, FR, GB) |

Example response:

```json
{"phone":"+14155551234","canReceiveSMS":true,"carrierType":"mobile","e164":"+14155551234","countryCode":"US","numberType":"mobile","carrier":"T-Mobile"}
```

**When to use**: sending SMS campaigns, FOR filtering landlines from SMS lists, verifying 2FA phone numbers, and OTP delivery validation.

**Not for**: full phone validation with carrier lookup (use `phone_validate_number`), email validation (use `email_verify_address`), address validation (use `address_validate`).

## Example agent prompts

- "Check if a phone number can receive SMS messages"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
