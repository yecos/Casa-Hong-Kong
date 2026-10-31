import { z } from 'zod';
import type { Dish } from '../app/menu';

export type MenuDish = Dish & { available: boolean };
export const rulesSchema = z.object({
  neighborhoods: z.array(z.string().trim().min(2).max(70)).min(1).max(30),
  estimatedFee: z.number().int().min(0).max(100000),
  minimumSubtotal: z.number().int().min(0).max(500000),
  referenceHours: z.string().trim().min(3).max(150),
  whatsapp: z.string().regex(/^57[0-9]{10}$/),
  acceptingRequests: z.boolean(),
  pauseMessage: z.string().trim().max(250),
});
export type Rules = z.infer<typeof rulesSchema>;
export const dishSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  name: z.string().trim().min(2).max(120),
  category: z.enum(['Arroces','Combinados','Especialidades','Entradas']),
  description: z.string().trim().max(500),
  price: z.number().int().min(1).max(1000000),
  image: z.enum(['especial','oriental','ocho-sabores','chopsuey','agridulce','lumpias']).optional(),
  available: z.boolean(),
  variants: z.record(z.string().regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]{1,40}$/), z.number().int().min(1).max(1000000)).refine(v => Object.keys(v).length > 0 && Object.keys(v).length <= 8).optional(),
});
export const requestSchema = z.object({
  idempotencyKey: z.uuid(),
  branch: z.literal('casa'),
  method: z.enum(['recoger','domicilio']),
  cart: z.array(z.object({id:z.string().max(140),quantity:z.number().int().min(1).max(20)})).min(1).max(80),
  customer: z.object({name:z.string().trim().min(2).max(80),phone:z.string().regex(/^3[0-9]{9}$/),address:z.string().trim().max(160),neighborhood:z.string().trim().max(80)}),
  notes: z.string().trim().max(300),
  consent: z.literal(true),
  expectedTotal: z.number().int().nonnegative(),
}).superRefine((v,c) => {if(v.method==='domicilio' && (v.customer.address.length<5 || v.customer.neighborhood.length<2)) c.addIssue({code:'custom',message:'Completa dirección y barrio.'}); if (new Set(v.cart.map(i=>i.id)).size!==v.cart.length) c.addIssue({code:'custom',message:'Productos duplicados.'});});
export const statuses = ['pendiente','confirmado','preparando','listo','en_camino','entregado','cancelado'] as const;
export type OrderStatus = typeof statuses[number];
export const statusLabels: Record<OrderStatus,string> = {pendiente:'Pendiente de confirmar',confirmado:'Confirmado',preparando:'En preparación',listo:'Listo',en_camino:'En camino',entregado:'Entregado',cancelado:'Cancelado'};
const next:Record<OrderStatus,OrderStatus[]> = {pendiente:['confirmado','cancelado'],confirmado:['preparando','cancelado'],preparando:['listo','cancelado'],listo:['en_camino','entregado','cancelado'],en_camino:['entregado','cancelado'],entregado:[],cancelado:[]};
export function allowedTransitions(status:OrderStatus,method:string) { return next[status].filter(s=>method==='domicilio'||s!=='en_camino'); }
export class OrderError extends Error {}
export function priceOrder(input:z.infer<typeof requestSchema>,catalog:MenuDish[],rules:Rules) {
  if(!rules.acceptingRequests) throw new OrderError(rules.pauseMessage || 'Las solicitudes están pausadas.');
  const options=catalog.flatMap(d=>d.variants?Object.entries(d.variants).map(([size,price])=>({...d,id:`${d.id}:${size}`,size,price})):[{...d,size:''}]);
  const items=input.cart.map(line=>{
    const d=options.find(d=>d.id===line.id);
    if(!d || !d.available) throw new OrderError('Un plato ya no está disponible. Actualiza la carta.');
    return {id:d.id,name:d.name,size:d.size,price:d.price,quantity:line.quantity,total:d.price*line.quantity};
  });
  if(items.reduce((s,i)=>s+i.quantity,0)>100) throw new OrderError('Máximo 100 unidades por solicitud.');
  const subtotal=items.reduce((s,i)=>s+i.total,0);
  if(input.method==='domicilio' && subtotal<rules.minimumSubtotal) throw new OrderError('No se alcanza el mínimo de domicilio.');
  const deliveryFee=input.method==='domicilio'?rules.estimatedFee:0;
  const total=subtotal+deliveryFee;
  if(input.expectedTotal!==total) throw new OrderError('Los precios cambiaron. Actualiza la carta y revisa el total.');
  return {items,subtotal,deliveryFee,total};
}
export function isAllowedAdmin(user:{email?:string;emailVerified?:boolean}|undefined,emails:string) {
  return user?.emailVerified === true && emails.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).includes(user.email?.toLowerCase()||'');
}
