export const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard/content";

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.startsWith("/api/")) {
    return fallback;
  }

  if (trimmed === "/login" || trimmed.startsWith("/login?")) {
    return fallback;
  }

  return trimmed;
}
