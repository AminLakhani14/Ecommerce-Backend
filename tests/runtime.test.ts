import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import generateToken from '../utils/generateToken.js';

test('Express starts on Node 26 with routes, uploads, and CORS intact', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    const health = await fetch(base, { headers: { Origin: 'http://localhost:3000' } });
    assert.equal(await health.text(), 'AG-Store API is running...');
    assert.equal(health.headers.get('access-control-allow-origin'), 'http://localhost:3000');
    assert.equal(health.headers.get('access-control-allow-credentials'), 'true');
    const preflight = await fetch(`${base}/api/products`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(preflight.status, 204);
    assert.equal((await fetch(`${base}/uploads/missing-test-image.jpg`)).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('Mongoose schemas and password methods load without a database', async () => {
  const user = new User({ name: 'Test', email: 'test@example.com' });
  assert.equal(await user.matchPassword('anything'), false);
  assert.equal(user.validateSync(), undefined);
  assert(Product.schema.path('variants'));
  assert(Order.schema.path('shippingAddress'));
});

test('JWT signing remains compatible with the new runtime', () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'runtime-test-secret';
  try {
    const token = generateToken('user-123');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    assert(typeof payload !== 'string');
    assert.equal(payload.userId, 'user-123');
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  }
});
