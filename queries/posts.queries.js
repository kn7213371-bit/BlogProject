import { eq,sql,desc,and } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, likes, posts, users } from "../db/schema.js";


export async function getAllPosts(currentUserId){
    const data=db.select({
        id:posts.id,
        content:posts.content,
        created_at:posts.created_at,
        username:users.username,
        image:posts.image,

        like_count:sql`
        (
        select count(*) 
        from ${likes}
        where ${likes.post_id}=${posts.id}
        )`.mapWith(Number),

        comment_count:sql`
        (
        select count(*)
        from ${comments}
        where ${comments.post_id}=${posts.id}
        )`.mapWith(Number),

        likes_by_me:sql`
        exists(
        select 1
        from ${likes}
        where ${likes.post_id}=${posts.id}
        and ${likes.user_id}=${currentUserId ?? null}

        )`.mapWith(Boolean)

    }).from(posts).innerJoin(users,eq(posts.user_id,users.id))
    .orderBy(desc(posts.created_at));

    return data;
}


export async function createPost(user_id, content, image = null) {
  const data = await db
    .insert(posts)
    .values({
      user_id,
      content,
      image: image ?? null,
    })
    .returning({
      id: posts.id,
      user_id: posts.user_id,
      content: posts.content,
      image: posts.image,
      created_at: posts.created_at,
    });

  return data[0];
}

export async function getByIdPosts(post_id, user_id) {
  const [data] = await db
    .select({
      id: posts.id,
      content: posts.content,
      created_at: posts.created_at,
      username: users.username,
      image: posts.image,

      like_count: sql`
        (
          SELECT COUNT(*)
          FROM ${likes}
          WHERE ${likes.post_id} = ${posts.id}
        )
      `.mapWith(Number),

      comment_count: sql`
        (
          SELECT COUNT(*)
          FROM ${comments}
          WHERE ${comments.post_id} = ${posts.id}
        )
      `.mapWith(Number),

      liked_by_me: user_id
        ? sql`EXISTS (
            SELECT 1
            FROM ${likes}
            WHERE ${likes.post_id} = ${posts.id}
              AND ${likes.user_id} = ${user_id}
          )`.mapWith(Boolean)
        : sql`false`.mapWith(Boolean),
    })
    .from(posts)
    .innerJoin(users, eq(posts.user_id, users.id))
    .where(eq(posts.id, Number(post_id)))
    .limit(1);

  if (!data) {
    return null;
  }

  const postComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(eq(comments.post_id, Number(post_id)));

  return {
    post: data,
    comments: postComments,
  };
}




export async function createdLike(post_id, user_id) {
  // 1. نتأكد إن الـ Post موجود
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, Number(post_id)))
    .limit(1);

  if (!post) {
    return null;
  }

  // 2. نشوف هل المستخدم عمل Like قبل كده
  const [existingLike] = await db
    .select({ post_id: likes.post_id })
    .from(likes)
    .where(
      and(
        eq(likes.post_id, Number(post_id)),
        eq(likes.user_id, Number(user_id))
      )
    )
    .limit(1);

  let liked;

  // 3. لو عامل Like نحذفه، وإلا نضيفه
  if (existingLike) {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.post_id, Number(post_id)),
          eq(likes.user_id, Number(user_id))
        )
      );

    liked = false;
  } else {
    await db.insert(likes).values({
      post_id: Number(post_id),
      user_id: Number(user_id),
    });

    liked = true;
  }

  // 4. نحسب عدد الـ Likes بعد التغيير
  const [result] = await db
    .select({
      like_count: sql`count(*)`.mapWith(Number),
    })
    .from(likes)
    .where(eq(likes.post_id, Number(post_id)));

  return {
    liked,
    like_count: result.like_count,
  };
}




export async function createComments(post_id, user_id, content) {
  // 1. نتأكد إن الـ Post موجود
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, Number(post_id)))
    .limit(1);

  if (!post) {
    return null;
  }

  // 2. نضيف الـ Comment
  const [comment] = await db
    .insert(comments)
    .values({
      post_id: Number(post_id),
      user_id: Number(user_id),
      content: content.trim(),
    })
    .returning({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
    });

  // 3. نجيب اسم المستخدم
  const [result] = await db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(eq(comments.id, comment.id))
    .limit(1);

  return result;
}

