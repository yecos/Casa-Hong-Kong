import 'server-only';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { db } from './db';
import { requestSchema, priceOrder, type Rules, type MenuDish } from './order-domain';
export function trackingToken(id:string) {
 if(!process.env.ORDER_TOKEN_SECRET) throw new Error('Registro no configurado.');
 return createHmac('sha256',process.env.ORDER_TOKEN_SECRET).update('hk-order:'+id).digest('hex');
}
export function validTrackingToken(id:string,token:string) {
 if(!/^[a-f0-9]{64}$/.test(token)) return false;
 return timingSafeEqual(Buffer.from(trackingToken(id)),Buffer.from(token));
}
const money=(n:number)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
export function requestResponse(order:{id:string;reference:string;details:Record<string,unknown>}) {
 const d=order.details as {customer:{name:string;phone:string;address:string;neighborhood:string};method:string;items:{name:string;size:string;quantity:number;total:number}[];subtotal:number;deliveryFee:number;total:number;notes:string;whatsapp:string};
 const summary=[`SOLICITUD ${order.reference} · PENDIENTE DE CONFIRMACIÓN`,'Casa Hong Kong',d.method==='domicilio'?'Domicilio (validar cobertura)':'Recoger en sede',`Nombre: ${d.customer.name}`,`Celular: ${d.customer.phone}`,...(d.method==='domicilio'?[`Dirección: ${d.customer.address}`,`Barrio: ${d.customer.neighborhood}`]:[]),...d.items.map(i=>`${i.quantity} × ${i.name}${i.size?` (${i.size})`:''}: ${money(i.total)}`),`Productos: ${money(d.subtotal)}`,`Domicilio estimado: ${money(d.deliveryFee)}`,`Total estimado: ${money(d.total)}`,d.notes?`Observaciones: ${d.notes}`:'','Por favor confirmar disponibilidad, precios, cobertura, total final, forma de pago y tiempo. No preparar hasta acordar el total por este chat.'].filter(Boolean).join('\n');
 return {id:order.id,reference:order.reference,token:trackingToken(order.id),summary,whatsappUrl:`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(summary)}`};
}
export async function registerRequest(raw:unknown,ip:string) {
 const input=requestSchema.parse(raw);
 const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
 const client=await db().connect();
 try {
  await client.query('BEGIN');
  const existing=await client.query('SELECT id,reference,details,payload_hash FROM hk_orders WHERE idempotency_key=$1',[input.idempotencyKey]);
  if(existing.rows[0]) {if(existing.rows[0].payload_hash!==hash) throw new Error('La selección cambió. Revisa otra vez la solicitud.');await client.query('COMMIT');return requestResponse(existing.rows[0]);}
  const window=Math.floor(Date.now()/600000);
  const key=createHmac('sha256',process.env.ORDER_TOKEN_SECRET!).update(ip+':'+window).digest('hex');
  const rate=await client.query('INSERT INTO hk_rate_limits(key,hits,expires_at) VALUES($1,1,now()+interval \'10 minutes\') ON CONFLICT(key) DO UPDATE SET hits=hk_rate_limits.hits+1 RETURNING hits',[key]);
  if(rate.rows[0].hits>10) {await client.query('COMMIT');throw new Error('Demasiadas solicitudes. Espera unos minutos.');}
  const config=await client.query('SELECT catalog,rules FROM hk_config WHERE id=1 FOR SHARE');
  if(!config.rows[0]) throw new Error('Carta no disponible.');
  const catalog=config.rows[0].catalog as MenuDish[];
  const rules=config.rows[0].rules as Rules;
  const prices=priceOrder(input,catalog,rules);
  const details={...prices,customer:input.customer,method:input.method,notes:input.notes,whatsapp:rules.whatsapp,consentAt:new Date().toISOString(),consentVersion:'2026-10-30-v1'};
  const id=randomUUID();
  const reference='HK-'+id.slice(0,8).toUpperCase();
  const inserted=await client.query('INSERT INTO hk_orders(id,reference,idempotency_key,payload_hash,details,total) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(idempotency_key) DO NOTHING RETURNING id,reference,details',[id,reference,input.idempotencyKey,hash,details,prices.total]);
  let order=inserted.rows[0];
  if(!order) {const duplicate=await client.query('SELECT id,reference,details,payload_hash FROM hk_orders WHERE idempotency_key=$1',[input.idempotencyKey]);order=duplicate.rows[0];if(!order || order.payload_hash!==hash) throw new Error('La selección cambió. Revisa otra vez la solicitud.');}
  else await client.query('INSERT INTO hk_order_events(order_id,status,actor) VALUES($1,$2,$3)',[id,'pendiente','cliente']);
  await client.query('COMMIT');
  return requestResponse(order);
 } catch(e) {await client.query('ROLLBACK');throw e;} finally {client.release();}
}
