/**
 * Cloudflare Pages Function: POST /api/lead
 * Uses GOOGLE_APPS_SCRIPT_URL and LEAD_SHARED_SECRET from Cloudflare secrets.

 */
const reply = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

export async function onRequestPost({ request, env }) {
  if (!env.GOOGLE_APPS_SCRIPT_URL || !env.LEAD_SHARED_SECRET) {
    return reply({ success: false, message: "Lead form is not configured yet" }, 503);
  }

  // Blocks cross-site browser submissions; add Turnstile/WAF for stronger spam protection.
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return reply({ success: false, message: "Invalid request origin" }, 403);
  }
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) {
    return reply({ success: false, message: "Expected JSON" }, 415);
  }

  let data;
  try {
    const raw = await request.text();
    if (raw.length > 6000) return reply({ success: false, message: "Request too large" }, 413);
    data = JSON.parse(raw);
  } catch {
    return reply({ success: false, message: "Invalid request data" }, 400);
  }

  const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
  const fullName = clean(data.fullName, 100);
  // Phone is the national number; store country code separately as well.
  const phone = clean(data.phone, 25);
  const phoneCountryCode = clean(data.phoneCountryCode, 5);
  const residenceCountry = clean(data.residenceCountry, 80);
  const preferredCallTime = clean(data.preferredCallTime, 10);
  const profession = clean(data.profession, 100);
  const email = clean(data.email, 150);
  const interest = clean(data.interest, 60);
  const message = clean(data.message, 1000);
  const submissionId = clean(data.submissionId, 90);
  const allPhoneDigits = ((phoneCountryCode + phone).match(/[0-9]/g) || []).length;
  const preferredTimeValid = !preferredCallTime ||
    /^(?:0[1-9]|1[0-2]):(?:00|30) (?:AM|PM)$/.test(preferredCallTime);

  if (clean(data.website, 100)) return reply({ success: false, message: "Invalid submission" }, 400);
  if (
    data.consent !== true || fullName.length < 2 ||
    !/^\+[1-9][0-9]{0,3}$/.test(phoneCountryCode) ||
    !/^[0-9()\-.\s]+$/.test(phone) ||
    allPhoneDigits < 7 || allPhoneDigits > 15 ||
    !preferredTimeValid ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[a-zA-Z0-9_-]{8,90}$/.test(submissionId) ||
    (interest && ![
      "Exploring Amazon FBA", "Planning to start",
      "Already selling on Amazon", "Looking for MPS support"
    ].includes(interest))
  ) {
    return reply({ success: false, message: "Please check your details and try again" }, 400);
  }

  let endpoint;
  try {
    endpoint = new URL(env.GOOGLE_APPS_SCRIPT_URL);
    if (endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com") {
      throw new Error("Invalid Apps Script URL");
    }
  } catch {
    return reply({ success: false, message: "Form integration configuration error" }, 503);
  }

  const fullPhone = phoneCountryCode + " " + phone;
  const params = new URLSearchParams({
    token: env.LEAD_SHARED_SECRET,
    submissionId, fullName, phone: fullPhone, phoneCountryCode,
    residenceCountry, preferredCallTime,
    email, interest, message,
    consent: "true"
  });

  try {
    const upstream = await fetch(endpoint.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString(),
      redirect: "follow"
    });
    if (!upstream.ok) throw new Error("Spreadsheet service HTTP " + upstream.status);

    const result = await upstream.json();
    if (result.success !== true) throw new Error("Spreadsheet did not confirm save");

    return reply({ success: true });
  } catch (error) {
    console.error("Area71 spreadsheet webhook error:", error);
    return reply({ success: false, message: "Unable to save request right now" }, 502);
  }
}
