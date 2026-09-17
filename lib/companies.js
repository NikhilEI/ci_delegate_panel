// Every delegate registration and every visitor registration is mapped to a
// row in `companies` via company_id - this is the single lookup used by both
// creation routes so the same "Acme Pvt Ltd" typed on two different
// registrations resolves to the same company instead of two near-duplicate
// free-text rows.
//
// `run` lets the same logic work both inside a transaction (pass an adapter
// around connection.execute) and outside one (pass lib/db's `query`) - it
// just needs to behave like query(): return the rows array for a SELECT, and
// the ResultSetHeader (with insertId) for an INSERT.
export async function resolveCompanyId(run, { name, address, city, state, country, zipcode, gstNumber }) {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) throw new Error("Company name is required to resolve a company_id");

  const existing = await run(`SELECT id FROM companies WHERE name = ?`, [trimmedName]);
  if (existing[0]) return existing[0].id;

  try {
    const result = await run(
      `INSERT INTO companies (name, address, city, state, country, zipcode, gst_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [trimmedName, address || null, city || null, state || null, country || null, zipcode || null, gstNumber || null]
    );
    return result.insertId;
  } catch (error) {
    // Two concurrent registrations for a brand-new company can both miss the
    // SELECT above and race the INSERT - the loser just re-reads the winner's row.
    if (error?.code === "ER_DUP_ENTRY") {
      const retry = await run(`SELECT id FROM companies WHERE name = ?`, [trimmedName]);
      if (retry[0]) return retry[0].id;
    }
    throw error;
  }
}
