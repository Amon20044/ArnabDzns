import { LoginForm } from "@/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;
  const nextPath = Array.isArray(searchParams.next)
    ? searchParams.next[0]
    : searchParams.next;

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-6 px-6 py-12 md:px-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
