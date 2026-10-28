# ARTO — AI-Driven Regenerative Tourism Orchestrator

A responsive React + TypeScript + Vite website prototype based on the ARTO project documentation.

## Included in this frontend prototype

- Discovery page for community-approved regenerative activities
- Search and category filters
- Activity detail modal and “add to my journey” interaction
- Saved experiences
- Journey page
- Regeneration Report with visible verification statuses
- Community co-governance and cultural integrity information
- Responsive desktop, tablet and mobile layouts

## Run on Kali Linux

```bash
cd "ARTO Yoga"
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173/`.

To access it from another device on the same Wi-Fi/hotspot, use the network URL printed by Vite after running `npm run dev`.

## Important prototype notes

- Activity records and impact-report examples are demonstration content, not live bookings or independently verified impact.
- The project now includes an optional PostgreSQL API for opportunities, saved experiences, and journey items. PostgreSQL credentials stay server-side in `.env` and are never exposed to Vite.
- Real impact claims should be backed by evidence and community validation, as described in the ARTO documentation.
- Images are loaded from Unsplash and therefore need an internet connection. Replace them with locally licensed images for an offline deployment.

## PostgreSQL setup

Copy `.env.example` to `.env` and replace the placeholder connection string with your PostgreSQL connection details. Do not commit `.env`.

```bash
cp .env.example .env
corepack npm run db:migrate
corepack npm run dev:api
corepack npm run dev
```

Verify the API and database connection with:

```bash
corepack npm run db:health
```

The migration uses `CREATE TABLE IF NOT EXISTS`, inserts only missing opportunity records, and does not delete or overwrite existing rows. The frontend falls back to its bundled prototype data if the API or database is unavailable.
