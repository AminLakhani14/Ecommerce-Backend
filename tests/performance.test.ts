import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { ReadCache } from '../utils/readCache.js';
import { catalogCollation } from '../utils/productQueries.js';
import { queryResult } from './helpers/query.js';

test('cache coalesces misses, expires, bounds memory, and does not cache failures', async () => {
  let now = 0;
  const cache = new ReadCache(2, 100, () => now);
  let reads = 0;
  const load = async () => { reads++; return { stock: 3 }; };
  const first = await Promise.all([cache.read('products:a', 10, load), cache.read('products:a', 10, load)]);
  assert.equal(reads, 1);
  assert.deepEqual(first.map(result => result.status), ['MISS', 'COALESCED']);
  assert.equal((await cache.read('products:a', 10, load)).status, 'HIT');
  now = 11;
  assert.equal((await cache.read('products:a', 10, load)).status, 'MISS');
  await cache.read('products:b', 10, load);
  await cache.read('products:c', 10, load);
  assert.equal((await cache.read('products:a', 10, load)).status, 'MISS');
  cache.invalidate('products:');
  assert.equal((await cache.read('products:a', 10, load)).status, 'MISS');
  await cache.read('oversize', 10, async () => 'x'.repeat(101));
  assert.equal((await cache.read('oversize', 10, async () => 'small')).status, 'MISS');
  await assert.rejects(cache.read('failure', 10, async () => { throw new Error('offline'); }));
  assert.equal((await cache.read('failure', 10, load)).status, 'MISS');
});

test('in-flight reads cannot repopulate old inventory after invalidation', async () => {
  const cache = new ReadCache();
  let resolve!: (value: number) => void;
  const old = cache.read('products:a', 1000, () => new Promise<number>(done => { resolve = done; }));
  await Promise.resolve();
  cache.invalidate('products:');
  const fresh = await cache.read('products:a', 1000, async () => 2);
  resolve(1);
  await old;
  assert.equal(fresh.body, '2');
  assert.equal((await cache.read('products:a', 1000, async () => 3)).body, '2');
});

test('homepage queries run concurrently, limit each section, and omit full product descriptions', async context => {
  let active = 0;
  let peak = 0;
  const limits: number[] = [];
  context.mock.method(Product, 'find', () => {
    let limit = 0;
    const query = {
      select: (fields: string) => { assert(!fields.includes('description')); return query; },
      collation: (value: unknown) => { assert.deepEqual(value, catalogCollation); return query; },
      sort: () => query,
      limit: (value: number) => { limit = value; limits.push(value); return query; },
      lean: async () => {
        active++; peak = Math.max(peak, active);
        await new Promise(resolve => setTimeout(resolve, 10));
        active--;
        return Array.from({ length: limit }, () => ({ category: 'Accessories', variants: [] }));
      },
    };
    return query;
  });
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address(); assert(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/api/products/homepage`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const body = await response.json() as Record<string, unknown[]>;
    assert.deepEqual(Object.keys(body), ['children', 'accessories', 'backpacks', 'clothing', 'sale']);
    assert.equal(body.accessories.length, 4);
    assert.equal(peak, 5);
    assert.deepEqual(limits, [5, 4, 4, 4, 5]);
    assert.equal((await fetch(url)).headers.get('x-cache'), 'HIT');
    assert.equal(limits.length, 5);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('product reads use equality and collation, support pagination, gzip, ETags, and mutation invalidation', async context => {
  let reads = 0;
  let stock = 3;
  let skip = 0;
  let limit = 0;
  const productId = String(new mongoose.Types.ObjectId());
  context.mock.method(Product, 'find', (filter: Record<string, unknown>) => {
    reads++;
    assert.equal(filter.category, 'bags (travel)+');
    const query = {
      select: () => query,
      collation: (value: unknown) => { assert.deepEqual(value, catalogCollation); return query; },
      sort: () => query,
      skip: (value: number) => { skip = value; return query; },
      limit: (value: number) => { limit = value; return query; },
      lean: async () => [{ _id: productId, name: 'Test', description: 'x'.repeat(4000), category: 'Bags (Travel)+', variants: [{ size: 'M', stock }] }],
    };
    return query;
  });
  const document = new Product({ _id: productId, name: 'Test', category: ['Bags (Travel)+'] });
  context.mock.method(Product, 'findById', () => queryResult(document));
  context.mock.method(Product, 'deleteOne', async () => { stock = 0; return { deletedCount: 1 }; });
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address(); assert(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}/api/products`;
    const url = `${base}/category/${encodeURIComponent('bags (travel)+')}?page=2&limit=10`;
    const response = await fetch(url, { headers: { 'Accept-Encoding': 'gzip' } });
    assert.equal(response.headers.get('content-encoding'), 'gzip');
    assert.equal(response.headers.get('x-cache'), 'MISS');
    assert.equal(skip, 10); assert.equal(limit, 10);
    const body = await response.json() as Array<{ category: string[] }>;
    assert.deepEqual(body[0].category, ['Bags (Travel)+']);
    const conditional = await fetch(url, { headers: { 'If-None-Match': response.headers.get('etag')!, 'Cache-Control': 'max-age=0' } });
    assert.equal(conditional.status, 304); assert.equal(reads, 1);
    assert.equal((await fetch(url)).headers.get('x-cache'), 'HIT');
    assert.equal((await fetch(`${base}/${productId}`, { method: 'DELETE' })).status, 200);
    const fresh = await fetch(url); assert.equal(fresh.headers.get('x-cache'), 'MISS');
    assert.equal(reads, 2);
    for (const query of ['limit=0', 'limit=101', 'page=-1', 'page=abc']) assert.equal((await fetch(`${base}?${query}`)).status, 400);
    assert.equal((await fetch(`${base}/bad-id`)).status, 400);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('checkout batches catalog reads and stock writes, clears cached inventory, and rejects duplicate demand exceeding stock', async context => {
  const id = new mongoose.Types.ObjectId();
  let stock = 3;
  let reads = 0;
  let writes = 0;
  context.mock.method(Product, 'find', () => { reads++; return queryResult([{ _id: id, category: ['Men'], variants: [{ size: 'M', stock }] }]); });
  context.mock.method(Product, 'bulkWrite', async (operations: unknown[]) => { writes++; assert.equal(operations.length, 2); stock = 1; });
  context.mock.method(Order.prototype, 'save', async function (this: InstanceType<typeof Order>) { return this; });
  const app = createApp();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const previous = process.env.EMAIL_USER; delete process.env.EMAIL_USER;
  try {
    const address = server.address(); assert(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}/api`;
    const cache: ReadCache = app.locals.readCache;
    await cache.read('products:inventory', 10000, async () => stock);
    const item = { _id: String(id), name: 'Test', size: 'M', qty: 1, image: '/test.jpg', price: 10 };
    const body = { orderItems: [item, item], shippingAddress: { firstName: 'Test', email: 'test@example.com' }, paymentMethod: 'Cash on Delivery', totalPrice: 20 };
    const order = await fetch(`${base}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(order.status, 201);
    assert.equal(order.headers.get('cache-control'), 'private, no-store');
    assert.equal(reads, 1); assert.equal(writes, 1);
    assert.equal((await cache.read('products:inventory', 10000, async () => stock)).body, '1');
    const insufficient = await fetch(`${base}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(insufficient.status, 400); assert.equal(writes, 1);
    context.mock.method(User, 'findById', () => queryResult({ _id: id, name: 'Test', email: 'test@example.com', isAdmin: false }));
    assert.equal((await fetch(`${base}/users/profile`)).headers.get('cache-control'), 'private, no-store');
  } finally {
    if (previous !== undefined) process.env.EMAIL_USER = previous;
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
