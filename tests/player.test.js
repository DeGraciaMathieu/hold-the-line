import { test } from 'node:test';
import assert from 'node:assert/strict';
import { movePlayer } from '../src/rules/player.js';

const player = { x: 100, y: 100, vx: 0, vy: 0, kx: 0, ky: 0, r: 4, reload: 0, spin: 0 };
const farBase = { x0: 352, x1: 416, y0: 227, y1: 253 };
const world = { weapon: {}, perks: {}, base: farBase, props: [] };
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('le survivant marche à 72 px/s vers la droite', () => {
  const m = movePlayer(player, { ix: 1, iy: 0 }, 0.1, world);
  assert.ok(near(m.x, 107.2));
  assert.equal(m.y, 100);
  assert.equal(m.moving, true);
});

test('recharger ralentit la marche de 15 %, Jambes de coureur l’accélère de 15 % par niveau', () => {
  const slow = movePlayer({ ...player, reload: 0.5 }, { ix: 1, iy: 0 }, 0.1, world);
  assert.ok(near(slow.x, 106.12));
  const fast = movePlayer(player, { ix: 1, iy: 0 }, 0.1, { ...world, perks: { speed: 2 } });
  assert.ok(near(fast.x, 109.36));
});

test('le survivant ne peut pas entrer dans le rempart', () => {
  const m = movePlayer({ ...player, x: 348, y: 240 }, { ix: 1, iy: 0 }, 0.1, world);
  assert.equal(m.x, 348);
});

test('immobile sans direction, le survivant reste en place', () => {
  const m = movePlayer(player, { ix: 0, iy: 0 }, 0.1, world);
  assert.deepEqual([m.x, m.y, m.moving], [100, 100, false]);
});
