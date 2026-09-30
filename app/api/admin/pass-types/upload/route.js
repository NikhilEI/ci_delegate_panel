import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".ico"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ success: false, message: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const originalName = file.name || "icon.png";
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return Response.json(
        { success: false, message: "Invalid file type. Only PNG, JPG, JPEG, SVG, WEBP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 30);
    const filename = `pass_icon_${Date.now()}_${safeBase}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "pass-icons");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/pass-icons/${filename}`;
    return Response.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Pass icon upload failed:", error);
    return Response.json({ success: false, message: "Failed to upload icon" }, { status: 500 });
  }
}
