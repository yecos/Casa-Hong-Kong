import type { Metadata } from 'next';
import Link from 'next/link';
import AdminLogin from './login';
export const metadata:Metadata={title:'Acceso al panel | Hong Kong'};
export default function LoginPage(){return <main className="section cream admin-login-page"><Link className="text-link" href="/">← Volver al restaurante</Link><p className="eyebrow">ACCESO PRIVADO</p><h1>Tu restaurante,<br/><em>en orden.</em></h1><AdminLogin/></main>;}
