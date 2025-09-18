// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"; // 1. IMPORTE AQUI
import "./globals.css"

export const metadata: Metadata = {
  title: "Casa Nova - Organize suas músicas como um profissional",
  description: "O Trello para músicos. Gerencie seu repertório, organize setlists e colabore com sua banda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 2. Reestruturamos para o "sticky footer" */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Suspense fallback={null}>
                {children}
                <Toaster />
              </Suspense>
              <Analytics />
            </main>
            <Footer /> {/* 3. ADICIONAMOS O RODAPÉ AQUI */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}