export function shouldHideSiteChrome(pathname: string | null | undefined) {
  if (!pathname) {
    return false;
  }

  return (
    pathname === "/login" ||
    pathname === "/change-password" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  );
}
