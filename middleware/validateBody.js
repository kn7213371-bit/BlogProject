import z from "zod";


export function validateBody(schema){
    return (req,res,next)=>{
        const result = schema.safeParse(req.body)

        if(!result.success){
            return res.status(422).json({
                errors:z.treeifyError(result.error).properties
            })
        }
        req.body=result.data
        next();
    }
}