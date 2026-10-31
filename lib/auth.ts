import 'server-only';
import { createNeonAuth } from '@neondatabase/auth/next/server';
import { isAllowedAdmin } from './order-domain';
let instance:ReturnType<typeof createNeonAuth>|undefined;
export function authConfigured() {return !!process.env.NEON_AUTH_BASE_URL && !!process.env.NEON_AUTH_COOKIE_SECRET;}
export function getAuth() {
  if(!authConfigured()) throw new Error('Acceso administrativo sin configurar.');
  return instance ??= createNeonAuth({baseUrl:process.env.NEON_AUTH_BASE_URL!,cookies:{secret:process.env.NEON_AUTH_COOKIE_SECRET!,sessionDataTtl:30}});
}
export async function adminUser() {
  if(!authConfigured()) return null;
  const {data}=await getAuth().getSession();
  const user=data?.user;
  return isAllowedAdmin(user,process.env.ADMIN_EMAILS||'')?user:null;
}
