import test from 'node:test';
import assert from 'node:assert/strict';
import { detectMissingFields, formatLabelText, calculateSheetCount } from './labelLogic';

test('detectMissingFields identifies missing attributes accurately', () => {
  const complete = {
    codigo: '90808',
    descricao: 'ESTJ MALBEC CLUB REG/26',
    quantidade: '7',
    validade: '06/2029',
  };
  assert.deepEqual(detectMissingFields(complete), []);

  const missingQtdAndVal = {
    codigo: '87896',
    descricao: 'FLORATTA EDP RED PASSION V2 75ml',
    quantidade: '',
    validade: '',
  };
  assert.deepEqual(detectMissingFields(missingQtdAndVal), ['quantidade', 'validade']);

  const empty = {};
  assert.deepEqual(detectMissingFields(empty), ['codigo', 'descricao', 'quantidade', 'validade']);
});

test('formatLabelText trims and capitalizes strings', () => {
  assert.equal(formatLabelText('  lily cr acet des hid  '), 'LILY CR ACET DES HID');
  assert.equal(formatLabelText(''), '');
});

test('calculateSheetCount calculates A4 sheets based on 3 per sheet', () => {
  assert.equal(calculateSheetCount(0, 3), 0);
  assert.equal(calculateSheetCount(1, 3), 1);
  assert.equal(calculateSheetCount(3, 3), 1);
  assert.equal(calculateSheetCount(4, 3), 2);
  assert.equal(calculateSheetCount(9, 3), 3);
});
