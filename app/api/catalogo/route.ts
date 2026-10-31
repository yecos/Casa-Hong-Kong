import { publicCatalog } from '../../../lib/catalog';
export async function GET() {const data=await publicCatalog(); return Response.json(data,{status:data.ready?200:503,headers:{'Cache-Control':'no-store'}});}
