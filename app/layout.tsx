import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "./ThemeProvider";

export const metadata: Metadata = {
  title: "VTEX Schema Builder - Construtor de Schemas",
  description: "Ferramenta para criar schemas JSON para componentes customizados da VTEX IO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col justify-between bg-background text-foreground"
      >
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
