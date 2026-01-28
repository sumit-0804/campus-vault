"use client";
import AuthPortal from "./AuthPortal";

export default function AuthSkeleton() {
  return (
    <AuthPortal>
      <div className="flex flex-col items-center w-full space-y-10 animate-pulse">
        {/* Logo Skeleton */}
        <div className="space-y-4 flex flex-col items-center w-full">
          <div className="h-10 w-3/4 bg-zinc-800 rounded-md" />
          <div className="h-1 w-12 bg-red-900/40" />
        </div>

        {/* Text Skeleton */}
        <div className="space-y-2 w-full">
          <div className="h-4 w-full bg-zinc-900/60 rounded" />
          <div className="h-4 w-2/3 bg-zinc-900/60 rounded mx-auto" />
        </div>

        {/* Button Skeleton */}
        <div className="h-14 w-full bg-zinc-800 rounded-none border border-zinc-700" />

        {/* Footer Skeleton */}
        <div className="pt-4 w-full">
          <div className="h-2 w-1/2 bg-zinc-900/40 mx-auto rounded-full" />
        </div>
      </div>
    </AuthPortal>
  );
}