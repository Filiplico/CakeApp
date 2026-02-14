import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Renes Cakes",
  description: "Custom cakes for birthdays, weddings & celebrations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <Link href="/" className="site-title">Renes Cakes</Link>
            <nav className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/cakes">Cakes</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
        </header>
        <main className="main-wrap">{children}</main>
      </body>
    </html>
  );
}
