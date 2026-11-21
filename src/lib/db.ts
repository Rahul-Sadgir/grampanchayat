import { Pool, QueryResult, QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:123A45n6@127.0.0.1:5432/gram_panchayat_db";

const isLocal =
  !connectionString ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("localhost");

export const pool =
  global.pgPool ||
  new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: isLocal ? 20 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    options: "-c search_path=public",
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}

const KNOWN_TABLES = [
  "villages",
  "users",
  "services",
  "forms",
  "applications",
  "notices",
  "schemes",
  "projects",
  "representatives",
  "events",
  "rti_spendings",
];

const tableRegex = new RegExp(
  `\\b(FROM|JOIN|UPDATE|INTO|TABLE)(\\s+)(?!(?:public|information_schema|pg_catalog)\\.)([a-z0-9_]+)`,
  "gi"
);

export function qualifyQuery(sql: string): string {
  if (!sql) return sql;
  return sql.replace(tableRegex, (match, keyword, space, tableName) => {
    if (KNOWN_TABLES.includes(tableName.toLowerCase())) {
      return `${keyword}${space}public.${tableName}`;
    }
    return match;
  });
}

// Convert snake_case database row to camelCase and ensure _id exists for backward compatibility
export function mapRow<T = any>(row: any): T {
  if (!row || typeof row !== "object") return row;

  const mapped: any = {};
  for (const [key, value] of Object.entries(row)) {
    // Convert snake_case key to camelCase
    const camelKey = key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
    mapped[camelKey] = value;
    // Also keep original key for direct access
    mapped[key] = value;
  }

  // Ensure _id exists matching id for seamless compatibility
  if (mapped.id && !mapped._id) {
    mapped._id = mapped.id;
  }

  return mapped as T;
}

export function mapRows<T = any>(rows: any[]): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => mapRow<T>(r));
}

// Execute query and return full result
export async function dbQuery<R extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<R>> {
  const start = Date.now();
  const qualifiedText = qualifyQuery(text);
  try {
    const res = await pool.query<R>(qualifiedText, params);
    return res;
  } catch (error) {
    console.error("[PostgreSQL Query Error]:", { text: qualifiedText, params, error });
    throw error;
  }
}

// Execute query and return mapped single row or null
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const res = await dbQuery(text, params);
  if (!res.rows || res.rows.length === 0) return null;
  return mapRow<T>(res.rows[0]);
}

// Execute query and return mapped array of rows
export async function queryMany<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const res = await dbQuery(text, params);
  return mapRows<T>(res.rows);
}

