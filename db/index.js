import { drizzle } from "drizzle-orm/node-postgres";
import {Pool} from "pg";

process.loadEnvFile()
export const pool= new Pool({
    connectionString:process.env.DATABASE_URL
});

export const db = drizzle({
    client:pool
});

export async function connectDB() {
    try{
    const client = await pool.connect();

    console.log("Database connected successfully");

    client.release();
    }catch(err){
    console.error("Database connection failed: ", err.message);
    process.exit(1);
    }
}
