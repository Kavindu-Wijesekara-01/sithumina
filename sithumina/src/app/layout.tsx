import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Sinhala, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["italic", "normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sithumina Transport – Sri Lanka Live Lorry Tracking & Logistics",
  description:
    "Track every Sithumina lorry live on the map of Sri Lanka. Find empty lorries near you or book an individual vehicle for your cargo load.",
  keywords: [
    "Sithumina Transport",
    "Sri Lanka lorry transport",
    "live lorry tracking",
    "empty lorries",
    "book lorry Sri Lanka",
    "logistics Sri Lanka",
  ],
  authors: [{ name: "Sithumina Transport" }],
  openGraph: {
    title: "Sithumina Transport – Sri Lanka Live Lorry Tracking",
    description: "Track lorries live island-wide, find empty lorries and book transport.",
    type: "website",
    locale: "si_LK",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFC20E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${notoSinhala.variable} ${playfair.variable}`}
    >
      <body
        suppressHydrationWarning
        className={`${plusJakarta.variable} ${notoSinhala.variable} ${playfair.variable} antialiased bg-[var(--bg)] text-[var(--ink)] min-h-screen flex flex-col`}
      >
        <LanguageProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
