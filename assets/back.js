import { DEFAULT_STEPS, parseWorkflow, toggleStep, moveStep, updateStep, addStep } from './back-core.mjs';

const WORKFLOW_KEY = 'kaasies-back-workflow-v1';
const LOG_KEY = 'kaasies-back-log-v1';
const orders = [
  { id: 'K-1048', name: 'Sophie van Dijk', amount: '€ 54,80', time: '14:32', status: 'Inpakken', group: 'all', city: 'Amsterdam', address: 'Weteringschans 84\n1017 XR Amsterdam', weight: '1,8 kg' },
  { id: 'K-1047', name: 'Milan de Boer', amount: '€ 38,90', time: '13:51', status: 'Adres check', group: 'attention', city: 'Utrecht', address: 'Oudegracht 171\n3511 NE Utrecht', weight: '1,2 kg' },
  { id: 'K-1046', name: 'Noor Bakker', amount: '€ 72,35', time: '12:18', status: 'Onderweg', group: 'shipping', city: 'Rotterdam', address: 'Nieuwe Binnenweg 48\n3015 BA Rotterdam', weight: '2,4 kg' },
  { id: 'K-1045', name: 'James Visser', amount: '€ 45,95', time: '11:44', status: 'Voorraad check', group: 'attention', city: 'Haarlem', address: 'Kleine Houtstraat 12\n2011 DM Haarlem', weight: '1,5 kg' },
  { id: 'K-1044', name: 'Emma Smit', amount: '€ 29,90', time: '10:26', status: 'Onderweg', group: 'shipping', city: 'Leiden', address: 'Breestraat 93\n2311 CK Leiden', weight: '0,9 kg' },
  { id: 'K-1043', name: 'Lucas Meijer', amount: '€ 61,25', time: '09:08', status: 'Betaald', group: 'all', city: 'Delft', address: 'Oude Delft 122\n2611 CG Delft', weight: '2,0 kg' },
];

const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const color = name => ({ yellow: '#f4de3f', aqua: '#a9dcd5', pink: '#f4a6be', purple: '#5a4ac7', red: '#ef573f', paper: '#faf3e8' })[name] || '#f4a6be';
const typeLabel = type => ({ trigger: 'Trigger', email: 'E-mail', upsell: 'Upsell', internal: 'Intern', manual: 'Handmatig', label: 'Label', system: 'Systeem' })[type] || type;
let steps = parseWorkflow(localStorage.getItem(WORKFLOW_KEY));
let selectedStep = steps[1]?.id || steps[0].id;
let selectedOrder = orders[0].id;
let filter = 'all';
let toastTimer;

function persist() {
  localStorage.setItem(WORKFLOW_KEY, JSON.stringify(steps));
}

function announce(message) {
  const toast = $('[data-toast]');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function logAction(message) {
  let log = [];
  try { log = JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch { log = []; }
  localStorage.setItem(LOG_KEY, JSON.stringify([{ at: new Date().toISOString(), message }, ...log].slice(0, 20)));
}

function currentOrder() {
  return orders.find(order => order.id === selectedOrder) || orders[0];
}

function renderOrders() {
  const visible = orders.filter(order => filter === 'all' || order.group === filter);
  $('[data-orders]').innerHTML = visible.map(order => `
    <button class="order-card ${order.id === selectedOrder ? 'selected' : ''}" type="button" data-order="${order.id}">
      <span class="order-top"><strong>#${order.id}</strong><time>${order.time}</time></span>
      <h3>${escape(order.name)}</h3>
      <span class="order-bottom"><span>${order.amount} · ${escape(order.city)}</span><span class="order-status ${order.group}">${escape(order.status)}</span></span>
    </button>`).join('');
}

function renderSteps() {
  $('[data-steps]').innerHTML = steps.map((step, index) => `
    <li class="step" data-step-id="${escape(step.id)}">
      <span class="step-number">${String(index + 1).padStart(2, '0')}</span>
      <article class="step-card ${step.enabled ? '' : 'disabled'} ${step.id === selectedStep ? 'selected' : ''}" style="--step-color:${color(step.color)}">
        <span class="step-color"></span>
        <button class="step-main" type="button" data-edit="${escape(step.id)}">
          <span class="step-meta"><span class="type-chip">${escape(typeLabel(step.type))}</span><span class="timing-chip">${escape(step.timing)}</span></span>
          <h3>${escape(step.name)}</h3><p>${escape(step.owner || 'Automatisch')} · ${escape(step.instruction)}</p>
        </button>
        <span class="step-controls">
          <button type="button" data-move="-1" data-id="${escape(step.id)}" aria-label="Omhoog" ${index <= 1 ? 'disabled' : ''}>↑</button>
          <button type="button" data-move="1" data-id="${escape(step.id)}" aria-label="Omlaag" ${index === steps.length - 1 || step.locked ? 'disabled' : ''}>↓</button>
          <button class="switch" type="button" data-toggle="${escape(step.id)}" aria-label="${step.enabled ? 'Pauzeer' : 'Activeer'} ${escape(step.name)}" aria-pressed="${step.enabled}" ${step.locked ? 'disabled' : ''}></button>
        </span>
      </article>
    </li>`).join('');
  $('[data-order-context]').textContent = `Voorbeeld voor order #${currentOrder().id}`;
}

function labelMarkup(order) {
  return `<div class="label-preview" data-label>
    <img class="label-brand-image" src="assets/brand/kaasies-logo.webp" width="1759" height="534" alt="Kaasies — Maar alleen echte">
    <div class="label-route">NL · PAKKET 01</div>
    <div class="label-name">${escape(order.name)}</div>
    <div class="label-address">${escape(order.address).replace(/\n/g, '<br>')}</div>
    <small>ORDER #${escape(order.id)} · ${escape(order.weight)}</small>
    <div class="barcode" aria-label="Prototype barcode"></div>
    <div class="label-code">3SKAAS${escape(order.id.replace(/\D/g, ''))}NL</div>
    <div class="label-message">PAK OPEN. KAAS AAN.</div>
  </div>`;
}

function renderEditor() {
  const step = steps.find(item => item.id === selectedStep);
  if (!step) return;
  const isLabel = step.type === 'label';
  $('[data-editor]').innerHTML = `<form class="editor-form" data-editor-form>
    <div class="editor-top"><div><span class="eyebrow">Stap bewerken</span><h2>${escape(step.name)}</h2></div><span class="type-chip">${escape(typeLabel(step.type))}</span></div>
    <label>Naam<input name="name" required value="${escape(step.name)}"></label>
    <label>Type<select name="type">${['email','upsell','manual','internal','system','label','trigger'].map(type => `<option value="${type}" ${type === step.type ? 'selected' : ''}>${typeLabel(type)}</option>`).join('')}</select></label>
    <label>Timing<input name="timing" required value="${escape(step.timing)}"></label>
    <label>Eigenaar<select name="owner">${['Automatisch','Systeem','Magazijn','Kaasmeester'].map(owner => `<option ${owner === step.owner ? 'selected' : ''}>${owner}</option>`).join('')}</select></label>
    ${['email','upsell'].includes(step.type) ? `<label>Onderwerpregel<input name="subject" value="${escape(step.subject || '')}"></label>` : ''}
    <label>Instructie<textarea name="instruction" required>${escape(step.instruction)}</textarea></label>
    <div class="editor-status"><span>${step.enabled ? 'Actie staat aan' : 'Actie is gepauzeerd'}</span><button class="switch" type="button" data-toggle="${escape(step.id)}" aria-pressed="${step.enabled}" ${step.locked ? 'disabled' : ''}></button></div>
    ${isLabel ? labelMarkup(currentOrder()) : ''}
    <div class="editor-actions"><button class="button" type="button" data-preview>${isLabel ? 'Label bekijken' : 'Voorbeeld'}</button><button class="button" type="button" data-test-action>Test actie</button><button class="button primary save" type="submit" data-save-step>Wijzigingen opslaan</button></div>
    <p class="prototype-note">Prototype: deze actie gebruikt alleen lokale demodata. Er wordt niets echt verzonden of verwerkt.</p>
  </form>`;
}

function render() {
  renderOrders();
  renderSteps();
  renderEditor();
}

document.addEventListener('click', event => {
  const order = event.target.closest('[data-order]');
  const edit = event.target.closest('[data-edit]');
  const toggle = event.target.closest('[data-toggle]');
  const move = event.target.closest('[data-move]');
  const orderFilter = event.target.closest('[data-order-filter]');
  const mobileTab = event.target.closest('[data-mobile-panel]');
  if (order) { selectedOrder = order.dataset.order; render(); }
  if (edit) { selectedStep = edit.dataset.edit; render(); if (innerWidth <= 760) setMobilePanel('editor'); }
  if (toggle) { steps = toggleStep(steps, toggle.dataset.toggle); persist(); render(); announce('Actiestatus aangepast.'); }
  if (move) { steps = moveStep(steps, move.dataset.id, Number(move.dataset.move)); persist(); render(); announce('Actie verplaatst.'); }
  if (orderFilter) {
    filter = orderFilter.dataset.orderFilter;
    document.querySelectorAll('[data-order-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === orderFilter)));
    renderOrders();
  }
  if (mobileTab) setMobilePanel(mobileTab.dataset.mobilePanel);
  if (event.target.closest('[data-add-action]')) $('[data-add-dialog]').showModal();
  if (event.target.closest('[data-close-dialog]')) $('[data-add-dialog]').close();
  if (event.target.closest('[data-reset]')) {
    if (confirm('Alle lokale wijzigingen terugzetten naar de standaardflow?')) {
      steps = DEFAULT_STEPS.map(step => ({ ...step })); selectedStep = steps[1].id; persist(); render(); announce('Standaardflow hersteld.');
    }
  }
  if (event.target.closest('[data-test-action]')) {
    const step = steps.find(item => item.id === selectedStep); logAction(`Test: ${step.name}`); announce('Test geslaagd — niets echt verstuurd.');
  }
  if (event.target.closest('[data-preview]')) {
    const step = steps.find(item => item.id === selectedStep);
    if (step.type === 'label') window.print(); else announce('Voorbeeld klaar voor deze order.');
  }
});

function setMobilePanel(name) {
  document.querySelectorAll('[data-mobile-panel]').forEach(button => button.classList.toggle('active', button.dataset.mobilePanel === name));
  document.querySelectorAll('[data-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === name));
}

document.addEventListener('submit', event => {
  if (event.target.matches('[data-editor-form]')) {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      steps = updateStep(steps, selectedStep, { name: form.get('name'), type: form.get('type'), timing: form.get('timing'), owner: form.get('owner'), subject: form.get('subject') || '', instruction: form.get('instruction') });
      persist(); render(); announce('Wijzigingen opgeslagen.');
    } catch (error) { announce(error.message); }
  }
  if (event.target.matches('[data-add-form]')) {
    event.preventDefault();
    const form = new FormData(event.target);
    const name = String(form.get('newName') || '').trim();
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'actie'}-${Date.now().toString(36)}`;
    try {
      steps = addStep(steps, { id, name, type: form.get('newType'), timing: form.get('newTiming'), instruction: form.get('newInstruction'), enabled: true });
      selectedStep = id; persist(); $('[data-add-dialog]').close(); event.target.reset(); render(); announce('Nieuwe actie toegevoegd.');
    } catch (error) { $('[data-add-error]').textContent = error.message; }
  }
});

render();
