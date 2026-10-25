import express from "express";
import { createComments, createdLike, createPost, getAllPosts, getByIdPosts } from "../queries/posts.queries.js";
import { uploadImage } from "../middleware/uploadImage.js";
import { checkAuth } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { commentSchema, insertSchema } from "../schema/posts.schema.js";

export const postsRouter=express.Router();

postsRouter.get("/",async(req,res)=>{

    const currentUserId=req.session?.users?.id;

    const result = await getAllPosts(currentUserId);

    return res.status(200).json({
        data:result
    });

});

postsRouter.post("/", checkAuth ,
uploadImage("image"), 
validateBody(insertSchema) ,
async(req,res)=>{
    const user_id=req.session.user.id;
    const content=req.body.content;
    const image = req.file?.filename ?? null;
    
    const data =await createPost(user_id,content,image);

    return res.status(201).json({
        message: "post created successfully",
        data:data
    });

});


postsRouter.get("/:id",checkAuth,async(req,res)=>{
    const post_id=Number(req.params.id);

    const user_id=req.session?.user?.id;

    const result=await getByIdPosts(post_id,user_id);

    if(!result){
        return res.status(404).json({
            error:"post not found",
        })
    }

    return res.status(200).json({
        data:result
    })
});


postsRouter.post("/:id/like",checkAuth,async(req,res)=>{
    const post_id=req.params.id;
    const user_id=req.session?.user?.id;


    const data=await createdLike(post_id,user_id);

    if(!data){
        return res.status(404).json({
            error:"post not found"
        })
    }


    return res.status(200).json({
        data:data
    })
})

postsRouter.post("/:id/comments",validateBody(commentSchema),async(req,res)=>{
    const post_id=req.params.id;
    const user_id=req.session?.user?.id;
    const content=req.body.content;

    const data=await createComments(post_id,user_id,content)

    if(!data){
        return res.status(404).json({
            error:"post not found"
        });
    }


    return res.status(201).json({
       message: "comment created successfully",
       data:data
    })
})


