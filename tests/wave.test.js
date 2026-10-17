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

import { buildWaveQueue } from '../src/rules/wave.js';
import { createRng } from '../src/rules/rng.js';
import { LEVELS } from '../src/config.js';

test('la première vague de la Ferme ne compte que des walkers, neuf en tout', () => {
  const q = buildWaveQueue(LEVELS[0], { lw: 1, wave: 1, bossWave: false, endless: false }, createRng(1));
  assert.equal(q.length, 9);
  assert.ok(q.every(k => k === 'walker'));
});

test('la composition d’une vague suit le mix du refuge et ne dépend que de la graine', () => {
  const args = [LEVELS[1], { lw: 3, wave: 8, bossWave: false, endless: false }];
  const a = buildWaveQueue(...args, createRng(7)), b = buildWaveQueue(...args, createRng(7));
  assert.deepEqual(a, b);
  assert.ok(a.every(k => k in LEVELS[1].mix[2]));
});

test('en mode infini la vague puise dans le quatrième mix du refuge', () => {
  const q = buildWaveQueue(LEVELS[0], { lw: 7, wave: 25, bossWave: false, endless: true }, createRng(3));
  assert.ok(q.every(k => k in LEVELS[0].mix[3]));
});

import { edgePoint } from '../src/rules/wave.js';
import { WW, WH } from '../src/config.js';

test('les zombies apparaissent juste hors du monde, sur le bord demandé', () => {
  const rng = createRng(11);
  const [nx, ny] = edgePoint(0, rng);
  assert.equal(ny, -14); assert.ok(nx >= 40 && nx <= WW - 40);
  const [ex, ey] = edgePoint(1, rng);
  assert.equal(ex, WW + 14); assert.ok(ey >= 40 && ey <= WH - 40);
  const [, sy] = edgePoint(2, rng);
  assert.equal(sy, WH + 14);
  const [wx] = edgePoint(3, rng);
  assert.equal(wx, -14);
});
