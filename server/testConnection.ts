import 'dotenv/config';
import pkg from 'pg';

const { Client } = pkg;

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Database connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("⏰ Server time:", res.rows[0]);
  } catch (error) {
    console.error("❌ Database connection error:", error);
  } finally {
    await client.end();
  }
}

testConnection();
