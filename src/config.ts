import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "sms-validator",
  slug: "sms-validator",
  description: "Validate SMS-capable phone numbers -- mobile vs landline detection, carrier type, E.164 format, SMS readiness.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/validate",
      price: "$0.005",
      description: "Validate if a phone number can receive SMS",
      toolName: "sms_validate_number",
      toolDescription: `Use this when you need to check if a phone number can receive SMS messages. Returns SMS capability data in JSON.

Returns: 1. canReceiveSMS (boolean) 2. carrierType (mobile/landline/voip) 3. e164 formatted number 4. countryCode 5. numberType (mobile/landline/voip/toll-free) 6. carrier name.

Example output: {"phone":"+14155551234","canReceiveSMS":true,"carrierType":"mobile","e164":"+14155551234","countryCode":"US","numberType":"mobile","carrier":"T-Mobile"}

Use this BEFORE sending SMS campaigns, FOR filtering landlines from SMS lists, verifying 2FA phone numbers, and OTP delivery validation.

Do NOT use for full phone validation with carrier lookup -- use phone_validate_number instead. Do NOT use for email validation -- use email_verify_address instead. Do NOT use for address validation -- use address_validate instead.`,
      inputSchema: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Phone number with country code (e.g. +14155551234)" },
          countryCode: { type: "string", description: "ISO 3166-1 alpha-2 country code hint (e.g. US, FR, GB)" },
        },
        required: ["phone"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "phone": {
              "type": "string",
              "description": "Input phone number"
            },
            "e164": {
              "type": "string",
              "description": "E.164 format"
            },
            "valid": {
              "type": "boolean",
              "description": "Whether number is valid"
            },
            "country": {
              "type": "object",
              "properties": {
                "code": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "dialCode": {
                  "type": "string"
                }
              }
            },
            "numberType": {
              "type": "string",
              "description": "Number type"
            },
            "smsCapable": {
              "type": "boolean",
              "description": "SMS capability"
            },
            "nationalNumber": {
              "type": "string"
            }
          },
          "required": [
            "phone",
            "e164",
            "valid"
          ]
        },
    },
  ],
};
