import { createInsertSchema } from "drizzle-orm/zod";
import { posts } from "../db/schema.js";
import { z } from "zod";

export const insertSchema = createInsertSchema(posts, {
  content: z
    .string()
    .trim()
    .min(2, "post content cannot be empty")
    .max(5000, "post content cannot exceed 5000 characters"),
}).omit({
  id: true,
  user_id: true,
  image: true,
  created_at: true,
});



export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment content is required")
    .max(2000, "Comment cannot exceed 2000 characters"),
});