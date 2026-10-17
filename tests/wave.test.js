import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isWaveCleared } from '../src/rules/wave.js';

test('la vague est repoussée quand la file est vide et tous les zombies sont morts', () => {
  const state = { waveActive: true, bossPending: null, queue: [], zombies: [{ dead: true }, { dead: true }] };
  assert.equal(isWaveCleared(state), true);
});

test('la vague continue tant qu’un zombie est debout, qu’il en reste à faire apparaître ou qu’un boss est attendu', () => {
  const base = { waveActive: true, bossPending: null, queue: [], zombies: [{ dead: true }] };
  assert.equal(isWaveCleared({ ...base, zombies: [{ dead: false }] }), false);
  assert.equal(isWaveCleared({ ...base, queue: ['walker'] }), false);
  assert.equal(isWaveCleared({ ...base, bossPending: 'butcher' }), false);
  assert.equal(isWaveCleared({ ...base, waveActive: false }), false);
});
