import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "sequence-game",
  description: "จับรูปแบบให้ได้ แล้วเติมตัวเลขที่หายไป",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
