import z from "zod";

const regexPass=/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

export const authSchema=z.object({
username:z.string().min(2),
email:z.email("valid email"),
password:z.string().min(8,"must have uppercase, lowercase, digit, special char").regex(regexPass),
password_confirmation:z.string().min(8,"must have uppercase, lowercase, digit, special char").regex(regexPass)
}).refine((date)=>
    date.password === date.password_confirmation,
    {
        errors:"Password  do not Match",
        path:["password_confirmation"]
    }
);

export const loginSchema=z.object({
    email:z.email("valid email"),
    password:z.string().min(8,"must have uppercase, lowercase, digit, special char").regex(regexPass)

})