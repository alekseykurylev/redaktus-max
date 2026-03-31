import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { MaxBridgeProvider, MaxBridgeScript } from "@/lib/max-bridge-gpt"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["cyrillic"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["cyrillic"],
})

export const metadata: Metadata = {
  title: "Redaktus",
  description: "",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MaxBridgeScript />
        <MaxBridgeProvider autoReady />
        {children}
      </body>
    </html>
  )
}
