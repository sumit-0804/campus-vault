import { Suspense } from "react";
import AuthSkeleton from "./components/AuthSkeleton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      {children}
    </Suspense>
  );
}
