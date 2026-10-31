import Link from 'next/link';
import type { Metadata } from 'next';
import Tracking from './tracking';
export const metadata:Metadata={title:'Estado de tu solicitud | Hong Kong',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function TrackingPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{token?:string}>}){
 const {id}=await params;const {token}=await searchParams;
 return <main className="section cream tracking-page"><Link href="/pedidos" className="text-link">← Volver a la carta</Link><p className="eyebrow">TU SOLICITUD</p><h1>De nuestra cocina<br/><em>a tu mesa.</em></h1><Tracking id={id} token={token||''}/></main>;
}
