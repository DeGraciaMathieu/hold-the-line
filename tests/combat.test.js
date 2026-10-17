import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveHit } from '../src/rules/combat.js';

const never = () => 0.999, always = () => 0;

test('une balle de pistolet inflige ses 20 dégâts, 24 avec un niveau de Gâchette lourde', () => {
  assert.equal(resolveHit({ dmg: 20, src: 'pistol', target: {}, perks: {} }, never).dmg, 20);
  assert.equal(resolveHit({ dmg: 20, src: 'pistol', target: {}, perks: { dmg: 1 } }, never).dmg, 24);
});

test('un coup critique double les dégâts, jamais au corps à corps ni au lance-flammes', () => {
  const crit = resolveHit({ dmg: 20, src: 'pistol', target: {}, perks: {} }, always);
  assert.deepEqual([crit.dmg, crit.crit], [40, true]);
  assert.equal(resolveHit({ dmg: 18, src: 'melee', target: {}, perks: {} }, always).crit, false);
  assert.equal(resolveHit({ dmg: 5, src: 'flamer', target: {}, perks: {} }, always).crit, false);
});

test('l’armure du blindé encaisse 6 points sur les petits calibres, pas sur le fusil de précision ni le feu', () => {
  const uzi = resolveHit({ dmg: 9, src: 'uzi', target: { armor: 6 }, perks: {} }, never);
  assert.deepEqual([uzi.dmg, uzi.armored], [3, true]);
  assert.equal(resolveHit({ dmg: 140, src: 'sniper', target: { armor: 6 }, perks: {} }, never).dmg, 140);
  assert.equal(resolveHit({ dmg: 5, src: 'fire', target: { armor: 6 }, perks: {} }, never).armored, false);
});

test('un coup inflige toujours au moins 1 point de dégâts', () => {
  assert.equal(resolveHit({ dmg: 2, src: 'uzi', target: { armor: 6 }, perks: {} }, never).dmg, 1);
});

test('Pyromane enflamme la cible sur les balles du joueur, jamais sans l’atout', () => {
  assert.equal(resolveHit({ dmg: 20, src: 'pistol', target: {}, perks: { pyro: 1 } }, always).burn, true);
  assert.equal(resolveHit({ dmg: 20, src: 'pistol', target: {}, perks: {} }, always).burn, false);
  assert.equal(resolveHit({ dmg: 20, src: 'turret', target: {}, perks: { pyro: 2 } }, always).burn, false);
});

import { coinDrop, leechHeal } from '../src/rules/combat.js';

test('un walker rapporte 10 $ en deux pièces, 20 $ au combo maximal', () => {
  assert.deepEqual(coinDrop(10, 0, false), { reward: 10, n: 1, v: 10 });
  assert.deepEqual(coinDrop(10, 10, false), { reward: 20, n: 3, v: 7 });
  assert.equal(coinDrop(10, 25, false).reward, 20);
});

test('un boss éparpille sa prime en trente pièces au plus', () => {
  const d = coinDrop(800, 0, true);
  assert.deepEqual([d.n, d.v], [30, 27]);
});

test('Vampire rend 2 PV par niveau, sans dépasser le maximum ni soigner un survivant mort ou intact', () => {
  assert.deepEqual(leechHeal({ hp: 50, maxHp: 100, dead: false }, { leech: 2 }), { hp: 54, h: 4 });
  assert.deepEqual(leechHeal({ hp: 99, maxHp: 100, dead: false }, { leech: 1 }), { hp: 100, h: 2 });
  assert.equal(leechHeal({ hp: 100, maxHp: 100, dead: false }, { leech: 1 }), null);
  assert.equal(leechHeal({ hp: 50, maxHp: 100, dead: true }, { leech: 1 }), null);
  assert.equal(leechHeal({ hp: 50, maxHp: 100, dead: false }, {}), null);
});

import { playerTakesHit, baseTakesHit } from '../src/rules/combat.js';

test('un survivant blessé perd les PV, devient invincible 0,55 s et recule à l’opposé de l’agresseur', () => {
  const hit = playerTakesHit({ x: 100, y: 100, hp: 100, inv: 0, kx: 0, ky: 0, dead: false }, 8, { x: 90, y: 100 }, false);
  assert.deepEqual([hit.hp, hit.inv, hit.kx, hit.ky, hit.down], [92, 0.55, 140, 0, false]);
});

test('un survivant invincible, mort ou en fin de partie n’encaisse rien', () => {
  const p = { x: 0, y: 0, hp: 50, inv: 0, kx: 0, ky: 0, dead: false };
  assert.equal(playerTakesHit({ ...p, inv: 0.3 }, 8, null, false), null);
  assert.equal(playerTakesHit({ ...p, dead: true }, 8, null, false), null);
  assert.equal(playerTakesHit(p, 8, null, true), null);
});

test('le survivant tombe quand ses PV atteignent zéro, sans passer en négatif', () => {
  const hit = playerTakesHit({ x: 0, y: 0, hp: 5, inv: 0, kx: 0, ky: 0, dead: false }, 8, null, false);
  assert.deepEqual([hit.hp, hit.down], [0, true]);
});

test('le rempart encaisse les dégâts et tombe à zéro, sauf une fois la partie finie', () => {
  assert.deepEqual(baseTakesHit({ hp: 100 }, 30, false), { hp: 70, down: false });
  assert.deepEqual(baseTakesHit({ hp: 20, maxHp: 400 }, 30, false), { hp: 0, down: true });
  assert.equal(baseTakesHit({ hp: 100 }, 30, true), null);
});
