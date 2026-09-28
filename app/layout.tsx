import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CursorProvider from "@/components/providers/CursorProvider";
import TransitionProvider from "@/components/providers/TransitionProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Preloader from "@/components/motion/Preloader";
import ScrollProgress from "@/components/motion/ScrollProgress";
import Navbar from "@/components/layout/Navbar";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://nadun417.github.io"),
  title: { default: `${site.name} | ${site.role}`, template: `%s | ${site.name}` },
  description: site.roleLine,
  openGraph: {
    title: `${site.name} | ${site.role}`,
    description: site.roleLine,
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#F1EFE9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* On a repeat visit in this session, hide the curtain before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(sessionStorage.getItem('nm:loaded')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('loaded')}catch(e){}",
          }}
        />
      </head>
      <body className="bg-paper text-ink">
        <SmoothScrollProvider>
          <CursorProvider>
            <TransitionProvider>
              <Preloader />
              {/* on-brand cursor: a dot that becomes a ring over text and a labelled disc over projects */}
              <CustomCursor />
              <Navbar />
              <ScrollProgress />
              {children}
            </TransitionProvider>
          </CursorProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
