import { Pool, PoolClient, QueryResult } from "pg";
import { config } from "./env";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

pool.on("connect", () => {
  // Connected idle PG client
});

pool.on("error", (err: Error) => {
  console.error("🔥 [PostgreSQL Pool Fatal Error]: Unexpected error on idle PG client:", err);
});

export const query = async (text: string, params?: any[]): Promise<QueryResult<any>> => {
  try {
    return await pool.query(text, params);
  } catch (err: any) {
    console.error("❌ [Database Query Failure]");
    console.error("Query SQL:", text.replace(/\s+/g, " ").trim());
    console.error("Parameters:", params);
    console.error("Database Error Code:", err.code, "-", err.message);
    throw err;
  }
};

export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (e: any) {
    console.error("❌ [Database Transaction Aborted & Rolled Back]:", e.message || e);
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
