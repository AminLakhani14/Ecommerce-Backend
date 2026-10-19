import { performance } from 'node:perf_hooks';

const base = process.env.BENCHMARK_API_URL || 'http://localhost:5000';
const samples = Math.min(50, Math.max(2, Number(process.env.BENCHMARK_SAMPLES) || 10));
const paths = ['/api/products/homepage', '/api/products', '/api/products/category/accessories',
  '/api/products/filter/Accessories/Sunglasses', '/api/products/sale', '/api/categories'];
const results = [];
for (const path of paths) {
  const timings: number[] = [];
  const cache: Array<string | null> = [];
  let jsonBytes = 0;
  let encoding: string | null = null;
  for (let index = 0; index < samples; index++) {
    const start = performance.now();
    const response = await fetch(`${base}${path}`, { headers: { 'Accept-Encoding': 'gzip' }, signal: AbortSignal.timeout(30000) });
    const body = await response.text();
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    timings.push(Number((performance.now() - start).toFixed(2)));
    cache.push(response.headers.get('x-cache'));
    jsonBytes = Buffer.byteLength(body);
    encoding = response.headers.get('content-encoding');
  }
  const sorted = [...timings].sort((a, b) => a - b);
  const hits = timings.filter((_timing, index) => cache[index] === 'HIT').sort((a, b) => a - b);
  results.push({ path, milliseconds: timings, medianMs: sorted[Math.floor(sorted.length / 2)],
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
    missMs: timings.filter((_timing, index) => cache[index] === 'MISS'),
    warmMedianMs: hits.length ? hits[Math.floor(hits.length / 2)] : null,
    warmP95Ms: hits.length ? hits[Math.ceil(hits.length * 0.95) - 1] : null,
    cache, jsonBytes, encoding });
}
console.log(JSON.stringify({ measuredAt: new Date().toISOString(), base, results }, null, 2));
