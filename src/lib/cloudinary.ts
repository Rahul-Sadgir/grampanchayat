import fs from "fs/promises";
import path from "path";

// Only configure Cloudinary if USE_CLOUDINARY is explicitly true
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

export const isCloudinaryConfigured = Boolean(
  process.env.USE_CLOUDINARY !== "false" &&
  (cloudinaryUrl || (cloudName && apiKey && apiSecret))
);

export interface CloudinaryUploadOptions {
  folder: string;
  filename?: string;
  resourceType?: "auto" | "raw" | "image" | "video";
}

export interface UploadResult {
  url: string;
  publicId?: string;
  bytes?: number;
  format?: string;
  isCloudinary: boolean;
}

/**
 * Uploads a file buffer directly to local storage (or Cloudinary if USE_CLOUDINARY=true).
 */
export async function uploadFileBuffer(
  fileBuffer: Buffer,
  options: CloudinaryUploadOptions
): Promise<UploadResult> {
  const { folder, filename = "file", resourceType = "auto" } = options;

  if (isCloudinaryConfigured) {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      if (cloudinaryUrl) {
        cloudinary.config({ cloudinary_url: cloudinaryUrl, secure: true });
      } else {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });
      }

      const sanitizedName = filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      const publicId = `${sanitizedName}_${Date.now()}`;

      const uploadPromise = new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `gram-panchayat/${folder}`,
            public_id: publicId,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed with empty result."));
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(fileBuffer);
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Cloudinary upload timeout")), 15000)
      );

      const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
        isCloudinary: true,
      };
    } catch (err) {
      console.warn("[Cloudinary] Upload failed, falling back to local storage:", err);
    }
  }

  // Fast, bulletproof local disk storage in public/uploads/...
  const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const localRelativeDir = path.join("uploads", folder);
  const localTargetDir = path.join(process.cwd(), "public", localRelativeDir);

  await fs.mkdir(localTargetDir, { recursive: true });
  const localFilePath = path.join(localTargetDir, safeFilename);
  await fs.writeFile(localFilePath, fileBuffer);

  const localUrl = `/${localRelativeDir.replace(/\\/g, "/")}/${safeFilename}`;

  return {
    url: localUrl,
    bytes: fileBuffer.length,
    isCloudinary: false,
  };
}
