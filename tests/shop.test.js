import { test } from 'node:test';
import assert from 'node:assert/strict';
import { purchasePrice, applyPurchase } from '../src/rules/shop.js';

const player = { hp: 60, maxHp: 100, w: 'pistol', owned: { pistol: true }, mag: { pistol: 12 }, res: { pistol: Infinity } };
const base = { hp: 300, maxHp: 400 };
const state = { player, base, reinforce: 0, perks: {} };

test('chaque article a son prix : Uzi 300 $, pack de balles 45 $, réparation 80 $, renforcement 180 $ puis 240 $, soins 60 $, tourelle 650 $', () => {
  assert.equal(purchasePrice('buy', 'uzi', 0), 300);
  assert.equal(purchasePrice('ammo', 'uzi', 0), 45);
  assert.equal(purchasePrice('repair', null, 0), 80);
  assert.equal(purchasePrice('reinforce', null, 0), 180);
  assert.equal(purchasePrice('reinforce', null, 1), 240);
  assert.equal(purchasePrice('heal', null, 0), 60);
  assert.equal(purchasePrice('turret', null, 0), 650);
});

test('acheter une arme l’équipe avec un chargeur plein et sa réserve de départ', () => {
  const { player: p } = applyPurchase('buy', 'uzi', state);
  assert.deepEqual([p.w, p.owned.uzi, p.mag.uzi, p.res.uzi], ['uzi', true, 32, 64]);
  assert.equal(player.w, 'pistol');
});

test('Chargeurs étendus agrandit le chargeur de l’arme achetée', () => {
  const { player: p } = applyPurchase('buy', 'uzi', { ...state, perks: { mag: 1 } });
  assert.equal(p.mag.uzi, 42);
});

test('un pack de munitions ajoute ses balles à la réserve', () => {
  const owned = { ...player, owned: { pistol: true, uzi: true }, res: { pistol: Infinity, uzi: 10 } };
  assert.equal(applyPurchase('ammo', 'uzi', { ...state, player: owned }).player.res.uzi, 74);
});

test('réparer rend 120 PV au rempart sans dépasser le maximum', () => {
  assert.equal(applyPurchase('repair', null, state).base.hp, 400);
  assert.equal(applyPurchase('repair', null, { ...state, base: { hp: 100, maxHp: 400 } }).base.hp, 220);
});

test('renforcer ajoute 60 PV maximum, autant de réparés, et compte un renforcement de plus', () => {
  const { base: b, reinforce } = applyPurchase('reinforce', null, state);
  assert.deepEqual([b.maxHp, b.hp, reinforce], [460, 360, 1]);
});

test('la trousse remet le survivant à son maximum et la tourelle demande une installation', () => {
  assert.equal(applyPurchase('heal', null, state).player.hp, 100);
  assert.equal(applyPurchase('turret', null, state).addTurret, true);
});
