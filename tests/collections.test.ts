import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import mongoose from 'mongoose';
import products from '../data/collectionProducts.js';
import Product from '../models/productModel.js';
import { createApp } from '../app.js';

test('catalog has ten valid, distinct products per requested category with remote image URLs', async () => {
  const owner = new mongoose.Types.ObjectId();
  for (const category of ['Accessories', 'Backpacks', 'Clothing']) {
    const collection = products.filter(product => product.category === category);
    assert.equal(collection.length, 10);
    assert.equal(new Set(collection.map(product => product.name)).size, 10);
    for (const product of collection) {
      await new Product({ ...product, user: owner }).validate();
      assert.equal(new URL(product.image).protocol, 'https:');
      assert.equal(product.countInStock, product.variants.reduce((total, variant) => total + variant.stock, 0));
    }
  }
});

test('admin product creation accepts remote images without uploads and rejects invalid URLs', async (context) => {
  context.mock.method(Product.prototype, 'save', async function (this: InstanceType<typeof Product>) {
    await this.validate();
    return this;
  });
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/api/products`;
    const form = new FormData();
    form.set('name', 'Test Backpack');
    form.set('category', 'Backpacks');
    form.set('subCategory', 'Backpacks');
    form.set('description', 'Product image URL test');
    form.set('price', '2499');
    form.set('variants', JSON.stringify([{ size: 'One Size', stock: 12 }]));
    form.set('imageUrl', 'file:///private/image.jpg');
    assert.equal((await fetch(url, { method: 'POST', body: form })).status, 400);
    form.set('imageUrl', 'https://images.example.com/backpack.jpg');
    const response = await fetch(url, { method: 'POST', body: form });
    assert.equal(response.status, 200);
    const result: { image: string; category: string } = await response.json();
    assert.equal(result.image, 'https://images.example.com/backpack.jpg');
    assert.equal(result.category, 'Backpacks');
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
