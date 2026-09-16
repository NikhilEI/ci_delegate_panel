import { query } from "@/lib/db";

const emailPattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

function badRequest(message) {
  return Response.json({ success: false, message }, { status: 400 });
}

function validatePayload(body) {
  const required = ["title", "firstName", "lastName", "organisation", "designation", "country", "countryCode", "state", "city", "mobile", "email", "objective"];
  for (const field of required) {
    if (!body?.[field] || String(body[field]).trim() === "") return `${field} is required`;
  }
  if (!emailPattern.test(body.email)) return "Enter a valid email address.";
  if (!/^[0-9]{6,15}$/.test(body.mobile)) return "Enter a valid mobile number.";
  if (!body.termsAccepted) return "Terms and Conditions must be accepted";
  if (!body.interests || !Object.values(body.interests).some(Boolean)) return "Select at least one product interest.";
  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const validationError = validatePayload(body);
  if (validationError) return badRequest(validationError);

  const email = body.email.trim();
  const mobile = body.mobile.trim();

  try {
    const verifiedOtp = await query(
      `SELECT id FROM visitor_otp_requests
        WHERE email = ? AND mobile = ? AND verified = 1
        ORDER BY id DESC LIMIT 1`,
      [email, mobile]
    );
    if (verifiedOtp.length === 0) {
      return badRequest("Please verify your OTP before submitting.");
    }

    const result = await query(
      `INSERT INTO visitor_registrations
        (title, first_name, last_name, organisation, designation, department, country, country_code, state, city, mobile, email, objective_of_visit, product_interests, terms_accepted, marketing_consent, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)`,
      [
        body.title,
        body.firstName.trim(),
        body.lastName.trim(),
        body.organisation.trim(),
        body.designation === "Other" ? body.designationOther?.trim() || "Other" : body.designation,
        body.department?.trim() || null,
        body.country,
        body.countryCode,
        body.state,
        body.city,
        mobile,
        email,
        body.objective,
        JSON.stringify(body.interests),
        body.marketingConsent ? 1 : 0,
      ]
    );

    return Response.json({ success: true, id: result.insertId });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return Response.json({ success: false, message: "This email or mobile number is already registered." }, { status: 409 });
    }
    console.error("visitor-registrations POST failed:", error);
    return Response.json({ success: false, message: "Could not save registration. Please try again." }, { status: 500 });
  }
}
