import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickupRadius, coinValue } from '../src/rules/coins.js';

test('les pièces sont attirées à 58 px, bien plus large avec Aimant', () => {
  assert.equal(pickupRadius({}), 58);
  assert.ok(Math.abs(pickupRadius({ magnet: 1 }) - 104.4) < 1e-9);
});

test('Aimant vaut 20 % de pièces en plus par niveau', () => {
  assert.equal(coinValue(10, {}), 10);
  assert.equal(coinValue(10, { magnet: 2 }), 14);
});
