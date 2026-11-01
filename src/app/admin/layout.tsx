import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel LAB81" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-carbon text-offwhite">{children}</div>;
}
