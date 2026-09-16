import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BASE_CITIZEN_DOCS_DIR = path.join(process.cwd(), "public", "documents", "citizen-services");
const SRC_CITIZEN_DOCS_DIR = path.join(process.cwd(), "src", "data", "citizen-services");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return new NextResponse("Document path required", { status: 400 });
    }

    // Decode URL components safely
    const decodedSlugParts = slug.map((part) => decodeURIComponent(part));
    const relativePath = path.join(...decodedSlugParts);

    // Strictly check inside scoped directories
    const targetInPublic = path.join(BASE_CITIZEN_DOCS_DIR, relativePath);
    const targetInSrc = path.join(SRC_CITIZEN_DOCS_DIR, relativePath);

    let filePath: string | null = null;
    if (fs.existsSync(targetInPublic) && fs.statSync(targetInPublic).isFile()) {
      filePath = targetInPublic;
    } else if (fs.existsSync(targetInSrc) && fs.statSync(targetInSrc).isFile()) {
      filePath = targetInSrc;
    }

    if (!filePath) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const searchParams = request.nextUrl.searchParams;
    const isDownload = searchParams.get("download") === "true" || searchParams.get("download") === "1";

    const disposition = isDownload
      ? `attachment; filename="${encodeURIComponent(fileName)}"`
      : `inline; filename="${encodeURIComponent(fileName)}"`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error serving document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
