import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import {randomBytes} from "node:crypto";
import {pool} from "../db/index.js";




const PgSessionStore=connectPgSimple(session);



export const sessionMiddleware = session({
  name: "blog-session",
  secret: process.env.SESSION_SECRET,

  store: new PgSessionStore({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: false,
  }),

  genid: () => randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});
