import {
  generateSeoImage,
  seoImageAlt as alt,
  seoImageContentType as contentType,
  seoImageSize as size,
} from "@/lib/seo-image";

export { alt, contentType, size };
export const revalidate = 300;

export default function TwitterImage() {
  return generateSeoImage();
}
