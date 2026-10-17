import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pushOutOfRect, pushOutOfProps } from '../src/rules/collision.js';

const base = { x0: 352, x1: 416, y0: 227, y1: 253 };

test('un corps qui entre dans le rempart est repoussé sur son bord et signalé en contact', () => {
  const r = pushOutOfRect({ x: 418, y: 240 }, 4, base);
  assert.equal(r.hit, true);
  assert.deepEqual([r.x, r.y], [420, 240]);
});

test('un corps à distance du rempart n’est pas déplacé', () => {
  const r = pushOutOfRect({ x: 440, y: 240 }, 4, base);
  assert.equal(r.hit, false);
  assert.deepEqual([r.x, r.y], [440, 240]);
});

test('un corps entièrement dans le rempart ressort par le côté le plus proche', () => {
  const r = pushOutOfRect({ x: 414, y: 240 }, 4, base);
  assert.deepEqual([r.x, r.y, r.hit], [420, 240, true]);
});

test('un corps qui chevauche un arbre est repoussé, un accessoire détruit ne bloque plus', () => {
  const tree = { x: 100, y: 100, dead: false, cols: [[0, 0, 3]] };
  const r = pushOutOfProps({ x: 104, y: 100 }, 4, [tree]);
  assert.deepEqual([r.x, r.y], [107, 100]);
  const d = pushOutOfProps({ x: 104, y: 100 }, 4, [{ ...tree, dead: true }]);
  assert.deepEqual([d.x, d.y], [104, 100]);
});
