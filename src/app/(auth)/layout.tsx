import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-muted/30">
      {children}
    </main>
  );
}

