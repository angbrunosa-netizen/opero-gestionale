import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Opero Cloud",
    description: "Piattaforma E-commerce Multi-Tenant",
};

export default function RootLayout({ children }) {
    return (
        <html lang="it" suppressHydrationWarning={true}>
            <head>
                <Script
                    id="dynamic-favicon"
                    strategy="beforeInteractive"
                >{`
                    (function() {
                        const hostname = window.location.hostname;
                        const rootDomain = 'operocloud.it';

                        // Verifica se siamo in un sottodominio
                        if (hostname.includes('.' + rootDomain) && hostname !== rootDomain) {
                            const subdomain = hostname.replace('.' + rootDomain, '');
                            const faviconUrl = '/api/favicon?site=' + subdomain;

                            // Crea/aggiorna link favicon
                            let link = document.querySelector("link[rel*='icon']");
                            if (!link) {
                                link = document.createElement('link');
                                link.rel = 'icon';
                                document.head.appendChild(link);
                            }
                            link.href = faviconUrl;
                        }
                    })();
                `}</Script>
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning={true}
            >
                {children}
            </body>
        </html>
    );
}
