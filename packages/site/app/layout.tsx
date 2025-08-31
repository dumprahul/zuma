import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Zuma",
  description: "Zuma is a event management platform with FHE.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`zama-bg text-foreground antialiased`}>
        <main>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
