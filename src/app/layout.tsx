import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/nav/Navigation";
import "@/styles/globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lady Bandit Studios",
  description: "A design agency portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-body antialiased">
        <Providers>
          <Navigation />
          <main className="pt-14">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
