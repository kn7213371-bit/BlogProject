import { defineConfig } from "drizzle-kit";

process.loadEnvFile();
export default defineConfig({
    dialect:"postgresql",
    schema:"./db/schema.js",
    out:"./drizzle",
    dbCredentials:{
        url:process.env.DATABASE_URL
    }
})