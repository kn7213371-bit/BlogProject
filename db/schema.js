import { defineRelations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";


export const users=p.pgTable("users",{
    id:p.serial("id").primaryKey(),
    username:p.varchar("username",{length:255}).notNull(),
    email:p.varchar("email",{length:255}).unique(),
    password_hash:p.varchar("password_hash",{length:400}),
    created_at:p.timestamp("created_at").defaultNow().notNull()
});


export const session=p.pgTable("session",{
    id:p.serial("id").primaryKey(),
    session_id:p.varchar("session_id",{length:255}).unique(),
    user_id:p.serial("user_id").references(()=>
        users.id,{onDelete:"cascade"}
    ),
    created_at:p.timestamp("created_at").default(),
    expires_at:p.timestamp("expires_at")
});


export  const posts=p.pgTable("posts",{
    id:p.serial("id").primaryKey(),
    user_id:p.serial("user_id").references(()=>users.id,{
        onDelete:"cascade",
    }),
    image:p.varchar("image",{length:400}),
    created_at:p.timestamp("created_at").defaultNow(),
    content:p.text("content").notNull()
});

export const comments=p.pgTable("comments",{
    id:p.serial("id").primaryKey(),
    user_id:p.serial("user_id").references(()=>users.id,{
        onDelete:"cascade",
    }),
    post_id:p.serial("post_id").references(()=>posts.id,{
        onDelete:"cascade",
    }),
    created_at:p.timestamp("created_at").defaultNow(),
    content:p.text("content").notNull()
});

export const likes=p.pgTable("likes",{
    user_id:p.serial("user_id").references(()=>users.id,{
        onDelete:"cascade",
    }),
    post_id:p.serial("post_id").references(()=>posts.id,{
        onDelete:"cascade",
    }),
    created_at:p.timestamp("created_at").defaultNow()
},(table)=>[
    p.primaryKey({columns:[
        table.user_id,
        table.post_id
    ]})
]
);


export const relation=defineRelations({users,posts,session,comments,likes},(r)=>({
    session:{
        user:r.one.users({
            from:r.session.user_id,
            to:r.users.id
        })
    },
    users:{
        session:r.many.session(),
        post:r.many.posts(),
        comment:r.many.comments(),
        like:r.many.likes()
        
    },
    posts:{
        user:r.one.users({
            from:r.posts.user_id,
            to:r.users.id
        }),
        comment:r.many.comments(),
        like:r.many.likes()
    },
    comments:{
        user:r.one.users({
            from:r.comments.user_id,
            to:r.users.id
        }),
        post:r.one.posts({
            from:r.comments.user_id,
            to:r.posts.id
        }),
    },
    likes:{
        user:r.one.users({
            from:r.likes.user_id,
            to:r.users.id
        }),
        post:r.one.posts({
            from:r.likes.post_id,
            to:r.posts.id
        })
    }

}))

