const base = (id, name, type, timing, instruction, color, extra = {}) => ({
  id, name, type, timing, instruction, color, enabled: true, ...extra,
});

export const DEFAULT_STEPS = Object.freeze([
  base('received', 'Bestelling ontvangen', 'trigger', 'Direct', 'Start zodra een betaalde bestelling binnenkomt.', 'yellow', { locked: true, owner: 'Systeem' }),
  base('payment', 'Betaling bevestigd', 'email', 'Direct', 'Bevestig betaling, inhoud en afleveradres.', 'aqua', { owner: 'Automatisch', subject: 'Betaald. De kaas komt eraan.' }),
  base('upsell', 'Een goeie aanvulling?', 'upsell', 'Na 10 min', 'Bied één passende kaas of chutney aan, nooit een heel schap.', 'pink', { owner: 'Automatisch', subject: 'Nog één lekkere gedachte…' }),
  base('member', 'Word vaste fijnproever', 'email', 'Na 20 min', 'Nodig uit voor Kaaspost en ledenvoordeel.', 'purple', { owner: 'Automatisch', subject: 'Zullen we vaker iets goeds sturen?' }),
  base('picklist', 'Picklijst maken', 'internal', 'Direct', 'Maak een heldere lijst per kaas, gewicht en verpakking.', 'paper', { owner: 'Magazijn' }),
  base('quality', 'Wegen & kwaliteitscheck', 'manual', 'Binnen 4 uur', 'Controleer snijvlak, korst, gewicht en vacuüm.', 'red', { owner: 'Kaasmeester' }),
  base('packing', 'Eigenwijs inpakken', 'manual', 'Na controle', 'Gebruik koeling waar nodig en voeg het proefkaartje toe.', 'yellow', { owner: 'Magazijn' }),
  base('label', 'Label maken & printen', 'label', 'Na inpakken', 'Controleer adres, gewicht en vervoerder vóór print.', 'aqua', { owner: 'Magazijn' }),
  base('tracking', 'Track & trace koppelen', 'system', 'Na label', 'Sla de vervoerderscode op bij de bestelling.', 'paper', { owner: 'Systeem' }),
  base('shipping', 'Verzendmail sturen', 'email', 'Direct na scan', 'Stuur track & trace plus bewaaradvies.', 'pink', { owner: 'Automatisch', subject: 'Je kaas is onderweg.' }),
  base('delivery', 'Bezorging controleren', 'system', 'Na 1 dag', 'Signaleer vertraging of mislukte bezorging.', 'red', { owner: 'Systeem' }),
  base('review', 'Vraag hoe het smaakte', 'email', 'Na 5 dagen', 'Vraag kort om een eerlijke review.', 'purple', { owner: 'Automatisch', subject: 'En? Was het echte kaas?' }),
  base('repeat', 'Nog zo’n stuk?', 'email', 'Na 28 dagen', 'Stel herhaalaankoop of abonnement voor op basis van de order.', 'yellow', { owner: 'Automatisch', subject: 'Tijd voor een nieuw stuk?' }),
].map(step => Object.freeze(step)));

const clone = steps => steps.map(step => ({ ...step }));

export function validateStep(step) {
  if (!step || !String(step.name || '').trim()) return { valid: false, error: 'Geef de actie een naam.' };
  if (!String(step.type || '').trim()) return { valid: false, error: 'Kies een actietype.' };
  if (!String(step.instruction || '').trim()) return { valid: false, error: 'Voeg een instructie toe.' };
  return { valid: true, error: '' };
}

export function parseWorkflow(raw) {
  if (!raw) return clone(DEFAULT_STEPS);
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length || parsed.some(step => !validateStep(step).valid)) throw new Error('invalid');
    parsed[0] = { ...parsed[0], enabled: true, locked: true };
    return clone(parsed);
  } catch {
    return clone(DEFAULT_STEPS);
  }
}

export function toggleStep(steps, id) {
  return steps.map(step => step.id === id && !step.locked ? { ...step, enabled: !step.enabled } : { ...step });
}

export function moveStep(steps, id, direction) {
  const copy = clone(steps);
  const index = copy.findIndex(step => step.id === id);
  const target = index + Math.sign(direction);
  if (index <= 0 || target <= 0 || target >= copy.length) return copy;
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export function updateStep(steps, id, patch) {
  const current = steps.find(step => step.id === id);
  if (!current) throw new Error('Actie bestaat niet.');
  const next = { ...current, ...patch, id: current.id, locked: current.locked };
  const result = validateStep(next);
  if (!result.valid) throw new Error(result.error);
  return steps.map(step => step.id === id ? next : { ...step });
}

export function addStep(steps, step) {
  if (steps.some(item => item.id === step.id)) throw new Error('Deze actie bestaat al.');
  const result = validateStep(step);
  if (!result.valid) throw new Error(result.error);
  return [...clone(steps), { color: 'pink', timing: 'Direct', owner: 'Automatisch', enabled: true, ...step }];
}
