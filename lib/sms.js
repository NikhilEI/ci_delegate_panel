const SEND2DIGITAL_API_URL = "https://api.send2.digital/devdesk/send";

export function smsGatewayConfigured() {
  return Boolean(process.env.SEND2DIGITAL_USER && process.env.SEND2DIGITAL_PASSWORD);
}

// `number` should already include the country code as plain digits, no "+"
// (e.g. "919876543210") - a leading "+" gets rejected with error 111
// "Invalid number". Callers build this from the form's separate
// country-code + local-number fields before calling this.
export async function sendOtpSms(number, code) {
  const res = await fetch(SEND2DIGITAL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: process.env.SEND2DIGITAL_USER,
      password: process.env.SEND2DIGITAL_PASSWORD,
      template_name: process.env.SEND2DIGITAL_TEMPLATE || "otp_web",
      number,
      media_type: "none",
      variable: code,
    }),
  });

  // Bulk-SMS gateways (this one included, going by the response we've seen)
  // routinely return HTTP 200 even when the send itself failed - the real
  // outcome is only in the body. Log it every time so failures are visible
  // in the server console instead of silently reporting "success".
  const rawText = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = null;
  }
  console.log(`[sms] send2.digital response (http ${res.status}) for ${number}:`, parsed ?? rawText);

  if (!res.ok) throw new Error(`SMS gateway responded ${res.status}: ${rawText}`);

  // No confirmed schema for this gateway's success/error shape yet - flag
  // the common failure markers various providers use, so a soft failure
  // (200 OK, but the body says otherwise) still surfaces as an error
  // instead of a false "sent" response.
  if (parsed && typeof parsed === "object") {
    const status = String(parsed.status ?? parsed.Status ?? "").toLowerCase();
    const hasErrorField = parsed.error || parsed.Error || parsed.errors;
    if (parsed.success === false || status === "error" || status === "fail" || status === "failed" || hasErrorField) {
      throw new Error(`SMS gateway rejected the request: ${rawText}`);
    }
  }

  return parsed ?? {};
}
