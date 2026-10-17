import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turretCapacity, turretRate } from '../src/rules/turrets.js';

test('le toit accueille deux tourelles, une de plus par niveau d’Armurier, quatre au plus', () => {
  assert.equal(turretCapacity({}), 2);
  assert.equal(turretCapacity({ turret: 1 }), 3);
  assert.equal(turretCapacity({ turret: 5 }), 4);
});

test('Armurier accélère les tourelles de 40 % par niveau', () => {
  assert.equal(turretRate({}), 0.22);
  assert.ok(Math.abs(turretRate({ turret: 1 }) - 0.132) < 1e-9);
});
