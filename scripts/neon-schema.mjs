import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

// One source of truth for models; only the deployment datasource differs.
const source = readFileSync(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
const schema = source.replace('provider = "sqlite"', 'provider = "postgresql"')
  .replace('url      = env("DATABASE_URL")', 'url      = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")');
mkdirSync(new URL('../prisma/neon/', import.meta.url), { recursive: true });
writeFileSync(new URL('../prisma/neon/schema.prisma', import.meta.url), schema);
console.log('Prepared the Neon PostgreSQL schema from the local model definitions.');
