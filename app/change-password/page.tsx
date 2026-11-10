import { PasswordChangePanel } from "@/components/admin/password-change-panel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change password",
  robots: { index: false, follow: false },
};

export default function ChangePasswordPage() {
  return <PasswordChangePanel />;
}
