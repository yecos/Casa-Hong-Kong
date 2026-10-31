import 'server-only';
import { db } from './db';
import { seedDishes } from '../app/menu';
import { deliveryRules } from '../app/order-config';
import type { MenuDish, Rules } from './order-domain';
export type CatalogState = {catalog:MenuDish[];rules:Rules;version:number;ready:boolean};
export async function getCatalog():Promise<CatalogState> {
  const {rows}=await db().query('SELECT catalog,rules,version FROM hk_config WHERE id=1');
  if(!rows[0]) throw new Error('Carta no inicializada.');
  return {...rows[0],ready:true};
}
export async function publicCatalog():Promise<CatalogState> {
  try{return await getCatalog();}catch {
    return {catalog:seedDishes.map(d=>({...d,available:true})),rules:{...deliveryRules,acceptingRequests:false,pauseMessage:'No podemos conectar con la carta en este momento. Intenta nuevamente más tarde.'},version:0,ready:false};
  }
}
