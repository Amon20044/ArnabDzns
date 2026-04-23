import { ShieldCheckIcon } from "lucide-react";
import { LoginForm } from "@/components/login-form";

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
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheckIcon className="size-4" />
          </div>
          Arnab Admin
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
