import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema, registerSchema } from "./authSchema";
import { prisma } from "../../utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { HTTPException } from "hono/http-exception";

export const authRouter = new Hono()
    .post("/register", zValidator("json", registerSchema), async (c) => {
        const body = c.req.valid("json")
        try {
            //1.validasi apakah user sudah pernah didaftarkan
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: body.username
                }})
            if (existingUser) throw new Error("Username already exists")
            
            //2.create new user
            const hashedPassword = await bcrypt.hash(body.password, 10)
            const newUser = await prisma.user.create({
                data: {
                    username: body.username,
                    password: hashedPassword
                }, 
                select: {id: true, username:true, created_at:true}
            })
            return c.json({
                success: true,
                data: newUser
            })
        } catch (error) {
            throw new HTTPException(401, {
                message: error instanceof Error ? error.message: "Invalid credential"
            })
        }
    })
    .post("/login", zValidator("json", loginSchema), async (c) => {
        const body = c.req.valid("json")
        try {
            //1-a. cek ada tidak nama usernya
            const existingUser = await prisma.user.findFirst({
                where: { username: body.username }, 
            })
            //1-b.jika salah kirim pesan eror
            if (!existingUser) throw new Error("Invalid credential")
            
            //2-a. cek apakah user dan passwordnya sesuai
            const validPassword = await bcrypt.compare(
                body.password , existingUser.password
            )

            //2-b. jika salah kirim pesan error
            if (!validPassword) throw new Error("Invalid credential")
            
            //3. jika benar berikan token 
            const accessToken = jwt.sign(
                { id: existingUser.id },
                process.env.JWT_SECRET!,
                {expiresIn:"1d"}
            )
            return c.json({
                success: true,
                data: {
                    id: existingUser.id,
                    username: existingUser.username
                },
                token:accessToken
            }, 200)
        } catch (error) {
            throw new HTTPException(401, {
                message: error instanceof Error ? error.message : "Invalid Credential",
            })
            
        }
})