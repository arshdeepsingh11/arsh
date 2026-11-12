import { getInventory } from "@/lib/server/github";

export const revalidate = 3600;

/** Public repository inventory: live GitHub metadata merged over the verified snapshot. */
export async function GET() {
  return Response.json(await getInventory(), { headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
