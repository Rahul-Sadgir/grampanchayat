import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { revalidatePath } from "next/cache";
import { uploadFileBuffer } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const villageId = formData.get("villageId") as string | null;
    const villageSlug = formData.get("villageSlug") as string | null;
    const directUrl = formData.get("imageUrl") as string | null;

    let finalImageUrl = directUrl || "";

    if (file && file.size > 0) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "कृपया केवळ JPG, PNG किंवा WEBP स्वरूपातील प्रतिमा निवडा." },
          { status: 400 }
        );
      }

      // Max file size 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "प्रतिमेचा आकार १० MB पेक्षा कमी असावा." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadRes = await uploadFileBuffer(buffer, {
        folder: "banners",
        filename: file.name || "banner.jpg",
        resourceType: "image",
      });

      finalImageUrl = uploadRes.url;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "कोणतीही प्रतिमा किंवा URL सापडली नाही." },
        { status: 400 }
      );
    }

    // Update village in DB if provided
    let updatedVillage = null;
    if (villageId || villageSlug) {
      try {
        await connectDB();
        const query = villageId ? { _id: villageId } : { slug: villageSlug };
        updatedVillage = await Village.findOneAndUpdate(
          query,
          { coverImage: finalImageUrl },
          { new: true }
        ).lean();

        if (updatedVillage) {
          revalidatePath(`/${updatedVillage.slug}`);
          revalidatePath("/admin/villages");
          revalidatePath("/admin/dashboard");
        }
      } catch (dbErr) {
        console.error("DB Update Error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: finalImageUrl,
      village: updatedVillage,
      message: "१६:९ बॅनर प्रतिमा यशस्वीरीत्या सेव्ह झाली!",
    });
  } catch (error: any) {
    console.error("Banner upload error:", error);
    return NextResponse.json(
      { error: error.message || "प्रतिमा अपलोड करताना त्रुटी आली." },
      { status: 500 }
    );
  }
}
