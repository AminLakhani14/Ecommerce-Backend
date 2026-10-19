import { queryResult } from './helpers/query.js';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import Category, { defaultCategories } from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import { escapeRegex, parseProductCategories } from '../utils/categories.js';

test('category selections normalize, deduplicate, and support legacy scalar values', async context => {
  context.mock.method(Category, 'find', () => queryResult([{ name: 'Bags', key: 'bags' }]));
  assert.deepEqual(await parseProductCategories('Men'), ['Men']);
  assert.deepEqual(await parseProductCategories('["men","Women"," MEN ","bags"]'), ['Men', 'Women', 'Bags']);
  for (const value of [undefined, '', [], '[', '[1]', '{}']) {
    await assert.rejects(parseProductCategories(value));
  }
  await assert.rejects(parseProductCategories(['Unknown']), /do not exist/);
  const legacy = Product.hydrate({ category: 'Men' });
  assert.deepEqual([...legacy.category], ['Men']);
  assert.equal(escapeRegex('Bags (Travel)+'), 'Bags \\(Travel\\)\\+');
});

test('category API lists defaults, creates categories, and handles duplicate or invalid names', async context => {
  const stored: Array<{ name: string; key: string }> = [];
  context.mock.method(Category, 'find', () => queryResult(stored));
  context.mock.method(Category, 'findOneAndUpdate', async () => null);
  context.mock.method(Category, 'create', async (category: { name: string; key: string }) => {
    if (stored.some(item => item.key === category.key)) throw { code: 11000 };
    stored.push(category);
    return category;
  });
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/api/categories`;
    const create = (name: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    assert.deepEqual(await (await fetch(url)).json(), defaultCategories);
    assert.equal((await fetch(url, { method: 'POST' })).status, 400);
    const response = await create('  Travel   Bags  ');
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { name: 'Travel Bags' });
    assert.deepEqual(await (await fetch(url)).json(), [...defaultCategories, 'Travel Bags']);
    for (const name of ['travel bags', ' MEN ']) assert.equal((await create(name)).status, 409);
    for (const name of ['', '   ', null, ['Bags'], 'x'.repeat(61)]) assert.equal((await create(name)).status, 400);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('removal persists for custom and built-in categories, detaches used categories, and allows adding them again', async context => {
  const stored: Array<{ name: string; key: string; isDeleted?: boolean }> = [{ name: 'Bags (Travel)+', key: 'bags (travel)+' }];
  let detached = 0;
  context.mock.method(Category, 'find', () => queryResult(stored));
  context.mock.method(Category, 'findOneAndUpdate', async (
    filter: { key: string; isDeleted?: boolean }, update: { $set: { name: string; isDeleted: boolean } }, options: { upsert?: boolean },
  ) => {
    let record = stored.find(item => item.key === filter.key && (filter.isDeleted === undefined || item.isDeleted === filter.isDeleted));
    if (!record && options.upsert) { record = { key: filter.key, ...update.$set }; stored.push(record); }
    else if (record) Object.assign(record, update.$set);
    return record || null;
  });
  context.mock.method(Product, 'updateMany', async (filter: { category: string }, update: Array<{ $set: { category: { $filter: { cond: { $ne: string[] } } } } }>, options: { collation: unknown }) => {
    assert.equal(typeof filter.category, 'string');
    assert.equal(update[0].$set.category.$filter.cond.$ne[1], filter.category);
    assert.deepEqual(options.collation, { locale: 'en', strength: 2 });
    detached++;
    return { modifiedCount: 2 };
  });
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/api/categories`;
    const remove = (name: string) => fetch(`${url}/${encodeURIComponent(name)}`, { method: 'DELETE' });
    for (const name of ['Men', 'Bags (Travel)+']) {
      assert.equal((await remove(name)).status, 200);
      assert(!(await (await fetch(url)).json() as string[]).includes(name));
      await assert.rejects(parseProductCategories([name]), /do not exist/);
      assert.equal((await remove(name)).status, 404);
      const recreated = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      assert.equal(recreated.status, 201);
      assert((await (await fetch(url)).json() as string[]).includes(name));
      assert.deepEqual(await parseProductCategories([name]), [name]);
    }
    assert.equal((await remove('Unknown')).status, 404);
    assert.equal(detached, 2);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('products save multiple categories, retain selections on edit, and filter by each category', async context => {
  const owner = new mongoose.Types.ObjectId();
  const stored: InstanceType<typeof Product>[] = [];
  context.mock.method(Category, 'find', () => queryResult([{ name: 'Bags (Travel)+', key: 'bags (travel)+' }]));
  context.mock.method(Product.prototype, 'save', async function (this: InstanceType<typeof Product>) {
    await this.validate();
    if (!stored.includes(this)) stored.push(this);
    return this;
  });
  context.mock.method(Product, 'findById', (id: string) => queryResult(stored.find(product => String(product._id) === id)));
  // Match MongoDB's case-insensitive equality behavior for array fields.
  context.mock.method(Product, 'find', (filter: { category?: string; subCategory?: string }) => queryResult(stored.filter(product =>
    (!filter.category || product.category.some(name => name.toLowerCase() === filter.category!.toLowerCase())) &&
    (!filter.subCategory || product.subCategory.toLowerCase() === filter.subCategory.toLowerCase()))));
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}/api/products`;
    const form = new FormData();
    Object.entries({ name: 'Travel bag', description: 'Multi-category test', price: '20', subCategory: 'Bags',
      category: JSON.stringify(['Men', 'Women', 'Bags (Travel)+']), imageUrl: 'https://example.com/bag.jpg',
      variants: JSON.stringify([{ size: 'One Size', stock: 3 }]), user: String(owner) }).forEach(([key, value]) => form.set(key, value));
    const created = await fetch(base, { method: 'POST', body: form });
    assert.equal(created.status, 200);
    const product = await created.json() as { _id: string; category: string[] };
    assert.deepEqual(product.category, ['Men', 'Women', 'Bags (Travel)+']);
    for (const category of product.category) {
      const matches = await (await fetch(`${base}/category/${encodeURIComponent(category)}`)).json() as unknown[];
      assert.equal(matches.length, 1);
    }
    const filtered = await (await fetch(`${base}/filter/Women/Bags`)).json() as unknown[];
    assert.equal(filtered.length, 1);
    const edit = new FormData();
    edit.set('category', '["Women","Bags (Travel)+"]');
    assert.equal((await fetch(`${base}/${product._id}`, { method: 'PUT', body: edit })).status, 200);
    const reloaded = await (await fetch(`${base}/${product._id}`)).json() as { category: string[] };
    assert.deepEqual(reloaded.category, ['Women', 'Bags (Travel)+']);
    assert.deepEqual(await (await fetch(`${base}/category/Men`)).json(), []);
    edit.set('category', '[]');
    assert.equal((await fetch(`${base}/${product._id}`, { method: 'PUT', body: edit })).status, 400);
    form.set('category', '["Unknown"]');
    assert.equal((await fetch(base, { method: 'POST', body: form })).status, 400);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
