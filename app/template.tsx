import { ViewTransition } from "react";

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransition
      enter="route-transition"
      exit="route-transition"
      update="route-transition"
    >
      <div className="page-stage flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
