/* Cloudflare Pages Function: live presence + geo, no server.
   Powers the badge's "N live · <date> · <city, country>" line and the visitor
   counter. Bind a KV namespace as `VISITS` in the Pages project settings for the
   count; for accurate live-now presence use a Durable Object instead.
   Privacy: store a count and a COARSE city only — never PII, never the raw IP.
   See references/deploy-and-seo.md */

interface Env { VISITS: KVNamespace; }

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const cf = (request as any).cf ?? {};
  const city: string = cf.city ?? '—';
  const country: string = cf.country ?? '—';

  // simple total counter in KV (swap for a Durable Object for real live presence)
  let total = 0;
  try {
    total = Number((await env.VISITS.get('total')) ?? '0') + 1;
    await env.VISITS.put('total', String(total));
  } catch { /* KV not bound in dev — return a stub */ }

  const body = {
    total,
    live: 1,                                   // replace with real sliding-window presence
    city, country,
    date: new Date().toISOString().slice(0, 10),
  };
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
