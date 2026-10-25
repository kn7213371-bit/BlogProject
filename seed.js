import { seed, reset } from "drizzle-seed";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

async function main() {
  // مسح البيانات القديمة من الجداول الموجودة في schema
  await reset(db, schema);
  console.log("All schemas reset successfully!");

  // توليد بيانات تجريبية لكل الجداول
  await seed(db, schema, { seed: 12345 }).refine((f) => ({
    users: {
      count: 5,
      columns: {
        username: f.valuesFromArray({
          values: ["karim", "ahmed", "mohamed", "ali", "omar"],
        }),
        email: f.valuesFromArray({
          values: [
            "karim@example.com",
            "ahmed@example.com",
            "mohamed@example.com",
            "ali@example.com",
            "omar@example.com",
          ],
        }),
      },
    },

    posts: {
      count: 10,
      columns: {
        content: f.valuesFromArray({
          values: [
            "Learning Node.js",
            "Learning Express.js",
            "Learning Drizzle ORM",
            "Building Inkwell",
          ],
        }),
      },
    },

    comments: {
      count: 10,
      columns: {
        content: f.valuesFromArray({
          values: [
            "Great post!",
            "Very helpful.",
            "Thanks for sharing!",
          ],
        }),
      },
    },

    likes: {
      count: 10,
    },

    session: {
      count: 5,
    },
  }));

  console.log("All schemas seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });

  