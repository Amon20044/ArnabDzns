import {
  generateSeoImage,
  seoImageAlt as alt,
  seoImageContentType as contentType,
  seoImageSize as size,
} from "@/lib/seo-image";

export { alt, contentType, size };

export default function OpenGraphImage() {
  return generateSeoImage();
}
