import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STEPS,
  parseWorkflow,
  toggleStep,
  moveStep,
  updateStep,
  addStep,
  validateStep,
} from '../assets/back-core.mjs';

test('recovers the default journey from missing or damaged storage', () => {
  assert.deepEqual(parseWorkflow(null), DEFAULT_STEPS);
  assert.deepEqual(parseWorkflow('{kapot'), DEFAULT_STEPS);
  assert.notEqual(parseWorkflow(null), DEFAULT_STEPS);
});

test('keeps the first step enabled and locked', () => {
  const changed = toggleStep(DEFAULT_STEPS, DEFAULT_STEPS[0].id);
  assert.equal(changed[0].enabled, true);
  assert.equal(changed[0].locked, true);
});

test('toggles an editable step without mutating the original', () => {
  const changed = toggleStep(DEFAULT_STEPS, 'payment');
  assert.equal(changed[1].enabled, false);
  assert.equal(DEFAULT_STEPS[1].enabled, true);
});

test('moves a step one position while the locked first step stays first', () => {
  const moved = moveStep(DEFAULT_STEPS, 'upsell', -1);
  assert.equal(moved[0].id, 'received');
  assert.equal(moved[1].id, 'upsell');
  assert.equal(moved[2].id, 'payment');
  assert.deepEqual(moveStep(DEFAULT_STEPS, 'payment', -1), DEFAULT_STEPS);
});

test('updates a valid action and rejects an empty name', () => {
  const changed = updateStep(DEFAULT_STEPS, 'upsell', { name: 'Extra kaas erbij?' });
  assert.equal(changed[2].name, 'Extra kaas erbij?');
  assert.throws(() => updateStep(DEFAULT_STEPS, 'upsell', { name: '  ' }), /naam/i);
});

test('adds a valid action with a unique id', () => {
  const step = { id: 'thank-you', name: 'Bedankje', type: 'email', instruction: 'Zeg dank je.', timing: 'Na 1 dag', enabled: true };
  const changed = addStep(DEFAULT_STEPS, step);
  assert.equal(changed.at(-1).id, 'thank-you');
  assert.equal(validateStep(step).valid, true);
  assert.throws(() => addStep(changed, step), /bestaat/i);
});
