import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isBossWave, waveSize, spawnGap, zombieHp, bossHp, isBaseIntact, waveBonus, isPerkWave, reinforcePrice } from '../src/rules/progression.js';

test('la cinquième vague locale d’un refuge est la vague du boss', () => {
  assert.equal(isBossWave(5, false), true);
  assert.equal(isBossWave(4, false), false);
});

test('en mode infini, un boss arrive toutes les cinq vagues', () => {
  assert.equal(isBossWave(10, true), true);
  assert.equal(isBossWave(7, true), false);
});

test('la première vague compte 9 zombies et grossit de 3,2 par vague', () => {
  assert.equal(waveSize(1, false, false), 9);
  assert.equal(waveSize(5, false, false), 22);
});

test('une vague de boss est réduite à 60 %, le mode infini ajoute 10 %', () => {
  assert.equal(waveSize(5, true, false), 13);
  assert.equal(waveSize(5, false, true), 24);
});

test('l’intervalle de spawn se resserre avec les vagues sans descendre sous 0,28 s', () => {
  assert.equal(spawnGap(1), 1.25);
  assert.equal(spawnGap(30), 0.28);
});

test('les zombies gagnent 7 % de PV par vague, les boss ne grossissent qu’en infini après la vague 20', () => {
  assert.equal(zombieHp(40, 1), 40);
  assert.ok(Math.abs(zombieHp(100, 3) - 114) < 1e-9);
  assert.equal(bossHp(1600, 5, false), 1600);
  assert.equal(bossHp(1000, 30, true), 1600);
});

test('la prime de fin de vague récompense le rempart intact et le boss abattu', () => {
  assert.equal(isBaseIntact(400, 400), true);
  assert.equal(isBaseIntact(360, 400), false);
  assert.equal(waveBonus(1, false, false), 55);
  assert.equal(waveBonus(5, true, true), 365);
});

test('un atout est proposé aux vagues 2 et 4 d’un refuge, après chaque boss, et toutes les trois vagues en infini', () => {
  assert.equal(isPerkWave(2, false, false), true);
  assert.equal(isPerkWave(3, false, false), false);
  assert.equal(isPerkWave(5, true, false), true);
  assert.equal(isPerkWave(6, false, true), true);
  assert.equal(isPerkWave(7, false, true), false);
});

test('renforcer le rempart coûte 180 $ puis 60 $ de plus à chaque fois', () => {
  assert.equal(reinforcePrice(0), 180);
  assert.equal(reinforcePrice(2), 300);
});
