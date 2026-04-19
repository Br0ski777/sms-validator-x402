import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

const COUNTRY_DB: Record<string, { dialCode: string; name: string; mobilePattern: RegExp; mobileLength: number[] }> = {
  US: { dialCode: "+1", name: "United States", mobilePattern: /^[2-9]\d{2}[2-9]\d{6}$/, mobileLength: [10] },
  CA: { dialCode: "+1", name: "Canada", mobilePattern: /^[2-9]\d{2}[2-9]\d{6}$/, mobileLength: [10] },
  GB: { dialCode: "+44", name: "United Kingdom", mobilePattern: /^7\d{9}$/, mobileLength: [10] },
  FR: { dialCode: "+33", name: "France", mobilePattern: /^[67]\d{8}$/, mobileLength: [9] },
  DE: { dialCode: "+49", name: "Germany", mobilePattern: /^1[5-7]\d{8,9}$/, mobileLength: [10, 11] },
  AU: { dialCode: "+61", name: "Australia", mobilePattern: /^4\d{8}$/, mobileLength: [9] },
  IN: { dialCode: "+91", name: "India", mobilePattern: /^[6-9]\d{9}$/, mobileLength: [10] },
  BR: { dialCode: "+55", name: "Brazil", mobilePattern: /^\d{2}9\d{8}$/, mobileLength: [11] },
  JP: { dialCode: "+81", name: "Japan", mobilePattern: /^[789]0\d{8}$/, mobileLength: [10] },
  CN: { dialCode: "+86", name: "China", mobilePattern: /^1[3-9]\d{9}$/, mobileLength: [11] },
};

const DIAL_MAP: Record<string, string> = {};
for (const [cc, info] of Object.entries(COUNTRY_DB)) DIAL_MAP[info.dialCode.replace("+", "")] = cc;

function detectCountry(phone: string, hint?: string): string | null {
  if (hint && COUNTRY_DB[hint.toUpperCase()]) return hint.toUpperCase();
  const sorted = Object.keys(DIAL_MAP).sort((a, b) => b.length - a.length);
  for (const dc of sorted) if (phone.startsWith(dc)) return DIAL_MAP[dc];
  return null;
}

export function registerRoutes(app: Hono) {
  app.post("/api/validate", async (c) => {
    await tryRequirePayment(0.002);
    const body = await c.req.json().catch(() => null);
    if (!body?.phone) return c.json({ error: "Missing required field: phone" }, 400);
    let phone = body.phone.toString().replace(/[\s\-().]/g, "").replace(/^\+/, "");
    if (!/^\d{7,15}$/.test(phone)) return c.json({ error: "Invalid phone number format" }, 400);
    const cc = detectCountry(phone, body.countryCode);
    if (!cc) return c.json({ phone: body.phone, valid: false, error: "Could not determine country", smsCapable: false });
    const country = COUNTRY_DB[cc];
    const dialDigits = country.dialCode.replace("+", "");
    const national = phone.startsWith(dialDigits) ? phone.slice(dialDigits.length) : phone;
    const validLength = country.mobileLength.some((l) => national.length === l) || (national.length >= 7 && national.length <= 12);
    const isMobile = country.mobilePattern.test(national);
    const type = isMobile ? "mobile" : "landline";
    return c.json({
      phone: body.phone, e164: `${country.dialCode}${national}`, valid: validLength,
      country: { code: cc, name: country.name, dialCode: country.dialCode },
      numberType: type, smsCapable: isMobile, nationalNumber: national,
    });
  });
}
