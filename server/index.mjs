import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { getPool } from './db.mjs';

const port = Number(process.env.API_PORT || 8787);
const jsonHeaders = { 'content-type': 'application/json; charset=utf-8' };

function send(response, status, body) {
  response.writeHead(status, jsonHeaders);
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  if (!body) return {};
  try { return JSON.parse(body); } catch { throw new Error('Request body must be valid JSON'); }
}

function visitorId(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(value)) {
    throw new Error('A valid visitorId is required');
  }
  return value;
}

async function route(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pool = getPool();

  if (request.method === 'GET' && url.pathname === '/api/health') {
    await pool.query('SELECT 1');
    return send(response, 200, { ok: true });
  }

  if (request.method === 'GET' && url.pathname === '/api/opportunities') {
    const result = await pool.query('SELECT id, title, place, region, category, duration, contribution, capacity, level, image, description, tag FROM opportunities ORDER BY id');
    return send(response, 200, { opportunities: result.rows });
  }

  if (request.method === 'GET' && url.pathname === '/api/state') {
    const id = visitorId(url.searchParams.get('visitorId'));
    const [saved, journey] = await Promise.all([
      pool.query('SELECT opportunity_id FROM saved_experiences WHERE visitor_id = $1 ORDER BY opportunity_id', [id]),
      pool.query('SELECT opportunity_id FROM journey_items WHERE visitor_id = $1 ORDER BY opportunity_id', [id])
    ]);
    return send(response, 200, {
      saved: saved.rows.map((row) => row.opportunity_id),
      joined: journey.rows.map((row) => row.opportunity_id)
    });
  }

  if (request.method === 'PUT' && url.pathname.startsWith('/api/saved/')) {
    const opportunityId = Number(url.pathname.split('/').pop());
    const body = await readJson(request);
    const id = visitorId(body.visitorId);
    if (!Number.isInteger(opportunityId) || typeof body.saved !== 'boolean') throw new Error('Invalid saved experience request');
    if (body.saved) {
      await pool.query('INSERT INTO saved_experiences (visitor_id, opportunity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, opportunityId]);
    } else {
      await pool.query('DELETE FROM saved_experiences WHERE visitor_id = $1 AND opportunity_id = $2', [id, opportunityId]);
    }
    return send(response, 200, { ok: true });
  }

  if (request.method === 'POST' && url.pathname === '/api/journey') {
    const body = await readJson(request);
    const id = visitorId(body.visitorId);
    const opportunityId = Number(body.opportunityId);
    if (!Number.isInteger(opportunityId)) throw new Error('Invalid journey request');
    await pool.query('INSERT INTO journey_items (visitor_id, opportunity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, opportunityId]);
    return send(response, 201, { ok: true });
  }

  return send(response, 404, { error: 'Not found' });
}

const server = createServer((request, response) => {
  route(request, response).catch((error) => {
    console.error('API request failed:', error.message);
    const status = error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('valid JSON') ? 400 : 503;
    send(response, status, { error: status === 503 ? 'Database unavailable' : error.message });
  });
});

server.listen(port, () => console.log(`ARTO API listening on http://localhost:${port}`));

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
