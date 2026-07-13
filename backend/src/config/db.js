const { Pool } = require("pg");
const config = require("./env");

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.log("Unexpected PostgresSQL pool error: ", err);
});

const query = (text, params) => pool.query(text, params);

const withTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  withTransaction,
};
