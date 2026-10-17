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
