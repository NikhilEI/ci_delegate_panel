import { query, parseJsonColumn } from "./db";

function parseRow(row) {
  return {
    ...row,
    baseFeatures: parseJsonColumn(row.baseFeatures, []),
    moreFeatures: parseJsonColumn(row.moreFeatures, []),
  };
}

export async function getActivePassTypes() {
  const rows = await query(
    `SELECT id, slug, name, price, badge_class AS badgeClass, base_features AS baseFeatures, more_features AS moreFeatures, sort_order AS sortOrder
       FROM pass_types
      WHERE is_active = 1
      ORDER BY sort_order, id`
  );
  return rows.map(parseRow);
}

export async function getPassTypeBySlug(slug) {
  const rows = await query(
    `SELECT id, slug, name, price, badge_class AS badgeClass, base_features AS baseFeatures, more_features AS moreFeatures
       FROM pass_types
      WHERE slug = ? AND is_active = 1
      LIMIT 1`,
    [slug]
  );
  return rows[0] ? parseRow(rows[0]) : null;
}
