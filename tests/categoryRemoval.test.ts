import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import { queryResult } from './helpers/query.js';
import { catalogCollation } from '../utils/productQueries.js';

test('category removal preserves products, hides unassigned products everywhere, and permits reassignment', async context => {
  const make = (category: string | string[]) => ({ _id: new mongoose.Types.ObjectId(), user: new mongoose.Types.ObjectId(), name:'Test', description:'Test', image:'https://example.com/bag.jpg', category, subCategory:'Bags', price:10, isOnSale:true, variants:[{size:'One Size', stock:2}] });
  const products = [make(['Men','Women']), make(['men']), make('MEN'), make(['Accessories'])];
  const categories: Array<{name:string;key:string;isDeleted:boolean}> = [];
  context.mock.method(Category, 'find', () => queryResult(categories));
  context.mock.method(Category, 'findOneAndUpdate', async (_filter: unknown, update: { $set: { name: string; isDeleted: boolean } }) => { categories.push({key:'men', ...update.$set}); return categories[0]; });
  context.mock.method(Product, 'updateMany', async (filter: {category:string}, pipeline: unknown, options: unknown) => {
    assert.deepEqual(filter, {category:'Men'});
    assert.deepEqual(options, {collation:catalogCollation});
    assert.deepEqual(pipeline, [{ $set: { category: { $filter: { input: { $cond: [{ $isArray:'$category' }, '$category', ['$category']] }, as:'category', cond: { $ne:['$$category','Men'] } } } } }]);
    for (const product of products) {
      const assigned = Array.isArray(product.category) ? product.category : [product.category];
      if (assigned.some(name => name.toLowerCase() === 'men')) product.category = assigned.filter(name => name.toLowerCase() !== 'men');
    }
    return {modifiedCount:3};
  });
  context.mock.method(Product, 'find', (filter: Record<string, unknown>) => queryResult(products.filter(product => {
    const assigned = Array.isArray(product.category) ? product.category : [product.category];
    if (typeof filter.category === 'object' && assigned.length === 0) return false;
    if (typeof filter.category === 'string' && !assigned.some(name => name.toLowerCase() === String(filter.category).toLowerCase())) return false;
    return !filter.subCategory || product.subCategory === filter.subCategory;
  })));
  context.mock.method(Product, 'findById', (id: string) => {
    const record = products.find(product => String(product._id) === id);
    const document = record && Product.hydrate(record);
    if (document) document.save = async () => { await document.validate(); Object.assign(record!, document.toObject()); return document; };
    return queryResult(document);
  });
  const server = createApp().listen(0, '127.0.0.1'); await once(server,'listening');
  try {
    const address=server.address(); assert(address && typeof address !== 'string');
    const base=`http://127.0.0.1:${address.port}/api`;
    const list=async (path:string) => await (await fetch(`${base}/products${path}`)).json() as Array<{_id:string;category:string[]}>;
    // Prime every public cache before removing the assignment.
    for (const path of ['', '/sale', '/subcategory/Bags']) assert.equal((await list(path)).length,4);
    await fetch(`${base}/products/homepage`);
    const id=String(products[1]._id);
    assert.equal((await fetch(`${base}/products/${id}`)).status,200);
    assert.equal((await fetch(`${base}/categories/Men`,{method:'DELETE'})).status,200);
    assert.equal(products.length,4);
    assert.deepEqual(products.map(product=>product.category), [['Women'],[],[],['Accessories']]);
    for (const path of ['', '/sale', '/subcategory/Bags']) assert.equal((await list(path)).length,2);
    const homepage=await (await fetch(`${base}/products/homepage`)).json() as Record<string, Array<{category:string[]}>>;
    assert(Object.values(homepage).flat().every(product=>product.category.length>0));
    assert.equal((await fetch(`${base}/products/${id}`)).status,404);
    const checkout = await fetch(`${base}/orders`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({orderItems:[{_id:id,name:'Test',size:'One Size',qty:1}]})});
    assert.equal(checkout.status,404);

    const admin=await fetch(`${base}/products/admin`);
    assert.equal(admin.headers.get('cache-control'),'private, no-store');
    assert.equal((await admin.json() as unknown[]).length,4);
    assert.equal((await fetch(`${base}/products/admin/${id}`)).status,200);
    const form=new FormData(); form.set('category','["Women"]');
    assert.equal((await fetch(`${base}/products/${id}`,{method:'PUT',body:form})).status,200);
    assert.equal((await fetch(`${base}/products/${id}`)).status,200);
    assert.equal((await list('')).length,3);
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); }
});
