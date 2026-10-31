import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteTotals, whatsappLink, deliveryRules } from '../app/order-config.ts';

test('pickup has no delivery fee or delivery minimum', () => {
  assert.deepEqual(quoteTotals(13000, false), {deliveryFee:0, estimatedTotal:13000, meetsMinimum:true});
});
test('delivery minimum checks products, excluding the delivery fee', () => {
  assert.equal(quoteTotals(24000, true).meetsMinimum, false);
  assert.equal(quoteTotals(25000, true).meetsMinimum, true);
  assert.equal(quoteTotals(25000, true).estimatedTotal, 31000);
});
test('WhatsApp uses the Casa number and encodes the full message without extra query parameters', () => {
  const message='Cliente: Ana & Juan\nDirección: Carrera 80 #52-60 + apto 2\nTotal: $31.000';
  const url=new URL(whatsappLink(message));
  assert.equal(url.hostname,'wa.me');
  assert.equal(url.pathname,`/${deliveryRules.whatsapp}`);
  assert.equal(url.searchParams.get('text'),message);
  assert.equal([...url.searchParams.keys()].length,1);
});
