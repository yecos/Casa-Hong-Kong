'use client';

import { useState } from 'react';

const dishes = [
  { id: 'arroz', name: 'Arroz al wok', category: 'Arroces', description: 'Arroz salteado con vegetales. Composición de ejemplo.', price: 24000 },
  { id: 'familiar', name: 'Arroz para compartir', category: 'Arroces', description: 'Una opción de tamaño familiar para esta demostración.', price: 42000 },
  { id: 'chop', name: 'Vegetales al wok', category: 'Especialidades', description: 'Vegetales salteados. Receta e ingredientes por confirmar.', price: 26000 },
  { id: 'rollos', name: 'Rollitos primavera', category: 'Entradas', description: 'Porción de ejemplo. Cantidad e ingredientes por confirmar.', price: 12000 },
];
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const branches = { casa: 'Casa Hong Kong', restaurante: 'Restaurante Hong Kong' };
export default function Orders() {
  const [branch, setBranch] = useState<keyof typeof branches>('casa');
  const [category, setCategory] = useState('Todos');
  const [carts, setCarts] = useState<Record<keyof typeof branches, Record<string, number>>>({ casa: {}, restaurante: {} });
  const cart = carts[branch];
  const [search, setSearch] = useState('');
  const visibleDishes = dishes.filter(d => (category === 'Todos' || d.category === category) && d.name.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')));
  function setCart(update: (previous: Record<string, number>) => Record<string, number>) {
    setCarts(previous => ({ ...previous, [branch]: update(previous[branch]) }));
  }
  const [method, setMethod] = useState('recoger');
  const [review, setReview] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', neighborhood: '' });
  function updateCustomer(field: keyof typeof customer, value: string) {
    setCustomer(previous => ({ ...previous, [field]: value }));
    setReview(false);
    setStatus('');
  }
  const items = dishes.filter(d => cart[d.id] > 0);
  const count = items.reduce((sum, d) => sum + cart[d.id], 0);
  const subtotal = items.reduce((sum, d) => sum + cart[d.id] * d.price, 0);
  function change(id: string, delta: number) {
    setCart(previous => ({ ...previous, [id]: Math.min(20, Math.max(0, (previous[id] || 0) + delta)) }));
    setStatus('');
    setReview(false);
  }
  const summary = ['BORRADOR DE EJEMPLO · NO ES UN PEDIDO ENVIADO', branches[branch], method === 'recoger' ? 'Recoger en sede' : 'Domicilio (cobertura por confirmar)', `Nombre: ${customer.name.trim()}`, `Teléfono: ${customer.phone.trim()}`, ...(method === 'domicilio' ? [`Dirección: ${customer.address.trim()}`, `Barrio: ${customer.neighborhood.trim()}`] : []), ...items.map(d => `${cart[d.id]} × ${d.name}: ${money(d.price * cart[d.id])}`), `Subtotal ilustrativo: ${money(subtotal)}`, 'Envío: por confirmar. Total final no confirmado.', notes ? `Observaciones: ${notes}` : '', 'Productos, precios y disponibilidad de demostración.'].filter(Boolean).join('\n');
  function download() {
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `borrador-${branch}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Resumen descargado. No se ha enviado ningún pedido.');
  }
  return <section id="pedidos" className="section cream orders" aria-labelledby="orders-title">
    <div className="section-heading"><div><p className="eyebrow">04 / TU PEDIDO</p><h2 id="orders-title">Elige tus sabores.<br/><em>Arma tu mesa.</em></h2></div><p>Selecciona una sede, explora la carta<br/>y prepara tu pedido en un solo lugar.</p></div>
    <p className="order-notice"><strong>Modo demostración.</strong> Productos y precios de ejemplo, sin carta confirmada. Puedes probar el carrito y descargar un borrador; todavía no se reciben pedidos ni pagos.</p>
    <fieldset className="branch-picker"><legend>1. Elige tu restaurante</legend>{Object.entries(branches).map(([id, name]) => <label key={id} className={branch === id ? 'selected' : ''}><input type="radio" name="branch" value={id} checked={branch === id} onChange={() => { setBranch(id as keyof typeof branches); setReview(false); setStatus(''); }}/><span><strong>{name}</strong><small>{id === 'casa' ? 'Av. 80 #52-60' : 'Av. 80 #48-75'} · Medellín</small></span></label>)}</fieldset>
    <div className="order-layout"><div><label className="dish-search" htmlFor="dish-search">Busca tu próximo favorito<input id="dish-search" type="search" placeholder="Buscar un plato…" value={search} onChange={e => setSearch(e.target.value)} /></label><div className="order-categories" role="group" aria-label="Filtrar platos por categoría">{['Todos', 'Arroces', 'Especialidades', 'Entradas'].map(c => <button type="button" aria-pressed={category === c} key={c} onClick={() => setCategory(c)}>{c}</button>)}</div><p className="order-menu-note">Carta ilustrativa para {branches[branch]} · Precios de ejemplo en COP</p><p className="search-count" role="status">{visibleDishes.length} {visibleDishes.length === 1 ? 'plato encontrado' : 'platos encontrados'}</p>{visibleDishes.length === 0 && <div className="menu-empty"><h3>No encontramos ese plato</h3><p>Prueba con otro nombre o vuelve a ver toda la carta.</p><button type="button" className="text-link" onClick={() => { setSearch(''); setCategory('Todos'); }}>Mostrar todos los platos</button></div>}<div className="order-products">{visibleDishes.map(d => <article className="order-product" key={d.id}><span className="eyebrow">{d.category}</span><h3>{d.name}</h3><p>{d.description}</p><div><strong>{money(d.price)}</strong><button type="button" className="button" disabled={(cart[d.id] || 0) >= 20} onClick={() => change(d.id, 1)} aria-label={`Agregar ${d.name}`}>Agregar +</button></div></article>)}</div></div>
    <aside className="order-cart" aria-labelledby="cart-title"><form onSubmit={event => { event.preventDefault(); if (count) { setReview(true); setStatus('Revisa tu borrador. Todavía no se ha enviado.'); } }}><div className="cart-heading"><h3 id="cart-title">Tu mesa</h3><span aria-live="polite">{count} {count === 1 ? 'plato' : 'platos'}</span></div><p className="cart-branch">{branches[branch]}</p>{count > 0 && <button type="button" className="clear-cart" onClick={() => { setCart(() => ({})); setReview(false); setStatus('Carrito de esta sede vaciado.'); }}>Vaciar carrito de esta sede</button>}{!count ? <p className="empty-cart">Tu carrito está esperando.<br/>Agrega un plato para comenzar.</p> : <ul className="cart-items">{items.map(d => <li key={d.id}><div><strong>{d.name}</strong><span>{money(d.price * cart[d.id])}</span></div><div className="quantity"><button type="button" onClick={() => change(d.id, -1)} aria-label={`Quitar una unidad de ${d.name}`}>−</button><span aria-label={`Cantidad de ${d.name}`}>{cart[d.id]}</span><button type="button" disabled={cart[d.id] >= 20} onClick={() => change(d.id, 1)} aria-label={`Añadir una unidad de ${d.name}`}>+</button><button type="button" className="remove-item" onClick={() => { setCart(p => ({ ...p, [d.id]: 0 })); setReview(false); setStatus(''); }} aria-label={`Eliminar ${d.name}`}>Eliminar</button></div></li>)}</ul>}
    <fieldset className="delivery-method"><legend>2. ¿Cómo lo prefieres?</legend><label><input type="radio" name="method" checked={method === 'recoger'} onChange={() => { setMethod('recoger'); setReview(false); }}/> Recoger en sede</label><label><input type="radio" name="method" checked={method === 'domicilio'} onChange={() => { setMethod('domicilio'); setReview(false); }}/> Domicilio</label></fieldset>{method === 'domicilio' && <p className="order-menu-note">Cobertura, tarifa y tiempo de entrega por confirmar con la sede.</p>}
    <fieldset className="customer-fields"><legend>3. Tus datos de contacto</legend><p>Para probar, usa datos ficticios. Se mantienen solo en esta pestaña; el resumen descargado los incluirá.</p><label htmlFor="customer-name">Nombre<input id="customer-name" name="customerName" autoComplete="off" required minLength={2} maxLength={80} value={customer.name} pattern=".*\S.*" onChange={e => updateCustomer('name', e.target.value)} placeholder="Ej.: Cliente de prueba"/></label><label htmlFor="customer-phone">Celular colombiano<input id="customer-phone" name="customerPhone" type="tel" inputMode="numeric" autoComplete="off" required pattern="3[0-9]{9}" maxLength={10} title="Ingresa 10 dígitos, comenzando por 3, sin espacios ni prefijo." value={customer.phone} onChange={e => updateCustomer('phone', e.target.value)} placeholder="Ej.: 3000000000"/><small>10 dígitos, sin espacios ni +57.</small></label>{method === 'domicilio' && <><label htmlFor="customer-address">Dirección de entrega<input id="customer-address" name="customerAddress" autoComplete="off" required minLength={5} maxLength={160} pattern=".*\S.*" value={customer.address} onChange={e => updateCustomer('address', e.target.value)} placeholder="Ej.: Calle de prueba #10-20, apto. 101"/></label><label htmlFor="customer-neighborhood">Barrio<input id="customer-neighborhood" name="customerNeighborhood" autoComplete="off" required minLength={2} maxLength={80} pattern=".*\S.*" value={customer.neighborhood} onChange={e => updateCustomer('neighborhood', e.target.value)} placeholder="Ej.: Barrio de prueba"/></label></>}</fieldset>
    <label className="order-notes" htmlFor="order-notes">Observaciones opcionales<textarea id="order-notes" maxLength={300} value={notes} onChange={e => { setNotes(e.target.value); setReview(false); setStatus(''); }} placeholder="Ej.: consultar una modificación del plato"/><small>No incluyas datos personales en esta demostración.</small></label><div className="order-totals"><div><span>Subtotal de ejemplo</span><strong aria-live="polite">{money(subtotal)}</strong></div><div><span>{method === 'domicilio' ? 'Costo de envío' : 'Disponibilidad de recogida'}</span><span>Por confirmar</span></div></div><button type="submit" className="button order-review" disabled={!count}>Revisar borrador <span aria-hidden="true">↗</span></button>
    {review && count > 0 && <div className="order-summary" role="region" aria-label="Resumen del borrador"><h4>Revisa tu borrador</h4><button type="button" className="edit-order" onClick={() => { setReview(false); document.getElementById('customer-name')?.focus(); }}>Editar datos ↑</button><pre>{summary}</pre><button className="button" type="button" onClick={download}>Descargar resumen ↓</button><p>El envío al restaurante se habilitará cuando estén confirmados la carta y el canal de pedidos.</p></div>}<p className="order-status" role="status">{status}</p><p className="order-menu-note">Cada sede conserva su propio carrito de ejemplo. El carrito y los datos se reinician al recargar la página.</p></form></aside></div>
  </section>;
}
