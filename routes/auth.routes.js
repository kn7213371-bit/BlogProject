import express from "express"
import { validateBody } from "../middleware/validateBody.js";
import { authSchema, loginSchema } from "../schema/auth.schema.js";
import { create, getByEmail } from "../queries/auth.queries.js";
import bcrypt from "bcrypt";
import { checkAuth } from "../middleware/checkAuth.js";
 
export const authRouter=express.Router();



authRouter.post("/register",validateBody(authSchema),async (req,res)=>{
    const {email,password,username}= req.body;
    // check email
    const existingUser=await getByEmail(email);

    if(existingUser){
        return res.status(422).json({
        "errors": {
            "email": { "errors": ["email already in use"] },
            "password": { "errors": ["password must contain..."] }
        }

    })
    }

    // hash_password

    const password_hash=await bcrypt.hash(password,10);
    // insert data 
    const insertData=await create({username,email,password_hash})
    // response
    return res.status(201).json({
        "message": "register successful, you can now login" 
    })

});


authRouter.post("/login",validateBody(loginSchema),async(req,res)=>{
    const {email, password}=req.body
    const existingUser=await getByEmail(email);

    if(!existingUser){
        return res.status(404).json({
            error :" User Not found ",
        });
    }

    const isValida= await bcrypt.compare(password,existingUser.password_hash);
    if (!isValida) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    req.session.user = {
  id: existingUser.id,
  username: existingUser.user_name,
  email: existingUser.email,
};

req.session.save((err) => {
  if (err) {
    console.error("Session save error:", err);
    return res.status(500).json({
      error: "Failed to save session",
    });
}});
    return res.status(200).json({
      message: 'login successful',
      data: {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.user_name
        }
      }
    })

});



authRouter.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(401).json({
      error: "No active session",
    });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to logout",
      });
    }

    res.clearCookie("blog-session", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  });
});



authRouter.get("/me",checkAuth,(req, res) => {
  return res.status(200).json({
    data: {
      user: {
        id: req.session.user.id,
        email: req.session.user.email,
        username: req.session.user.username,
      },
    },
  });
});



 