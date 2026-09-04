import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Wilo OS", template: "%s | Wilo OS" },
  description: "Backoffice privado de Wilo Studio.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
