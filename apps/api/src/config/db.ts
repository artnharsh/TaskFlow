import { Pool, PoolClient, QueryResult } from "pg";
import { config } from "./env";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("PostgreSQL pool connected");
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle PG client", err);
});

export const query = (text: string, params?: any[]): Promise<QueryResult<any>> => {
  return pool.query(text, params);
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
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
