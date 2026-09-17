import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";

// One badge per attendee (each delegate person, and each visitor). The
// prefix + zero-padded row id makes every badge_id unique, stable, and
// traceable back to its DB row without a lookup table.
//
// `color` is only used to recolor the template's footer band per tier -
// visitor's value is sampled directly from public/images/visitor badge.jpeg
// so it matches the real design exactly.
export const BADGE_TIERS = {
  platinum: { prefix: "PLT", label: "PLATINUM DELEGATE", color: "#6f42c1" },
  gold: { prefix: "GLD", label: "GOLD DELEGATE", color: "#c9971f" },
  silver: { prefix: "SLV", label: "SILVER DELEGATE", color: "#69707d" },
  visitor: { prefix: "VIS", label: "VISITOR", color: "#ed0090" },
};

export function tierFromPassName(passName) {
  const name = String(passName || "").toLowerCase();
  if (name.includes("platinum")) return "platinum";
  if (name.includes("gold")) return "gold";
  if (name.includes("silver")) return "silver";
  return null;
}

export function buildBadgeId(tierKey, numericId) {
  const tier = BADGE_TIERS[tierKey];
  if (!tier) throw new Error(`Unknown badge tier: ${tierKey}`);
  return `${tier.prefix}${String(numericId).padStart(6, "0")}`;
}

export function tierKeyFromBadgeId(badgeId) {
  const entry = Object.entries(BADGE_TIERS).find(([, tier]) => badgeId.startsWith(tier.prefix));
  return entry ? entry[0] : null;
}

const BADGES_DIR = path.join(process.cwd(), "public", "badges");
// The client-supplied "delegate_badge.jpeg" is a blank version of the exact
// same layout used for "visitor badge.jpeg" (logos/dates/venue baked in, an
// empty circle, and a footer band) - reused as the base for every tier so we
// only need one clean template instead of reconstructing the artwork.
const TEMPLATE_PATH = path.join(process.cwd(), "public", "images", "delegate_badge.jpeg");

export function badgeImagePublicPath(badgeId) {
  return `/badges/${badgeId}.png`;
}

function badgeImageFilePath(badgeId) {
  return path.join(BADGES_DIR, `${badgeId}.png`);
}

function escapeXml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[ch]));
}

// Wraps text onto multiple <tspan> lines so long company/name values don't
// overflow the badge's fixed-width circle.
function wrapLines(text, maxChars) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

// Geometry measured directly from the 1066x1353 template via pixel-scanning
// (see the empty circle and footer band in public/images/delegate_badge.jpeg)
// - keep these in sync if the template image is ever replaced.
const TEMPLATE_WIDTH = 1066;
const TEMPLATE_HEIGHT = 1353;
const CIRCLE_CX = 534;
const CIRCLE_CY = 774;
const CIRCLE_R = 412;
const FOOTER_TOP = 1214;
const FOOTER_HEIGHT = TEMPLATE_HEIGHT - FOOTER_TOP;

/**
 * Renders a badge PNG for one attendee on top of the real event badge
 * template and saves it under public/badges/. Returns { badgeId,
 * publicPath, checkinUrl }.
 */
export async function generateBadge({ tierKey, numericId, name, company, roleLabel, siteOrigin }) {
  const tier = BADGE_TIERS[tierKey];
  if (!tier) throw new Error(`Unknown badge tier: ${tierKey}`);

  const badgeId = buildBadgeId(tierKey, numericId);
  const checkinUrl = `${siteOrigin}/admin/checkin/${badgeId}`;

  const qrBuffer = await QRCode.toBuffer(checkinUrl, { errorCorrectionLevel: "M", margin: 1, width: 620, color: { dark: "#000000", light: "#ffffff" } });
  const qrDataUri = `data:image/png;base64,${qrBuffer.toString("base64")}`;

  const qrSize = 300;
  const qrX = CIRCLE_CX - qrSize / 2;
  const qrY = CIRCLE_CY - CIRCLE_R + 95;

  const nameLines = wrapLines(name, 22);
  const companyLines = wrapLines(company, 28);

  const nameY = qrY + qrSize + 85;
  const nameBlock = nameLines
    .map((line, i) => `<tspan x="${CIRCLE_CX}" dy="${i === 0 ? 0 : 44}">${escapeXml(line.toUpperCase())}</tspan>`)
    .join("");
  const companyStartY = nameY + nameLines.length * 44 + 42;
  const companyBlock = companyLines
    .map((line, i) => `<tspan x="${CIRCLE_CX}" dy="${i === 0 ? 0 : 32}">${escapeXml(line)}</tspan>`)
    .join("");
  const idY = companyStartY + companyLines.length * 32 + 44;

  // Overlay drawn on a transparent canvas the same size as the template,
  // then flattened onto it with sharp - the footer rect fully repaints the
  // template's placeholder band, and the circle fill repaints its empty grey.
  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TEMPLATE_WIDTH}" height="${TEMPLATE_HEIGHT}" viewBox="0 0 ${TEMPLATE_WIDTH} ${TEMPLATE_HEIGHT}">
    <defs>
      <clipPath id="circleClip"><circle cx="${CIRCLE_CX}" cy="${CIRCLE_CY}" r="${CIRCLE_R}"/></clipPath>
    </defs>

    <circle cx="${CIRCLE_CX}" cy="${CIRCLE_CY}" r="${CIRCLE_R}" fill="#e7e7ec"/>
    <g clip-path="url(#circleClip)">
      <rect x="${qrX - 12}" y="${qrY - 12}" width="${qrSize + 24}" height="${qrSize + 24}" fill="#ffffff"/>
      <image href="${qrDataUri}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>

      <text x="${CIRCLE_CX}" y="${nameY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#161616">${nameBlock}</text>
      <text x="${CIRCLE_CX}" y="${companyStartY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#3a3a3a">${companyBlock}</text>
      <text x="${CIRCLE_CX}" y="${idY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#161616">ID: ${escapeXml(badgeId)}</text>
    </g>

    <rect x="0" y="${FOOTER_TOP}" width="${TEMPLATE_WIDTH}" height="${FOOTER_HEIGHT}" fill="${tier.color}"/>
    <text x="${CIRCLE_CX}" y="${FOOTER_TOP + FOOTER_HEIGHT / 2 + 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="50" font-weight="800" fill="#ffffff">${escapeXml(roleLabel || tier.label)}</text>
  </svg>`;

  const png = await sharp(TEMPLATE_PATH)
    .resize(TEMPLATE_WIDTH, TEMPLATE_HEIGHT)
    .composite([{ input: Buffer.from(overlaySvg) }])
    .png()
    .toBuffer();

  await fs.mkdir(BADGES_DIR, { recursive: true });
  await fs.writeFile(badgeImageFilePath(badgeId), png);

  return { badgeId, publicPath: badgeImagePublicPath(badgeId), checkinUrl };
}
