import type { Metadata } from 'next';
import Link from 'next/link';
import Orders from '../orders';

export const metadata: Metadata = {
  title: 'Prepara tu pedido | Casa Hong Kong y Restaurante Hong Kong',
  description: 'Elige una sede, explora la carta con imágenes, selecciona tamaños y prepara tu solicitud por WhatsApp.',
};

export default function OrderPage() {
  return <div className="ordering-page">
    <a className="skip" href="#pedido-app">Saltar a la carta</a>
    <header className="header ordering-header">
      <Link href="/" className="brand" aria-label="Volver al inicio"><span className="seal" aria-hidden="true">HK</span><span>HONG KONG<small>CASA HONG KONG · RESTAURANTE HONG KONG</small></span></Link>
      <Link className="text-link" href="/">← Volver a la página</Link>
    </header>
    <main id="pedido-app"><div className="ordering-intro"><p className="eyebrow">TU MESA, A TU MANERA</p><h1>Un antojo.<br/><em>Muchas posibilidades.</em></h1><p>Elige tu restaurante y arma tu selección a tu ritmo.</p><nav aria-label="Pasos del pedido"><a href="#pedidos">01 · Carta y sede</a><a href="#cart-title">02 · Tu carrito</a><a href="#customer-name">03 · Datos y resumen</a></nav></div><Orders standalone/></main>
    <footer className="ordering-footer"><Link href="/">← Conoce nuestros restaurantes</Link><p>Solicitudes por WhatsApp · El restaurante confirma tu pedido.</p><Link href="/privacidad">Uso de tus datos</Link></footer>
  </div>;
}
