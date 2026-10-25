import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";


export async function getAll() {
    
    const data= await db.select({
        user_name:users.username,
        email:users.email
        })
        .from(users);

    return data
}

export async function getById(id) {
    const data= await db.select({
        user_name : users.username,
        email:users.email
})
    .from(users).where(eq(users.id,Number(id))).limit(1);

    return data[0];
    
}


export async function getByEmail(email) {
 const data = await db.select({
    id:users.id,
    user_name : users.username,
    email:users.email,
    password_hash:users.password_hash
 }).from(users).where(eq(users.email,email)).limit(1);
 
 return data[0];
}


export async function create({username,email,password_hash}) {
    const data =await db.insert(users).values({username,email,password_hash}).returning(
        {
        id: users.id,
        username: users.username,
        email: users.email
        }
    );

    return data[0];
}





