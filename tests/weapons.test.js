import { test } from 'node:test';
import assert from 'node:assert/strict';
import { magSize, reloadTime, isUnlocked, muzzlePos } from '../src/rules/weapons.js';
import { WEAP } from '../src/config.js';

test('le chargeur de l’AK contient 30 balles, 39 avec un niveau de Chargeurs étendus', () => {
  assert.equal(magSize('ak', {}), 30);
  assert.equal(magSize('ak', { mag: 1 }), 39);
});

test('Mains rapides accélère le rechargement de 25 % par niveau', () => {
  assert.equal(reloadTime(WEAP.pistol, {}), 0.85);
  assert.ok(Math.abs(reloadTime({ reload: 2 }, { reload: 2 }) - 1.125) < 1e-9);
});

test('le fusil de précision arrive à l’Usine, mais tout est ouvert en mode infini', () => {
  assert.equal(isUnlocked('sniper', 1, false), false);
  assert.equal(isUnlocked('sniper', 2, false), true);
  assert.equal(isUnlocked('railgun', 0, true), true);
});

test('la bouche du canon part de la main du joueur, décalée selon l’angle de visée et le recul', () => {
  const p = { x: 100, y: 50, face: 1, ang: 0, kick: 0 };
  const [fx, fy, hx, hy] = muzzlePos(p, { muzzle: [10, -2] });
  assert.deepEqual([hx, hy], [102, 42]);
  assert.deepEqual([fx, fy], [112, 40]);
  const [kx] = muzzlePos({ ...p, kick: 3 }, { muzzle: [10, -2] });
  assert.equal(kx, 109);
});
