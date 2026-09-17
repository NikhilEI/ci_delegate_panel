import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getAdminSession } from "@/lib/getAdminSession";
import { ALL_MODULE_KEYS } from "@/lib/permissions";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const targetId = Number(id);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body?.name || "").trim();
  const role = body?.role || "custom";
  const permissions = Array.isArray(body?.permissions) ? body.permissions.filter((key) => ALL_MODULE_KEYS.includes(key)) : [];
  const password = body?.password || "";

  if (!name || name.length < 2) return Response.json({ success: false, message: "Enter the admin's name." }, { status: 400 });
  if (password && password.length < 8) return Response.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });

  try {
    if (role !== "super_admin") {
      const [{ superAdminCount }] = await query(`SELECT COUNT(*) AS superAdminCount FROM admins WHERE role = 'super_admin' AND id <> ?`, [targetId]);
      const [current] = await query(`SELECT role FROM admins WHERE id = ?`, [targetId]);
      if (current?.role === "super_admin" && superAdminCount === 0) {
        return Response.json({ success: false, message: "At least one Super Admin must remain." }, { status: 400 });
      }
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await query(`UPDATE admins SET name = ?, role = ?, permissions = ?, password_hash = ? WHERE id = ?`, [name, role, JSON.stringify(permissions), passwordHash, targetId]);
    } else {
      await query(`UPDATE admins SET name = ?, role = ?, permissions = ? WHERE id = ?`, [name, role, JSON.stringify(permissions), targetId]);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("admin user update failed:", error);
    return Response.json({ success: false, message: "Could not update admin user." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const targetId = Number(id);

  const session = await getAdminSession();
  if (session?.sub === targetId) {
    return Response.json({ success: false, message: "You can't delete your own account." }, { status: 400 });
  }

  try {
    const [target] = await query(`SELECT role FROM admins WHERE id = ?`, [targetId]);
    if (!target) return Response.json({ success: false, message: "Admin not found." }, { status: 404 });

    if (target.role === "super_admin") {
      const [{ superAdminCount }] = await query(`SELECT COUNT(*) AS superAdminCount FROM admins WHERE role = 'super_admin' AND id <> ?`, [targetId]);
      if (superAdminCount === 0) {
        return Response.json({ success: false, message: "At least one Super Admin must remain." }, { status: 400 });
      }
    }

    await query(`DELETE FROM admins WHERE id = ?`, [targetId]);
    return Response.json({ success: true });
  } catch (error) {
    console.error("admin user delete failed:", error);
    return Response.json({ success: false, message: "Could not delete admin user." }, { status: 500 });
  }
}
