import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BASE_CITIZEN_DOCS_DIR = path.resolve(process.cwd(), "public", "documents", "citizen-services");
const SRC_CITIZEN_DOCS_DIR = path.resolve(process.cwd(), "src", "data", "citizen-services");

const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);

/**
 * Strict path traversal check: ensures target file is strictly inside parent directory.
 * Defends against CWE-22 (Improper Limitation of a Pathname to a Restricted Directory).
 */
function isStrictlyInside(filePath: string, parentDir: string): boolean {
  const resolvedTarget = path.resolve(filePath);
  const resolvedParent = path.resolve(parentDir);
  const rel = path.relative(resolvedParent, resolvedTarget);
  return Boolean(rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return new NextResponse("Document path required", { status: 400 });
    }

    // Reject suspicious path traversal attempts immediately
    for (const part of slug) {
      const decoded = decodeURIComponent(part);
      if (
        decoded.includes("..") ||
        decoded.includes("/") ||
        decoded.includes("\\") ||
        decoded.includes("\0")
      ) {
        return new NextResponse("Forbidden: Invalid path sequence detected", { status: 403 });
      }
    }

    // Decode and assemble relative path
    const decodedParts = slug.map((p) => path.basename(decodeURIComponent(p)));
    const relativePath = path.join(...decodedParts);

    // Resolve candidates
    const targetInPublic = path.resolve(BASE_CITIZEN_DOCS_DIR, relativePath);
    const targetInSrc = path.resolve(SRC_CITIZEN_DOCS_DIR, relativePath);

    let filePath: string | null = null;

    if (
      isStrictlyInside(targetInPublic, BASE_CITIZEN_DOCS_DIR) &&
      fs.existsSync(targetInPublic) &&
      fs.statSync(targetInPublic).isFile()
    ) {
      filePath = targetInPublic;
    } else if (
      isStrictlyInside(targetInSrc, SRC_CITIZEN_DOCS_DIR) &&
      fs.existsSync(targetInSrc) &&
      fs.statSync(targetInSrc).isFile()
    ) {
      filePath = targetInSrc;
    }

    if (!filePath) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Verify allowed file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return new NextResponse("Forbidden file type", { status: 403 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const searchParams = request.nextUrl.searchParams;
    const isDownload =
      searchParams.get("download") === "true" || searchParams.get("download") === "1";

    const contentType =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

    const disposition = isDownload
      ? `attachment; filename="${encodeURIComponent(fileName)}"`
      : `inline; filename="${encodeURIComponent(fileName)}"`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error serving document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
