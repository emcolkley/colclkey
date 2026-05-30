import { Cinzel, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const fontCinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const fontCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const fontMontserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "Colkley — Transforma tus recuerdos en arte",
  description: "Colkley — Transforma tus recuerdos en arte. Sube tu foto, elige tu diseño y visualízalo en tiempo real. Tu regalo perfecto con calidad de galería y marcos premium.",
  keywords: "cuadros personalizados, marcos de fotos, fotos en roca, regalos personalizados, colkley, tazas personalizadas, cuadros de madera, marcos flotantes, cuadros Ovalle, enmarcado Ovalle",
  authors: [{ name: "Colkley" }],
  metadataBase: new URL("https://empresa-cuadros.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Colkley — Transforma tus recuerdos en arte",
    description: "Sube tu foto, elige tu diseño y visualízalo en tiempo real. Tu regalo perfecto con calidad de galería y terminación artesanal de lujo.",
    url: "https://empresa-cuadros.vercel.app/",
    type: "website",
    images: [
      {
        url: "/cuadro_nordic_frame.png",
        width: 1200,
        height: 630,
        alt: "Colkley Premium Frame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colkley — Transforma tus recuerdos en arte",
    description: "Sube tu foto, elige tu diseño y visualízalo en tiempo real. Tu regalo perfecto con calidad de galería y terminación artesanal de lujo.",
    images: ["/cuadro_nordic_frame.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fontCinzel.variable} ${fontCormorant.variable} ${fontMontserrat.variable}`}>
      <head>
        {/* Fallbacks para asegurar compatibilidad directa con CSS estático */}
        <style dangerouslySetInnerHTML={{__html: `
          body {
            font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          }
          h1, h2, h3, .logo-text, .carrito-titulo, .modal-titulo {
            font-family: var(--font-cinzel), 'Cinzel', serif;
          }
          em, .section-sub, .checkout-sub, .modal-texto {
            font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
