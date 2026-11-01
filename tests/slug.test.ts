import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isObjectIdString, slugify } from '../utils/slug.js';

test('product names become readable URL slugs that never look like IDs', () => {
  assert.equal(slugify('Classic Aviator Sunglasses'), 'classic-aviator-sunglasses');
  assert.equal(slugify('  Café & Co. — T-Shirt (Kids) '), 'cafe-and-co-t-shirt-kids');
  assert.equal(slugify('!!!'), 'product');
  assert.equal(isObjectIdString(slugify('6ad3dca0796a6c2623f0c8cf')), false);
  assert.equal(isObjectIdString('6ad3dca0796a6c2623f0c8cf'), true);
});
