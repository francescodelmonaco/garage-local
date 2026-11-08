import type { Metadata } from "next"
import { Geist_Mono, Manrope } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = { title: "Garage", description: "Libretto digitale di auto e moto" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="it" className={`dark ${manrope.variable} ${geistMono.variable}`}>
            <body className="min-h-dvh font-sans"><Providers>{children}</Providers></body>
        </html>
    )
}
