import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "sms-validator",
  slug: "sms-validator",
  description: "Validate SMS-capable phone numbers. Check carrier type, detect landlines vs mobile, format E.164.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/validate",
      price: "$0.002",
      description: "Validate if a phone number can receive SMS",
      toolName: "sms_validate_number",
      toolDescription: "Use this when you need to check if a phone number can receive SMS messages. Returns carrier type (mobile/landline/voip), SMS capability, E.164 format, country code, and number type. Do NOT use for full phone validation with carrier lookup — use phone_validate_number instead. Do NOT use for email validation — use email_verify_address instead.",
      inputSchema: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Phone number with country code (e.g. +14155551234)" },
          countryCode: { type: "string", description: "ISO 3166-1 alpha-2 country code hint (e.g. US, FR, GB)" },
        },
        required: ["phone"],
      },
    },
  ],
};
