import fs from "fs";
import path from "path";

const gulwanchSrc = "C:\\Users\\anura\\.gemini\\antigravity-ide\\brain\\f49f676c-19ac-4d42-84f5-0d0ed09f4b60\\gulwanch_village_hero_1789443118826.jpg";
const mazagaonSrc = "C:\\Users\\anura\\.gemini\\antigravity-ide\\brain\\f49f676c-19ac-4d42-84f5-0d0ed09f4b60\\mazagaon_village_hero_1789443278477.jpg";

const destDir = "d:/gram-panchayat-platform/public/images";
const uploadsDir = "d:/gram-panchayat-platform/public/uploads/banners";

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

fs.copyFileSync(gulwanchSrc, path.join(destDir, "gulwanch-banner.jpg"));
fs.copyFileSync(gulwanchSrc, path.join(destDir, "village-hero-banner.jpg"));
fs.copyFileSync(mazagaonSrc, path.join(destDir, "mazagaon-banner.jpg"));

console.log("Copied 16:9 images successfully!");
