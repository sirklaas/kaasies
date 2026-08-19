export function getPocketBaseConfig(env = {}) {
  const rawUrl = String(env.KAASIES_POCKETBASE_URL || '').trim();
  if (!rawUrl) throw new Error('KAASIES_POCKETBASE_URL is verplicht.');
  let parsed;
  try { parsed = new URL(rawUrl); } catch { throw new Error('KAASIES_POCKETBASE_URL is ongeldig.'); }
  if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
    throw new Error('PocketBase vereist HTTPS, behalve bij lokale ontwikkeling.');
  }
  return { url: rawUrl.replace(/\/+$/, '') };
}
