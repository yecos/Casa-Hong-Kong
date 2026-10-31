import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Casa Hong Kong & Restaurante Hong Kong | Medellín', description: 'Dos restaurantes de una misma familia en Medellín. Descubre Casa Hong Kong y Restaurante Hong Kong, encuentra tu sede y consulta tu domicilio.', robots: { index: false, follow: false }, openGraph: { title: 'Dos nombres. Una mesa en familia.', description: 'Casa Hong Kong y Restaurante Hong Kong en Medellín.', locale: 'es_CO', type: 'website' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body className="antialiased selection:bg-red-900 selection:text-white">{children}</body></html>; }
